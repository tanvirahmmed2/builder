import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { JWT_SECRET, ADMIN_TOKEN } from '../db/secret.js';
import { pool, queryDb } from '../db/pg.js';

// Using ADMIN_TOKEN ('admin-hiesci') as the session cookie name
export const ADMIN_COOKIE_NAME = ADMIN_TOKEN || 'admin-hiesci';

async function getCookieStore() {
  try {
    const nextHeaders = await import('next/headers');
    if (nextHeaders && typeof nextHeaders.cookies === 'function') {
      return await nextHeaders.cookies();
    }
  } catch (_) { }
  return null;
}

export async function hashPassword(password) {
  if (!password) return '';
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  // If storedHash is a bcrypt hash
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return await bcrypt.compare(password, storedHash);
  }
  // Plain-text match fallback (e.g., initial seed)
  if (password === storedHash) return true;
  // Legacy SHA-256 fallback
  const computed = crypto.createHash('sha256').update(password + '_admin_salt_sec').digest('hex');
  return computed === storedHash;
}

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await getCookieStore();
    const token = cookieStore ? cookieStore.get(ADMIN_COOKIE_NAME)?.value : null;

    if (!token) return null;

    let decoded = null;
    try {
      decoded = jwt.verify(token, JWT_SECRET || 'disibin');
    } catch (_) {
      decoded = null;
    }

    let user = null;

    if (decoded && decoded.id) {
      try {
        const { rows } = await pool.query(
          'SELECT id, name, email, role, is_active, is_verified FROM admin WHERE id = $1 LIMIT 1',
          [decoded.id]
        );
        if (rows && rows.length > 0) {
          const row = rows[0];
          user = {
            id: row.id,
            name: row.name,
            email: row.email,
            phone: null,
            role: row.role || 'admin',
            is_active: row.is_active,
            is_verified: row.is_verified,
            is_banned: row.is_active === false,
          };
        }
      } catch (_) { }

      if (!user) {
        try {
          const { rows } = await pool.query(
            'SELECT id, name, email, role, is_banned FROM users WHERE id = $1 LIMIT 1',
            [decoded.id]
          );
          if (rows && rows.length > 0) {
            user = rows[0];
          }
        } catch (_) { }
      }
    } else {
      // Fallback: Check PostgreSQL session table by raw session token
      try {
        const sessionRes = await pool.query(
          `SELECT a.id, a.name, a.email, a.role, a.is_active, a.is_verified, a.two_factor_enabled, a.last_login_at
           FROM session s
           JOIN admin a ON s.admin_id = a.id
           WHERE s.token = $1 AND s.is_revoked = FALSE AND s.expires_at > CURRENT_TIMESTAMP
           LIMIT 1`,
          [token]
        );
        if (sessionRes && sessionRes.rows && sessionRes.rows.length > 0) {
          const row = sessionRes.rows[0];
          user = {
            id: row.id,
            name: row.name,
            email: row.email,
            phone: null,
            role: row.role || 'admin',
            is_active: row.is_active,
            is_verified: row.is_verified,
            is_banned: row.is_active === false,
            twoFactorEnabled: row.two_factor_enabled,
            lastLoginAt: row.last_login_at,
          };
        }
      } catch (_) { }
    }

    if (!user) return null;

    // Both active and verified checks
    if (user.is_banned || user.is_active === false || user.is_verified === false) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function isLogin() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }
  return { success: true, payload: user };
}

export async function isAdmin() {
  const auth = await isLogin();
  if (!auth.success) return auth;
  if (auth.payload.role !== 'admin') return { success: false, message: 'Admins only' };
  return auth;
}

export async function isManager() {
  const auth = await isLogin();
  if (!auth.success) return auth;
  if (auth.payload.role !== 'manager' && auth.payload.role !== 'admin') {
    return { success: false, message: 'Manager only' };
  }
  return auth;
}

export async function isSupport() {
  const auth = await isLogin();
  if (!auth.success) return auth;
  if (auth.payload.role !== 'support' && auth.payload.role !== 'admin') {
    return { success: false, message: 'Support only' };
  }
  return auth;
}

