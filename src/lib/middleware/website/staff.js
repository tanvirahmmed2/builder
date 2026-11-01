import jwt from 'jsonwebtoken';
import { queryDb } from '@/lib/db/pg';
import { JWT_SECRET } from '@/lib/db/secret';

export const WEBSITE_STAFF_AUTH_COOKIE = 'website_staff_session_token';

export function generateStaffToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyStaffToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_) {
    return null;
  }
}

/**
 * Resolves authenticated staff session for a given website.
 * Enforces strict multi-tenant boundary: staff.website_id === websiteId.
 */
export async function getWebsiteStaffSession(req, websiteId) {
  try {
    if (!websiteId) return null;

    let token = null;

    if (req) {
      if (req.cookies && typeof req.cookies.get === 'function') {
        const c = req.cookies.get(WEBSITE_STAFF_AUTH_COOKIE) || req.cookies.get('staff_token');
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
    const decoded = verifyStaffToken(token);
    if (!decoded || !decoded.staffId) return null;

    // Strict multi-tenant isolation check: decoded websiteId must match requested websiteId
    if (decoded.websiteId && Number(decoded.websiteId) !== Number(websiteId)) {
      console.warn(`Staff session cross-tenant violation attempt: staff website ${decoded.websiteId} vs current ${websiteId}`);
      return null;
    }

    const staffRes = await queryDb(
      `SELECT s.id, s.website_id, s.branch_id, s.first_name, s.last_name, s.email, 
              s.phone, s.avatar_url, s.status, s.is_superadmin, s.last_login_at
       FROM website_staffs s
       WHERE s.id = $1 AND s.website_id = $2 AND s.status = 'active'
       LIMIT 1`,
      [decoded.staffId, websiteId]
    );

    if (staffRes.rows.length === 0) return null;
    const staff = staffRes.rows[0];

    // Fetch staff roles and permissions
    const { roles, permissions } = await getStaffRolesAndPermissions(websiteId, staff.id);

    return {
      ...staff,
      name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim(),
      roles,
      permissions,
      isSuperadmin: staff.is_superadmin || roles.some((r) => r.slug === 'superadmin' || r.slug === 'owner' || r.slug === 'admin')
    };
  } catch (err) {
    console.error('getWebsiteStaffSession error:', err);
    return null;
  }
}

export async function getStaffRolesAndPermissions(websiteId, staffId) {
  try {
    const rolesRes = await queryDb(
      `SELECT r.id, r.name, r.slug, r.description, r.is_system
       FROM website_staff_roles sr
       JOIN website_roles r ON sr.role_id = r.id
       WHERE sr.staff_id = $1 AND r.website_id = $2`,
      [staffId, websiteId]
    );

    const roles = rolesRes.rows;
    if (roles.length === 0) {
      return { roles: [], permissions: [] };
    }

    const roleIds = roles.map((r) => r.id);

    const permsRes = await queryDb(
      `SELECT DISTINCT p.id, p.module, p.action, p.name, p.description
       FROM website_role_permissions rp
       JOIN website_permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ANY($1::int[]) AND p.website_id = $2`,
      [roleIds, websiteId]
    );

    return {
      roles,
      permissions: permsRes.rows
    };
  } catch (err) {
    console.error('getStaffRolesAndPermissions error:', err);
    return { roles: [], permissions: [] };
  }
}

export function hasStaffPermission(staff, moduleName, action = 'view') {
  if (!staff) return false;
  if (staff.isSuperadmin) return true;

  const perms = staff.permissions || [];
  return perms.some((p) => {
    if (p.module === moduleName && (p.action === action || p.action === 'manage' || p.action === '*')) {
      return true;
    }
    if (p.module === '*' || p.module === 'all') return true;
    return false;
  });
}

