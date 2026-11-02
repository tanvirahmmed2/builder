import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { queryDb, pool } from '@/lib/db/pg';
import { JWT_SECRET, USER_TOKEN, BASE_URL } from '@/lib/db/secret';

export const WEBSITE_AUTH_COOKIE = 'website_session_token';

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

export function generateWebsiteToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyWebsiteToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_) {
    return null;
  }
}

// ============================================================================
// 2. DOMAIN NORMALIZATION & RESOLUTION HELPERS
// ============================================================================

/**
 * Normalizes a raw domain or host string by stripping protocol, path, port,
 * and trailing characters, converting to lowercase.
 */
export function normalizeDomain(domain) {
  if (!domain || typeof domain !== 'string') return '';
  const clean = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split('?')[0]
    .split(':')[0];
  return clean.trim();
}

/**
 * Checks if the given domain corresponds to the core SaaS platform.
 * (e.g., matching BASE_URL, localhost, 127.0.0.1)
 */
export function isBaseSaasDomain(rawDomain, baseDomain = BASE_URL) {
  const norm = normalizeDomain(rawDomain);
  if (!norm) return false;

  const isLocalHost = (
    norm === 'localhost' ||
    norm === '127.0.0.1' ||
    norm === '0.0.0.0' ||
    norm === '::1'
  );
  if (isLocalHost) return true;

  const base = normalizeDomain(baseDomain);
  if (base) {
    if (norm === base || norm === `www.${base}`) return true;

    const normWithoutWww = norm.replace(/^www\./, '');
    const baseWithoutWww = base.replace(/^www\./, '');
    if (normWithoutWww === baseWithoutWww) return true;
  }

  return false;
}

/**
 * Classifies an incoming host into Base SaaS, Subdomain, or Custom Domain.
 */
export function parseDomainInfo(rawHost, baseDomain = BASE_URL) {
  const norm = normalizeDomain(rawHost);
  if (!norm) {
    return { isBaseDomain: false, isSubdomain: false, isCustomDomain: false, slug: null };
  }

  const base = normalizeDomain(baseDomain);
  const baseWithoutWww = base ? base.replace(/^www\./, '') : '';

  // Check if it's the core SaaS domain
  if (isBaseSaasDomain(norm, base)) {
    return { isBaseDomain: true, isSubdomain: false, isCustomDomain: false, slug: null };
  }

  // Check if it's a subdomain of the base domain
  if (baseWithoutWww && norm.endsWith(`.${baseWithoutWww}`)) {
    const sub = norm.slice(0, -(baseWithoutWww.length + 1)).toLowerCase();
    if (sub && sub !== 'www') {
      return { isBaseDomain: false, isSubdomain: true, isCustomDomain: false, slug: sub };
    }
    return { isBaseDomain: true, isSubdomain: false, isCustomDomain: false, slug: null };
  }

  // Check if it's a subdomain of localhost in local dev (e.g., shop.localhost)
  if (norm.endsWith('.localhost')) {
    const sub = norm.slice(0, -'.localhost'.length).toLowerCase();
    if (sub && sub !== 'www') {
      return { isBaseDomain: false, isSubdomain: true, isCustomDomain: false, slug: sub };
    }
    return { isBaseDomain: true, isSubdomain: false, isCustomDomain: false, slug: null };
  }

  // Otherwise, treat as a custom domain
  return {
    isBaseDomain: false,
    isSubdomain: false,
    isCustomDomain: true,
    slug: norm,
  };
}

// ============================================================================
// 3. WEBSITE RESOLUTION
// ============================================================================

const RESERVED_SLUGS = new Set([
  'localhost',
  'www',
  'admin',
  'api',
  'creator',
  'developer',
  'saas',
]);

