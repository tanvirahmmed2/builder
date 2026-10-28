import { cookies } from 'next/headers';
import { verifyWebsiteToken, WEBSITE_AUTH_COOKIE } from '@/lib/middleware/user';
import { queryDb } from '@/lib/db/pg';
import { USER_TOKEN } from '@/lib/db/secret';

export async function authenticateUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(WEBSITE_AUTH_COOKIE)?.value || cookieStore.get(USER_TOKEN)?.value;

    if (!token) {
      return { success: false, error: 'Unauthorized' };
    }

    const decoded = verifyWebsiteToken(token);
    if (!decoded || !decoded.userId) {
      return { success: false, error: 'Invalid token' };
    }

    const res = await queryDb(
      `SELECT id, website_id, branch_id, name, email, phone, role, is_active
       FROM website_users
       WHERE id = $1 AND is_active = TRUE
       LIMIT 1`,
      [decoded.userId]
    );

    if (res.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      user: res.rows[0]
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function isManagementRole() {
  const auth = await authenticateUser();
  if (!auth.success) return auth;

  const role = (auth.user?.role || '').toLowerCase();
  const allowed = ['admin', 'manager', 'owner', 'superadmin', 'sales'].includes(role);

  return {
    success: allowed,
    user: auth.user
  };
}

export async function isAdminRole() {
  const auth = await authenticateUser();
  if (!auth.success) return auth;

  const role = (auth.user?.role || '').toLowerCase();
  const allowed = ['admin', 'owner', 'superadmin'].includes(role);

  return {
    success: allowed,
    user: auth.user
  };
}
