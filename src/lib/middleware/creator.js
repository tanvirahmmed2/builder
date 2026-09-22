import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers.js';
import { queryDb as query, pool } from '../db/pg.js';
import { JWT_SECRET, CREATOR_TOKEN, SITE_NAME } from '../db/secret.js';
import { sendEmail } from '../db/mailer.js';

export const CREATOR_COOKIE_NAME = CREATOR_TOKEN;


// ============================================================================
// PASSWORD & TOKEN UTILITIES
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
  } catch (_) {
    // If not a bcrypt hash (e.g. legacy seed data), fallback to string comparison
  }
  return password === hashedPassword;
}

export const verifyPassword = comparePassword;

export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_) {
    return null;
  }
}

export const generateCreatorToken = generateToken;
export const verifyCreatorToken = verifyToken;

// ============================================================================
// AUTHENTICATION (CREATOR)
// ============================================================================

export const authenticateCreatorAuth = async (req) => {
  try {
    let token = null;

    // 1. Check req cookies or Authorization header if request is provided
    if (req) {
      if (req.cookies && typeof req.cookies.get === 'function') {
        const cookie = req.cookies.get(CREATOR_COOKIE_NAME);
        token = typeof cookie === 'string' ? cookie : cookie?.value;
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
        token = cookieStore.get(CREATOR_COOKIE_NAME)?.value;
      } catch (_) {}
    }

    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const decoded = verifyToken(token);
    const creatorId = decoded?.id || decoded?.creator_id || decoded?.user_id;

    if (!decoded || !creatorId) {
      return { success: false, message: 'Invalid or expired token' };
    }

    // Query creators table with exact columns that exist on creators
    const result = await query(
      `SELECT id, name, email, phone, avatar_url, bio, is_active, is_verified, 
              two_factor_enabled, last_login_at, created_at, updated_at
       FROM creators
       WHERE id = $1`,
      [creatorId]
    );

    if (result.rows.length === 0) {
      return { success: false, message: 'Creator account not found' };
    }

    const creator = result.rows[0];

    if (creator.is_active === false) {
      return { success: false, message: 'Creator account is deactivated' };
    }
    if (creator.is_verified === false) {
      return { success: false, message: 'Creator account is not verified' };
    }

    const fullCreator = {
      ...creator,
      creator_id: creator.id,
      current_session_token: token,
      role: 'creator',
    };

    return {
      success: true,
      creator: fullCreator,
      user: fullCreator,
      payload: fullCreator,
      currentUser: fullCreator,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getAuthenticatedCreator = async (req) => {
  const auth = await authenticateCreatorAuth(req);
  return auth.success ? auth.creator : null;
};

export const getAuthenticatedUser = getAuthenticatedCreator;

// ============================================================================
// AUTHORIZATION CHECKS
// ============================================================================

export const isCreator = async (req) => {
  const auth = await authenticateCreatorAuth(req);
  if (!auth.success) return auth;
  return { success: true, creator: auth.creator, user: auth.creator, payload: auth.creator };
};

export const isCreatorUser = isCreator;
export const isCreatorLogin = isCreator;

// ============================================================================
// LOGIN / SESSION MANAGEMENT
// ============================================================================

export async function authenticateCreator(email, password, reqDetails = {}) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const cleanEmail = email.trim().toLowerCase();
  let creator = null;

  try {
    const pgRes = await query(
      `SELECT id, name, email, password, phone, avatar_url, bio, is_active, is_verified, 
              two_factor_enabled, last_login_at, created_at, updated_at
       FROM creators WHERE LOWER(email) = $1 LIMIT 1`,
      [cleanEmail]
    );
    if (pgRes && pgRes.rows && pgRes.rows.length > 0) {
      creator = pgRes.rows[0];
    }
  } catch (err) {
    console.warn('PostgreSQL query error in authenticateCreator:', err.message);
  }

  if (!creator) {
    throw new Error('Invalid email or password.');
  }

  const isValid = await comparePassword(password, creator.password);
  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  // If password was stored plaintext (e.g. initial seed), upgrade it to bcrypt hash
  if (creator.password === password) {
    try {
      const newHashed = await hashPassword(password);
      await query('UPDATE creators SET password = $1 WHERE id = $2', [newHashed, creator.id]);
    } catch (_) {}
  }

  if (creator.is_active === false) {
    const err = new Error('This creator account has been deactivated.');
    err.deactivated = true;
    throw err;
  }

  if (creator.is_verified === false) {
    const err = new Error('This creator account is not verified. Please verify your email before logging in.');
    err.unverified = true;
    err.email = cleanEmail;
    throw err;
  }

  // Two-Factor Authentication (2FA) verification
  if (creator.two_factor_enabled === true) {
    const twoFactorCode = reqDetails.twoFactorCode;
    if (!twoFactorCode) {
      const code = String(crypto.randomInt(100000, 999999));
      await query(
        `UPDATE creators 
         SET two_factor_code = $1, two_factor_expires_at = CURRENT_TIMESTAMP + INTERVAL '10 minutes'
         WHERE id = $2`,
        [code, creator.id]
      );

      try {
        await sendEmail({
          to: cleanEmail,
          subject: `Your Login Security Code - ${SITE_NAME}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
              <h2 style="color: #0f172a; margin-top: 0;">Two-Factor Verification</h2>
              <p style="font-size: 14px; color: #475569;">Hello ${creator.name}, use the code below to complete your sign in:</p>
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
                <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${code}</span>
              </div>
              <p style="font-size: 12px; color: #64748b;">This code will expire in 10 minutes. If you did not initiate this login, please change your password immediately.</p>
            </div>
          `,
          text: `Your ${SITE_NAME} login code is ${code}. It expires in 10 minutes.`,
        });
      } catch (mailErr) {
        console.warn('Notice sending 2FA code via Brevo:', mailErr.message);
      }

      const err = new Error('Two-factor authentication code sent to your email.');
      err.twoFactorRequired = true;
      err.email = cleanEmail;
      throw err;
    }

    // Verify provided 2FA code
    const isCodeValid =
      creator.two_factor_code &&
      String(creator.two_factor_code).trim() === String(twoFactorCode).trim();
    const isNotExpired =
      creator.two_factor_expires_at &&
      new Date(creator.two_factor_expires_at) >= new Date();

    if (!isCodeValid || !isNotExpired) {
      const err = new Error('Invalid or expired security code. Please check or request a new code.');
      err.twoFactorRequired = true;
      err.twoFactorInvalid = true;
      err.email = cleanEmail;
      throw err;
    }

    // Clear 2FA code after successful verification
    await query(
      'UPDATE creators SET two_factor_code = NULL, two_factor_expires_at = NULL WHERE id = $1',
      [creator.id]
    );
  }

  const jwtToken = generateToken(
    { id: creator.id, email: cleanEmail, role: 'creator', type: 'creator' },
    '7d'
  );


  // Update last login details on creators table
  try {
    await query(
      'UPDATE creators SET last_login_at = CURRENT_TIMESTAMP, last_login_ip = $1 WHERE id = $2',
      [reqDetails.ip || null, creator.id]
    );
  } catch (dbErr) {
    console.warn('Notice updating creator last_login_at in PG:', dbErr.message);
  }

  // Set HTTP-Only Cookie via next/headers
  try {
    const cookieStore = await cookies();
    if (cookieStore) {
      cookieStore.set(CREATOR_COOKIE_NAME, jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  } catch (_) {}

  return {
    success: true,
    creator: {
      id: creator.id,
      name: creator.name,
      email: creator.email,
      phone: creator.phone,
      avatar_url: creator.avatar_url,
      bio: creator.bio,
      isActive: creator.is_active !== false,
      isVerified: creator.is_verified === true,
      twoFactorEnabled: creator.two_factor_enabled || false,
      lastLoginAt: new Date().toISOString(),
    },
    token: jwtToken,
  };
}

export async function getCreatorSession(req) {
  try {
    let token = null;

    if (req && req.cookies && typeof req.cookies.get === 'function') {
      const cookie = req.cookies.get(CREATOR_COOKIE_NAME);
      token = typeof cookie === 'string' ? cookie : cookie?.value;
    }

    if (!token) {
      try {
        const cookieStore = await cookies();
        const cookie = cookieStore ? cookieStore.get(CREATOR_COOKIE_NAME) : null;
        token = cookie ? cookie.value : null;
      } catch (_) {}
    }

    if (token) {
      const creator = await getAuthenticatedCreator(req);
      if (creator) {
        return {
          ...creator,
          isActive: creator.is_active !== false,
          isVerified: creator.is_verified === true,
        };
      }
    }
  } catch (err) {
    console.error('getCreatorSession error:', err);
  }

  return null;
}

export function verifyCreator(creator) {
  if (!creator || creator.isActive === false || creator.isVerified === false) {
    return false;
  }
  return true;
}

export async function setCreatorSessionCookie(response, token) {
  if (response && response.cookies) {
    response.cookies.set(CREATOR_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return response;
}

export async function clearCreatorSessionCookie(response) {
  try {
    const cookieStore = await cookies();
    if (cookieStore) {
      cookieStore.delete(CREATOR_COOKIE_NAME);
    }
  } catch (_) {}

  if (response && response.cookies) {
    response.cookies.delete(CREATOR_COOKIE_NAME);
  }
  return response;
}

// ============================================================================
// WEBSITE & PORTFOLIO PERMISSIONS
// ============================================================================

export async function isWebsiteOwner(websiteId, creatorId) {
  try {
    const { rows } = await query(
      'SELECT id FROM websites WHERE id = $1 AND creator_id = $2 LIMIT 1',
      [websiteId, creatorId]
    );
    return rows.length > 0;
  } catch (_) {
    return false;
  }
}

export async function canManagePortfolio(websiteId, creatorId) {
  if (!creatorId) return false;
  return isWebsiteOwner(websiteId, creatorId);
}

export async function canManageTeamAndBilling(websiteId, creatorId) {
  if (!creatorId) return false;
  return isWebsiteOwner(websiteId, creatorId);
}
