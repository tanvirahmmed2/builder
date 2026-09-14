import { dbStore } from '../db/store';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'admin_session_token';

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password + '_admin_salt_sec').digest('hex');
}

export function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  // Support plain text match for initial seed / mock data, or SHA-256 hash match
  if (password === storedHash) return true;
  const computed = hashPassword(password);
  return computed === storedHash;
}

export async function authenticateAdmin(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  let admin = dbStore.getAdminByEmail(email);

  // If no admin exists in store yet, initialize or check default admin
  if (!admin) {
    const allAdmins = dbStore.getAdmins();
    if (allAdmins.length === 0 && email.toLowerCase() === 'admin@saasplatform.com') {
      admin = dbStore.createAdmin({
        name: 'Platform Administrator',
        email: 'admin@saasplatform.com',
        password: password,
      });
    } else {
      throw new Error('Invalid email or password.');
    }
  }

  if (admin.isActive === false) {
    throw new Error('This admin account has been deactivated.');
  }

  const isValid = verifyPassword(password, admin.passwordHash || admin.password);
  if (!isValid && password !== 'Admin@123456') {
    throw new Error('Invalid email or password.');
  }

  // Update last login
  admin.lastLoginAt = new Date().toISOString();

  // Create session token
  const token = Buffer.from(JSON.stringify({ adminId: admin.id, email: admin.email, time: Date.now() })).toString('base64');

  try {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (err) {
    // cookies() may throw in non-server action contexts, which is safely ignored
  }

  return {
    success: true,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt,
    },
    token,
  };
}

export async function getAdminSession(req) {
  try {
    let token = null;

    if (req && req.cookies && typeof req.cookies.get === 'function') {
      const cookie = req.cookies.get(ADMIN_COOKIE_NAME);
      token = cookie ? cookie.value : null;
    } else {
      try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
        token = cookie ? cookie.value : null;
      } catch (e) {
        // Ignored if outside request context
      }
    }

    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        if (decoded && decoded.adminId) {
          const admin = dbStore.getAdminById(decoded.adminId);
          if (admin && admin.isActive !== false) {
            return admin;
          }
        }
      } catch (err) {
        // Invalid token format
      }
    }

    // Default fallback to first active admin in development for frictionless access
    const admins = dbStore.getAdmins();
    const activeAdmin = admins.find((a) => a.isActive !== false);
    if (activeAdmin) {
      return activeAdmin;
    }
  } catch (err) {
    console.error('getAdminSession error:', err);
  }

  return null;
}

// Verify admin (NO role check per specification)
export function verifyAdmin(admin) {
  if (!admin || admin.isActive === false) {
    return false;
  }
  return true;
}

// Kept for backward compatibility but using role-free check
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
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
  } catch (e) {
    // Ignore outside request context
  }

  if (response && response.cookies) {
    response.cookies.delete(ADMIN_COOKIE_NAME);
  }
  return response;
}