export async function resolveWebsiteFromRequest(req, optionalSlug = null) {
  try {
    const cleanBase = normalizeDomain(BASE_URL);
    let targetSlug = optionalSlug;
    let reqHost = '';

    // 1. Extract target slug and host from request
    if (req) {
      if (typeof req.headers?.get === 'function') {
        const headerDomain = req.headers.get('x-domain');
        const headerSlug = req.headers.get('x-tenant-slug');
        if (!targetSlug && headerDomain) targetSlug = headerDomain;
        if (!targetSlug && headerSlug) targetSlug = headerSlug;

        const fwdHost = req.headers.get('x-forwarded-host');
        const stdHost = req.headers.get('host');
        if (fwdHost) reqHost = fwdHost;
        else if (stdHost) reqHost = stdHost;
      } else if (req.headers) {
        const headerDomain = req.headers['x-domain'];
        const headerSlug = req.headers['x-tenant-slug'];
        if (!targetSlug && headerDomain) targetSlug = headerDomain;
        if (!targetSlug && headerSlug) targetSlug = headerSlug;

        const fwdHost = req.headers['x-forwarded-host'];
        const stdHost = req.headers['host'];
        if (fwdHost) reqHost = fwdHost;
        else if (stdHost) reqHost = stdHost;
      }

      // Check query params if still unresolved
      if (!targetSlug && req.url) {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost');
          const qSlug = parsedUrl.searchParams.get('slug');
          const qSub = parsedUrl.searchParams.get('subdomain');
          const qDomain = parsedUrl.searchParams.get('domain');
          if (qSlug) targetSlug = qSlug;
          else if (qSub) targetSlug = qSub;
          else if (qDomain) targetSlug = qDomain;
        } catch (_) {}
      }
    }

    const hostInfo = parseDomainInfo(reqHost, cleanBase);

    // If NO optionalSlug/targetSlug was provided and the request host is the Base SaaS domain:
    // It's the main SaaS platform. Return null immediately (no tenant website context).
    if (!targetSlug && hostInfo.isBaseDomain) {
      return null;
    }

    // If still no targetSlug, check if host itself is a subdomain or custom domain
    if (!targetSlug) {
      if (hostInfo.isSubdomain || hostInfo.isCustomDomain) {
        targetSlug = hostInfo.slug;
      }
    }

    // If still no targetSlug resolved -> cannot map to any website
    if (!targetSlug) {
      return null;
    }

    // 2. Clean and validate targetSlug
    const cleanSlug = String(targetSlug).toLowerCase().trim();
    const cleanSlugWithoutWww = cleanSlug.replace(/^www\./, '');

    // Reserved system routes / base domains should never resolve as a website
    if (cleanBase) {
      if (cleanSlug === cleanBase || cleanSlug === `www.${cleanBase}`) {
        return null;
      }
    }
    if (RESERVED_SLUGS.has(cleanSlug)) {
      return null;
    }

    let website = null;

    // 3. Look up by numeric ID
    const isNumeric = /^\d+$/.test(cleanSlug);
    if (isNumeric) {
      const numRes = await queryDb(
        'SELECT * FROM websites WHERE id = $1 AND status != $2 LIMIT 1',
        [Number(cleanSlug), 'DELETED']
      );
      if (numRes.rows.length > 0) website = numRes.rows[0];
    }

    // 4. Look up by subdomain or custom_domain on websites table
    if (!website) {
      const subRes = await queryDb(
        `SELECT * FROM websites 
         WHERE (LOWER(subdomain) = $1 OR LOWER(custom_domain) = $1 OR LOWER(custom_domain) = $2)
           AND status != $3
         LIMIT 1`,
        [cleanSlug, cleanSlugWithoutWww, 'DELETED']
      );
      if (subRes.rows.length > 0) website = subRes.rows[0];
    }

    // 5. Look up via website_custom_domains table
    if (!website) {
      const customDomainRes = await queryDb(
        `SELECT w.* FROM websites w
         JOIN website_custom_domains cd ON cd.website_id = w.id
         WHERE (LOWER(cd.domain) = $1 OR LOWER(cd.domain) = $2)
           AND cd.status IN ('active', 'verified', 'pending')
           AND w.status != $3
         LIMIT 1`,
        [cleanSlug, cleanSlugWithoutWww, 'DELETED']
      );
      if (customDomainRes.rows.length > 0) website = customDomainRes.rows[0];
    }

    // Strict isolation: if not found, return null (never fall back to first row)
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
    queryDb('SELECT * FROM website_settings WHERE website_id = $1 LIMIT 1', [websiteId]).catch(() => ({ rows: [] })),
    queryDb('SELECT * FROM website_modules WHERE website_id = $1 ORDER BY id ASC', [websiteId]).catch(() => ({ rows: [] })),
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
// 3. WEBSITE USER SESSION & MULTI-ROLE PERMISSIONS
// ============================================================================

export async function getWebsiteUserSession(req, websiteId) {
  try {
    let token = null;

    if (req) {
      if (req.cookies && typeof req.cookies.get === 'function') {
        const c = req.cookies.get(WEBSITE_AUTH_COOKIE) || req.cookies.get(USER_TOKEN);
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
    const decoded = verifyWebsiteToken(token);
    if (!decoded || !decoded.userId) return null;

    const userRes = await queryDb(
      `SELECT u.id, u.website_id, u.name, u.email, u.phone, u.avatar_url, u.is_active
       FROM website_users u
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
    console.error('getWebsiteUserSession error:', err);
    return null;
  }
}

export async function getUserRolesAndPermissions(websiteId, userId) {
  try {
    // 1. Get all roles assigned to user via website_user_roles
    const rolesRes = await queryDb(
      `SELECT r.id, r.name, r.slug, r.description, r.is_system
       FROM website_user_roles ur
       JOIN website_roles r ON ur.role_id = r.id
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
       FROM website_role_permissions rp
       JOIN website_permissions p ON rp.permission_id = p.id
       LEFT JOIN website_modules m ON p.module_id = m.id
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

export { getWebsiteStaffSession, hasStaffPermission } from './website/staff';
export { getWebsiteClientSession } from './website/user';

