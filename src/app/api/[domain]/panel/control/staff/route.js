import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';
import { hashPassword, comparePassword } from '@/lib/middleware/user';

export async function GET(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated', user: null, staff: null }, { status: 401 });
    }

    const userRes = await queryDb(
      `SELECT id, id AS user_id, website_id, branch_id, name, email, phone, role, is_active, 
              two_factor_enabled AS "2fa_active", created_at, updated_at
       FROM website_users
       WHERE id = $1 AND website_id = $2
       LIMIT 1`,
      [user.id, website.id]
    );

    const staffData = userRes.rows[0] || user;

    return NextResponse.json({
      success: true,
      user: staffData,
      staff: staffData
    });
  } catch (error) {
    console.error('Staff GET profile error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    // If changing password, verify current password
    let updatedHashedPassword = null;
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, error: 'Current password is required to set new password' }, { status: 400 });
      }

      const userRes = await queryDb(
        `SELECT password FROM website_users WHERE id = $1 AND website_id = $2`,
        [user.id, website.id]
      );

      const isValid = await comparePassword(currentPassword, userRes.rows[0]?.password);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
      }

      updatedHashedPassword = await hashPassword(newPassword.trim());
    }

    const res = await queryDb(
      `UPDATE website_users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           password = COALESCE($3, password),
           updated_at = NOW()
       WHERE id = $4 AND website_id = $5
       RETURNING id, id AS user_id, website_id, branch_id, name, email, phone, role, is_active, two_factor_enabled, created_at, updated_at`,
      [name, phone, updatedHashedPassword, user.id, website.id]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user.id,
      userName: user.name,
      action: 'PROFILE_UPDATED',
      details: `Updated personal profile information`,
      req: request
    });

    return NextResponse.json({
      success: true,
      user: res.rows[0],
      staff: res.rows[0]
    });

  } catch (error) {
    console.error('Staff PUT profile error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