export async function authenticateAdmin(email, password, reqDetails = {}) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const cleanEmail = email.trim().toLowerCase();
  let admin = null;

  try {
    const pgRes = await queryDb('SELECT * FROM admin WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
    if (pgRes && pgRes.rows && pgRes.rows.length > 0) {
      admin = pgRes.rows[0];
    }
  } catch (err) {
    console.warn('PostgreSQL query error in authenticateAdmin:', err.message);
  }

  // 1. Verify Email
  if (!admin) {
    try {
      await queryDb(
        `INSERT INTO login_activity (email, status, failure_reason, ip_address, user_agent) 
         VALUES ($1, 'FAILED', 'Admin account not found', $2, $3)`,
        [cleanEmail, reqDetails.ip || null, reqDetails.userAgent || null]
      );
    } catch (_) { }
    throw new Error('Invalid email or password.');
  }

  // 2. Verify Password using bcrypt
  const storedPass = admin.password;
  const isValid = await verifyPassword(password, storedPass);

  if (!isValid) {
    try {
      await queryDb(
        `INSERT INTO login_activity (admin_id, email, status, failure_reason, ip_address, user_agent) 
         VALUES ($1, $2, 'FAILED', 'Invalid password credentials', $3, $4)`,
        [admin.id, cleanEmail, reqDetails.ip || null, reqDetails.userAgent || null]
      );
    } catch (_) { }
    throw new Error('Invalid email or password.');
  }

  // 3. Verify Active Status
  const isActive = admin.is_active;
  if (isActive === false) {
    try {
      await queryDb(
        `INSERT INTO login_activity (admin_id, email, status, failure_reason, ip_address, user_agent) 
         VALUES ($1, $2, 'FAILED', 'Account deactivated', $3, $4)`,
        [admin.id, cleanEmail, reqDetails.ip || null, reqDetails.userAgent || null]
      );
    } catch (_) { }
    const err = new Error('This admin account has been deactivated.');
    err.deactivated = true;
    throw err;
  }

  // 4. Verify Email Verification Status
  const isVerified = admin.is_verified;
  if (isVerified === false) {
    try {
      await queryDb(
        `INSERT INTO login_activity (admin_id, email, status, failure_reason, ip_address, user_agent) 
         VALUES ($1, $2, 'FAILED', 'Account not verified', $3, $4)`,
        [admin.id, cleanEmail, reqDetails.ip || null, reqDetails.userAgent || null]
      );
    } catch (_) { }
    const err = new Error('This admin account is not verified. Please verify your email with the verification code.');
    err.unverified = true;
    err.email = cleanEmail;
    throw err;
  }

  // Generate JWT containing admin id and email
  const jwtToken = jwt.sign(
    { id: admin.id, email: cleanEmail, role: admin.role || 'admin' },
    JWT_SECRET || 'disibin',
    { expiresIn: '7d' }
  );
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Store login session in PostgreSQL session table
  try {
    await queryDb(
      `INSERT INTO session (admin_id, token, expires_at, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5)`,
      [admin.id, jwtToken, expiresAt, reqDetails.ip || null, reqDetails.userAgent || null]
    );
    await queryDb(
      `INSERT INTO login_activity (admin_id, email, status, ip_address, user_agent) 
       VALUES ($1, $2, 'SUCCESS', $3, $4)`,
      [admin.id, cleanEmail, reqDetails.ip || null, reqDetails.userAgent || null]
    );
    await queryDb(
      `UPDATE admin SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [admin.id]
    );
  } catch (dbErr) {
    console.warn('Notice recording admin session/login_activity in PG:', dbErr.message);
  }

  // Store admin session in HTTP-only cookie using ADMIN_TOKEN
  try {
    const cookieStore = await getCookieStore();
    if (cookieStore) {
      cookieStore.set(ADMIN_COOKIE_NAME, jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  } catch (_) {
    // outside request context
  }

  return {
    success: true,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role || 'admin',
      isActive: isActive !== false,
      isVerified: isVerified === true,
      twoFactorEnabled: admin.two_factor_enabled || false,
      lastLoginAt: new Date().toISOString(),
    },
    token: jwtToken,
  };
}

export async function getAdminSession(req) {
  try {
    let token = null;

    if (req && req.cookies && typeof req.cookies.get === 'function') {
      const cookie = req.cookies.get(ADMIN_COOKIE_NAME);
      token = cookie ? cookie.value : null;
    }

    if (!token) {
      try {
        const cookieStore = await getCookieStore();
        const cookie = cookieStore ? cookieStore.get(ADMIN_COOKIE_NAME) : null;
        token = cookie ? cookie.value : null;
      } catch (_) { }
    }

    if (token) {
      const user = await getAuthenticatedUser();
      if (user) {
        return {
          ...user,
          isActive: !user.is_banned && user.is_active !== false,
          isVerified: user.is_verified === true,
        };
      }
    }
  } catch (err) {
    console.error('getAdminSession error:', err);
  }

  return null;
}

export function verifyAdmin(admin) {
  if (!admin || admin.isActive === false || admin.is_banned === true || admin.isVerified === false) {
    return false;
  }
  return true;
}

export function verifySuperAdmin(admin) {
  return verifyAdmin(admin);
}

export async function setAdminSessionCookie(response, token) {
  if (response && response.cookies) {
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return response;
}

export async function clearAdminSessionCookie(response) {
  try {
    const cookieStore = await getCookieStore();
    const token = cookieStore ? cookieStore.get(ADMIN_COOKIE_NAME)?.value : null;
    if (token) {
      try {
        await queryDb('UPDATE session SET is_revoked = TRUE WHERE token = $1', [token]);
      } catch (_) { }
    }
    if (cookieStore) {
      cookieStore.delete(ADMIN_COOKIE_NAME);
    }
  } catch (_) { }

  if (response && response.cookies) {
    response.cookies.delete(ADMIN_COOKIE_NAME);
  }
  return response;
}
