import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { queryDb, pool } from './db/pg.js';
import { JWT_SECRET, USER_TOKEN } from './db/secret.js';

export const TENANT_AUTH_COOKIE = 'tenant_session_token';

// ============================================================================
// 1. PASSWORD & JWT UTILITIES
// ============================================================================

export async function hashPassword(password) {
  if (!password) return '';
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (isMatch) return true;
  } catch (_) {}
  return password === hashedPassword;
}

export function generateTenantToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyTenantToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_) {
    return null;
  }
}

// ============================================================================
// 2. DOMAIN & TENANT RESOLUTION (Resolves website by subdomain or custom domain)
// ============================================================================

export async function resolveWebsiteFromRequest(req, optionalSlug = null) {
  try {
    let slug = optionalSlug;

    // 1. Check if slug provided in URL search params
    if (!slug && req && req.url) {
      try {
        const parsedUrl = new URL(req.url);
        slug = parsedUrl.searchParams.get('slug') || parsedUrl.searchParams.get('subdomain');
      } catch (_) {}
    }

    // 2. Check Host / x-forwarded-host header if no explicit slug provided
    if (!slug && req && req.headers) {
      const host = (
        (typeof req.headers.get === 'function' ? req.headers.get('x-forwarded-host') || req.headers.get('host') : null) ||
        (req.headers['x-forwarded-host'] || req.headers['host']) ||
        ''
      ).toLowerCase().split(':')[0]; // strip port

      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        // First check custom_domain match
        const customRes = await queryDb(
          'SELECT * FROM websites WHERE LOWER(custom_domain) = $1 LIMIT 1',
          [host]
        );
        if (customRes.rows.length > 0) {
          return await enrichWebsiteRecord(customRes.rows[0]);
        }

        // Check if host is a subdomain (e.g., mysite.domain.com -> mysite)
        const parts = host.split('.');
        if (parts.length > 2) {
          slug = parts[0];
        }
      }
    }

    // 3. Query by slug / subdomain or ID
    let website = null;
    if (slug) {
      const cleanSlug = String(slug).toLowerCase().trim();
      const isNumeric = !isNaN(Number(cleanSlug));

      if (isNumeric) {
        const numRes = await queryDb('SELECT * FROM websites WHERE id = $1 LIMIT 1', [Number(cleanSlug)]);
        if (numRes.rows.length > 0) website = numRes.rows[0];
      }

      if (!website) {
        const subRes = await queryDb(
          'SELECT * FROM websites WHERE LOWER(subdomain) = $1 OR LOWER(custom_domain) = $1 LIMIT 1',
          [cleanSlug]
        );
        if (subRes.rows.length > 0) website = subRes.rows[0];
      }
    }

    // Fallback: Return first published or active website for local preview/development
    if (!website) {
      const fallbackRes = await queryDb('SELECT * FROM websites ORDER BY id ASC LIMIT 1');
      if (fallbackRes.rows.length > 0) website = fallbackRes.rows[0];
    }

    if (!website) return null;

    return await enrichWebsiteRecord(website);
  } catch (err) {
    console.error('Error resolving website:', err);
    return null;
  }
}

// Helper: load settings and active modules for the website
async function enrichWebsiteRecord(website) {
  const websiteId = website.id;

  const [settingsRes, modulesRes] = await Promise.all([
    queryDb('SELECT * FROM tenant_settings WHERE website_id = $1 LIMIT 1', [websiteId]).catch(() => ({ rows: [] })),
    queryDb('SELECT * FROM tenant_modules WHERE website_id = $1 ORDER BY id ASC', [websiteId]).catch(() => ({ rows: [] })),
  ]);

  const settings = settingsRes.rows[0] || {
    site_title: website.name,
    primary_color: website.theme_config?.primaryColor || '#6366f1',
    font_family: website.theme_config?.fontFamily || 'Inter',
  };

  const modules = modulesRes.rows;

  return {
    ...website,
    settings,
    modules,
  };
}

