import jwt from 'jsonwebtoken';
import { queryDb } from '@/lib/db/pg';
import { JWT_SECRET } from '@/lib/db/secret';

export const WEBSITE_USER_AUTH_COOKIE = 'website_user_session_token';

export function generateUserToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyUserToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_) {
    return null;
  }
}

/**
 * Resolves authenticated client/customer session for a given website.
 * Enforces strict multi-tenant boundary: user.website_id === websiteId.
 */
export async function getWebsiteClientSession(req, websiteId) {
  try {
    if (!websiteId) return null;

    let token = null;

    if (req) {
      if (req.cookies && typeof req.cookies.get === 'function') {
        const c = req.cookies.get(WEBSITE_USER_AUTH_COOKIE) || req.cookies.get('user_token');
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
    const decoded = verifyUserToken(token);
    if (!decoded || !decoded.userId) return null;

    // Strict multi-tenant isolation check: decoded websiteId must match requested websiteId
    if (decoded.websiteId && Number(decoded.websiteId) !== Number(websiteId)) {
      console.warn(`Customer session cross-tenant violation attempt: customer website ${decoded.websiteId} vs current ${websiteId}`);
      return null;
    }

    const userRes = await queryDb(
      `SELECT u.id, u.website_id, u.first_name, u.last_name, u.email, u.phone, 
              u.avatar_url, u.is_verified, u.status
       FROM website_users u
       WHERE u.id = $1 AND u.website_id = $2 AND u.status = 'active'
       LIMIT 1`,
      [decoded.userId, websiteId]
    );

    if (userRes.rows.length === 0) return null;
    const user = userRes.rows[0];

    // Fetch customer record if present
    const custRes = await queryDb(
      `SELECT c.id, c.customer_code, c.total_orders, c.total_spent, c.loyalty_points
       FROM website_customers c
       WHERE c.user_id = $1 AND c.website_id = $2
       LIMIT 1`,
      [user.id, websiteId]
    );

    const customer = custRes.rows[0] || null;

    return {
      ...user,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      customer
    };
  } catch (err) {
    console.error('getWebsiteClientSession error:', err);
    return null;
  }
}

