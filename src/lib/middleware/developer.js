import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { pool, queryDb as query } from '../db/pg.js';
import { JWT_SECRET, ADMIN_TOKEN } from '../db/secret.js';

export const ADMIN_COOKIE_NAME = ADMIN_TOKEN


export async function hashPassword(password) {
  if (!password) return '';
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')) {
    return await bcrypt.compare(password, hashedPassword);
  }
  // Plain-text match fallback (e.g., initial seed)
  if (password === hashedPassword) return true;
  return false;
}

export const verifyPassword = comparePassword;

export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET || 'disibin', { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET || 'disibin');
  } catch (error) {
    return null;
  }
}


export const authenticateStaff = async (req) => {
  try {
    let token = null;

    // 1. Check req cookies or Authorization header if request is provided
    if (req) {
      if (req.cookies && typeof req.cookies.get === 'function') {
        token =
          req.cookies.get(ADMIN_COOKIE_NAME)?.value ||
          req.cookies.get('ecom_token')?.value;
      }
      if (!token && req.headers && typeof req.headers.get === 'function') {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7).trim();
        }
      }
    }

    // 2. Next.js cookies() from next/headers
    if (!token) {
      try {
        const cookieStore = await cookies();
        token =
          cookieStore.get(ADMIN_COOKIE_NAME)?.value ||
          cookieStore.get('ecom_token')?.value;
      } catch (_) { }
    }

    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const decoded = verifyToken(token);
    const developerId =
      decoded?.id || decoded?.developer_id || decoded?.staff_id || decoded?.user_id;

    if (!decoded || !developerId) {
      return { success: false, message: 'Invalid or expired token' };
    }

    // Verify against developers table and session table
    const result = await query(
      `SELECT d.id, d.name, d.email, d.role, d.is_active, d.is_verified, s.id AS session_id, s.token AS session_token
       FROM developers d
       JOIN session s ON d.id = s.developer_id
       WHERE d.id = $1 AND s.token = $2 AND s.is_revoked = FALSE AND s.expires_at > CURRENT_TIMESTAMP`,
      [developerId, token]
    );

    let dev = null;
    let sessionId = null;

    if (result.rows && result.rows.length > 0) {
      dev = result.rows[0];
      sessionId = dev.session_id;

      query('UPDATE session SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [sessionId]).catch(() => { });
    } else {
      // Direct developer check fallback (if session row expired or token-only auth)
      const directDev = await query(
        'SELECT id, name, email, role, is_active, is_verified FROM developers WHERE id = $1 LIMIT 1',
        [developerId]
      );
      if (!directDev.rows || directDev.rows.length === 0) {
        return { success: false, message: 'Session expired or developer account not found' };
      }
      dev = directDev.rows[0];
    }

    if (dev.is_active === false) {
      return { success: false, message: 'Developer account is deactivated' };
    }
    if (dev.is_verified === false) {
      return { success: false, message: 'Developer account is not verified' };
    }

    const fullStaff = {
      ...dev,
      staff_id: dev.id,
      developer_id: dev.id,
      current_session_token: token,
      current_session_id: sessionId,
    };

    return {
      success: true,
      staff: fullStaff,
      developer: fullStaff,
      user: fullStaff,
      payload: fullStaff,
      currentUser: fullStaff,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const authenticateDeveloper = authenticateStaff;
export const authenticateUser = authenticateStaff;

export const getAuthenticatedUser = async (req) => {
  const auth = await authenticateStaff(req);
  return auth.success ? auth.user : null;
};

// ============================================================================
// ROLE AUTHORIZATION CHECKS (ROLES FROM schema.psql)
// Allowed: ('admin', 'manager', 'support', 'developer', 'marketer')
// ============================================================================

export const isStaff = async (req) => {
  const auth = await authenticateStaff(req);
  if (!auth.success) return auth;
  return { success: true, staff: auth.staff, developer: auth.staff, user: auth.staff, payload: auth.staff };
};

export const isUser = isStaff;
export const isDeveloperUser = isStaff;
export const isLogin = isStaff;

export const isAdmin = async (req) => {
  const auth = await authenticateStaff(req);
  if (!auth.success) return auth;
  if (auth.staff.role !== 'admin') {
    return { success: false, status: 403, message: 'Access denied: Admin role required' };
  }
  return { success: true, staff: auth.staff, developer: auth.staff, user: auth.staff, payload: auth.staff };
};

export const isManager = async (req) => {
  const auth = await authenticateStaff(req);
  if (!auth.success) return auth;
  if (auth.staff.role !== 'manager' && auth.staff.role !== 'admin') {
    return { success: false, status: 403, message: 'Access denied: Admin or Manager role required' };
  }
  return { success: true, staff: auth.staff, developer: auth.staff, user: auth.staff, payload: auth.staff };
};

export const isManagerOrAdmin = async (req) => {
  const auth = await authenticateStaff(req);
  if (!auth.success) return auth;
  if (auth.staff.role !== 'manager' && auth.staff.role !== 'admin') {
    return { success: false, status: 403, message: 'Access denied: Admin or Manager role required' };
  }
  return { success: true, staff: auth.staff, developer: auth.staff, user: auth.staff, payload: auth.staff };
};

export const isSupport = async (req) => {
  const auth = await authenticateStaff(req);
  if (!auth.success) return auth;
  if (auth.staff.role !== 'support' && auth.staff.role !== 'manager' && auth.staff.role !== 'admin') {
    return { success: false, status: 403, message: 'Access denied: Support role required' };
  }
  return { success: true, staff: auth.staff, developer: auth.staff, user: auth.staff, payload: auth.staff };
};

export const isDeveloper = async (req) => {
  const auth = await authenticateStaff(req);
  if (!auth.success) return auth;
  if (
    auth.staff.role !== 'developer' &&
    auth.staff.role !== 'manager' &&
    auth.staff.role !== 'admin'
  ) {
    return { success: false, status: 403, message: 'Access denied: Developer role required' };
  }
  return { success: true, staff: auth.staff, developer: auth.staff, user: auth.staff, payload: auth.staff };
};

export const isMarketer = async (req) => {
  const auth = await authenticateStaff(req);
  if (!auth.success) return auth;
  if (
    auth.staff.role !== 'marketer' &&
    auth.staff.role !== 'manager' &&
    auth.staff.role !== 'admin'
  ) {
    return { success: false, status: 403, message: 'Access denied: Marketer role required' };
  }
  return { success: true, staff: auth.staff, developer: auth.staff, user: auth.staff, payload: auth.staff };
};

export const isManagementRole = async (req) => {
  const auth = await authenticateStaff(req);
  if (!auth.success) return auth;
  if (auth.staff.role !== 'manager' && auth.staff.role !== 'admin') {
    return { success: false, status: 403, message: 'Access denied: Management role required' };
  }
  return { success: true, staff: auth.staff, developer: auth.staff, user: auth.staff, payload: auth.staff };
};

// ============================================================================
// LOGIN / SESSION MANAGEMENT
// ============================================================================

export async function authenticateAdmin(email, password, reqDetails = {}) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const cleanEmail = email.trim().toLowerCase();
  let admin = null;

  try {
    const pgRes = await query('SELECT * FROM developers WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
    if (pgRes && pgRes.rows && pgRes.rows.length > 0) {
      admin = pgRes.rows[0];
    }
  } catch (err) {
    console.warn('PostgreSQL query error in authenticateAdmin:', err.message);
  }

  if (!admin) {
    try {
      await query(
        `INSERT INTO login_activity (email, status, failure_reason, ip_address, user_agent) 
         VALUES ($1, 'FAILED', 'Admin account not found', $2, $3)`,
        [cleanEmail, reqDetails.ip || null, reqDetails.userAgent || null]
      );
    } catch (_) { }
    throw new Error('Invalid email or password.');
  }

  const isValid = await comparePassword(password, admin.password);
  if (!isValid) {
    try {
      await query(
        `INSERT INTO login_activity (developer_id, email, status, failure_reason, ip_address, user_agent) 
         VALUES ($1, $2, 'FAILED', 'Invalid password credentials', $3, $4)`,
        [admin.id, cleanEmail, reqDetails.ip || null, reqDetails.userAgent || null]
      );
    } catch (_) { }
    throw new Error('Invalid email or password.');
  }

  if (admin.is_active === false) {
    try {
      await query(
        `INSERT INTO login_activity (developer_id, email, status, failure_reason, ip_address, user_agent) 
         VALUES ($1, $2, 'FAILED', 'Account deactivated', $3, $4)`,
        [admin.id, cleanEmail, reqDetails.ip || null, reqDetails.userAgent || null]
      );
    } catch (_) { }
    const err = new Error('This admin account has been deactivated.');
    err.deactivated = true;
    throw err;
  }

  if (admin.is_verified === false) {
    try {
      await query(
        `INSERT INTO login_activity (developer_id, email, status, failure_reason, ip_address, user_agent) 
         VALUES ($1, $2, 'FAILED', 'Account not verified', $3, $4)`,
        [admin.id, cleanEmail, reqDetails.ip || null, reqDetails.userAgent || null]
      );
    } catch (_) { }
    const err = new Error('This admin account is not verified. Please verify your email with the verification code.');
    err.unverified = true;
    err.email = cleanEmail;
    throw err;
  }

  const jwtToken = generateToken(
    { id: admin.id, email: cleanEmail, role: admin.role || 'admin' },
    '7d'
  );
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    await query(
      `INSERT INTO session (developer_id, token, expires_at, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5)`,
      [admin.id, jwtToken, expiresAt, reqDetails.ip || null, reqDetails.userAgent || null]
    );
    await query(
      `INSERT INTO login_activity (developer_id, email, status, ip_address, user_agent) 
       VALUES ($1, $2, 'SUCCESS', $3, $4)`,
      [admin.id, cleanEmail, reqDetails.ip || null, reqDetails.userAgent || null]
    );
    await query(`UPDATE developers SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`, [admin.id]);
  } catch (dbErr) {
    console.warn('Notice recording admin session/login_activity in PG:', dbErr.message);
  }

  try {
    const cookieStore = await cookies();
    if (cookieStore) {
      cookieStore.set(ADMIN_COOKIE_NAME, jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  } catch (_) { }

  return {
    success: true,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role || 'admin',
      isActive: admin.is_active !== false,
      isVerified: admin.is_verified === true,
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
        const cookieStore = await cookies();
        const cookie = cookieStore ? cookieStore.get(ADMIN_COOKIE_NAME) : null;
        token = cookie ? cookie.value : null;
      } catch (_) { }
    }

    if (token) {
      const user = await getAuthenticatedUser(req);
      if (user) {
        return {
          ...user,
          isActive: user.is_active !== false,
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
  if (!admin || admin.isActive === false || admin.isVerified === false) {
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
    let token = null;
    try {
      const cookieStore = await cookies();
      token = cookieStore ? cookieStore.get(ADMIN_COOKIE_NAME)?.value : null;
      if (cookieStore) {
        cookieStore.delete(ADMIN_COOKIE_NAME);
      }
    } catch (_) { }

    if (token) {
      try {
        await query('UPDATE session SET is_revoked = TRUE WHERE token = $1', [token]);
      } catch (_) { }
    }
  } catch (_) { }

  if (response && response.cookies) {
    response.cookies.delete(ADMIN_COOKIE_NAME);
  }
  return response;
}