// ============================================================================
// 3. TENANT USER SESSION & MULTI-ROLE PERMISSIONS
// ============================================================================

export async function getTenantUserSession(req, websiteId) {
  try {
    let token = null;

    if (req) {
      if (req.cookies && typeof req.cookies.get === 'function') {
        const c = req.cookies.get(TENANT_AUTH_COOKIE) || req.cookies.get(USER_TOKEN);
        token = typeof c === 'string' ? c : c?.value;
      }
      if (!token && req.headers) {
        const auth = typeof req.headers.get === 'function' ? req.headers.get('authorization') : req.headers['authorization'];
        if (auth && auth.startsWith('Bearer ')) {
          token = auth.slice(7).trim();
        }
      }
    }

    if (!token) return null;
    const decoded = verifyTenantToken(token);
    if (!decoded || !decoded.userId) return null;

    const userRes = await queryDb(
      `SELECT u.id, u.website_id, u.name, u.email, u.phone, u.avatar_url, u.is_active
       FROM tenant_users u
       WHERE u.id = $1 AND u.website_id = $2 AND u.is_active = TRUE
       LIMIT 1`,
      [decoded.userId, websiteId]
    );

    if (userRes.rows.length === 0) return null;
    const user = userRes.rows[0];

    // Fetch multi-roles and aggregated permissions
    const { roles, permissions, permissionSlugs } = await getUserRolesAndPermissions(websiteId, user.id);

    return {
      ...user,
      roles,
      permissions,
      permissionSlugs,
      isOwner: roles.some((r) => r.slug === 'owner'),
      isAdmin: roles.some((r) => r.slug === 'admin' || r.slug === 'owner'),
    };
  } catch (err) {
    console.error('getTenantUserSession error:', err);
    return null;
  }
}

export async function getUserRolesAndPermissions(websiteId, userId) {
  try {
    // 1. Get all roles assigned to user via tenant_user_roles
    const rolesRes = await queryDb(
      `SELECT r.id, r.name, r.slug, r.description, r.is_system
       FROM tenant_user_roles ur
       JOIN tenant_roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1 AND r.website_id = $2`,
      [userId, websiteId]
    );

    const roles = rolesRes.rows;
    if (roles.length === 0) {
      return { roles: [], permissions: [], permissionSlugs: [] };
    }

    const roleIds = roles.map((r) => r.id);

    // 2. Get all permissions mapped to any of these roles
    const permsRes = await queryDb(
      `SELECT DISTINCT p.id, p.name, p.slug, p.action, p.module_id, m.slug AS module_slug
       FROM tenant_role_permissions rp
       JOIN tenant_permissions p ON rp.permission_id = p.id
       LEFT JOIN tenant_modules m ON p.module_id = m.id
       WHERE rp.role_id = ANY($1::int[]) AND p.website_id = $2`,
      [roleIds, websiteId]
    );

    const permissions = permsRes.rows;
    const permissionSlugs = permissions.map((p) => p.slug);

    return {
      roles,
      permissions,
      permissionSlugs,
    };
  } catch (err) {
    console.error('getUserRolesAndPermissions error:', err);
    return { roles: [], permissions: [], permissionSlugs: [] };
  }
}

// Check if user has permission on a module for a given action
export function hasPermission(user, moduleSlug, action = 'view') {
  if (!user) return false;
  if (user.isOwner) return true;

  const permissionSlugs = user.permissionSlugs || [];
  // Direct permission match
  if (permissionSlugs.includes(`${moduleSlug}.${action}`)) return true;
  // Manage wildcard for the module
  if (permissionSlugs.includes(`${moduleSlug}.manage`)) return true;
  // All manage
  if (permissionSlugs.includes('*.manage') || permissionSlugs.includes('all.manage')) return true;

  return false;
}

export function canAccessModule(user, moduleSlug) {
  return hasPermission(user, moduleSlug, 'view') || hasPermission(user, moduleSlug, 'manage');
}
