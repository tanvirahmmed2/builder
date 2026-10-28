import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';
import { hashPassword } from '@/lib/middleware/user';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const userId = Number(params.id);

    const res = await queryDb(
      `SELECT id, id AS user_id, website_id, branch_id, name, email, phone, role, avatar_url,
              is_active, email_verified, two_factor_enabled, last_login_at, created_at, updated_at
       FROM website_users
       WHERE id = $1 AND website_id = $2
       LIMIT 1`,
      [userId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('People GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const targetUserId = Number(params.id);
    const body = await request.json();

    const { name, email, phone, role, branch_id, is_active, password } = body;

    let hashedPassword = null;
    if (password && password.trim()) {
      hashedPassword = await hashPassword(password);
    }

    const res = await queryDb(
      `UPDATE website_users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           role = COALESCE($4, role),
           branch_id = COALESCE($5, branch_id),
           is_active = COALESCE($6, is_active),
           password = COALESCE($7, password),
           updated_at = NOW()
       WHERE id = $8 AND website_id = $9
       RETURNING id, id AS user_id, website_id, branch_id, name, email, phone, role, is_active, created_at, updated_at`,
      [
        name,
        email ? email.trim().toLowerCase() : null,
        phone,
        role,
        branch_id !== undefined ? (branch_id ? Number(branch_id) : null) : null,
        is_active,
        hashedPassword,
        targetUserId,
        website.id
      ]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'STAFF_ACCOUNT_UPDATED',
      details: `Updated staff user #${targetUserId} (${res.rows[0].email})`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('People PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const targetUserId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_users
       WHERE id = $1 AND website_id = $2
       RETURNING id, name, email`,
      [targetUserId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'STAFF_ACCOUNT_DELETED',
      details: `Deleted staff user "${res.rows[0].name}" (${res.rows[0].email})`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('People DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
