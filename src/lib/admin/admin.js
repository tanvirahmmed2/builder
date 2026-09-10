import crypto from 'crypto';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN, JWT_SECRET, NODE_ENV } from '../db/secret.js';
import { queryDb } from '../db/pg.js';

export { ADMIN_TOKEN };

/**
 * Hash password with PBKDF2
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash (supports PBKDF2 salt:hash and plaintext fallback)
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  if (storedHash.includes(':')) {
    const [salt, key] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return key === hash;
  }
  return password === storedHash;
}

/**
 * Generate HMAC-signed admin authentication token
 */
export function signAdminToken(payload) {
  const data = JSON.stringify({
    ...payload,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  const base64Data = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET || 'disibin')
    .update(base64Data)
    .digest('base64url');
  return `${base64Data}.${signature}`;
}

/**
 * Verify HMAC-signed admin token
 */
export function verifyAdminToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [base64Data, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET || 'disibin')
      .update(base64Data)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(base64Data, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Get admin session from cookies
 */
export async function bcrypt_token() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_TOKEN)?.value;
    if (!token) {
      return { success: false, message: 'Please login' };
    }

    const session = verifyAdminToken(token);
    if (!session) {
      return { success: false, message: 'Invalid or expired session. Please login.' };
    }

    return { success: true, admin: session };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Check if the current request is from an authenticated admin
 */
export async function isAdmin() {
  try {
    const res = await bcrypt_token();
    if (res.success && res.admin) {
      return res.admin;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Set admin session cookie
 */
export async function setAdminSessionCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_TOKEN, token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60,
  });
}

/**
 * Clear admin session cookie
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_TOKEN);
}

/**
 * Authenticate admin with email and password from PostgreSQL database
 */
export async function authenticateAdmin(email, password) {
  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail || !password) {
    throw new Error('Email and password are required.');
  }

  // Query PostgreSQL admins table
  let res = await queryDb('SELECT * FROM admins WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);

  // If table is empty and trying default super admin credentials, seed super admin
  if (res.rows.length === 0) {
    const countRes = await queryDb('SELECT COUNT(*) FROM admins');
    const totalAdmins = parseInt(countRes.rows[0].count, 10);

    if (totalAdmins === 0 && cleanEmail === 'admin@saasplatform.com') {
      const hashed = hashPassword(password);
      const insertRes = await queryDb(
        `INSERT INTO admins (name, email, password_hash, role, is_active, is_verified)
         VALUES ($1, $2, $3, 'SUPER_ADMIN', true, true)
         RETURNING id, name, email, role, is_active`,
        ['Super Admin', cleanEmail, hashed]
      );
      const newAdmin = insertRes.rows[0];
      const token = signAdminToken({
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      });
      await setAdminSessionCookie(token);
      return { admin: newAdmin, token };
    }

    throw new Error('Invalid admin email or password.');
  }

  const admin = res.rows[0];

  if (!admin.is_active) {
    throw new Error('Admin account is suspended. Please contact platform support.');
  }

  const isValid = verifyPassword(password, admin.password_hash);
  if (!isValid) {
    // Record login attempt
    await queryDb('UPDATE admins SET login_attempts = login_attempts + 1 WHERE id = $1', [admin.id]);
    throw new Error('Invalid admin email or password.');
  }

  // Reset login attempts & update last_login_at
  await queryDb(
    'UPDATE admins SET login_attempts = 0, last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
    [admin.id]
  );

  const token = signAdminToken({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });

  await setAdminSessionCookie(token);

  return {
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    token,
  };
}
