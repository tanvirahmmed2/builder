import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';
import { hashPassword } from '@/lib/middleware/user';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT u.id, u.id AS user_id, u.website_id, u.branch_id, u.name, u.email,
              u.phone, u.role, u.avatar_url, u.is_active, u.email_verified,
              u.two_factor_enabled, u.last_login_at, u.created_at, u.updated_at,
              b.name AS branch_name, b.code AS branch_code
       FROM website_users u
       LEFT JOIN website_branches b ON b.id = u.branch_id
       WHERE u.website_id = $1
       ORDER BY u.id ASC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('People GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, email, password, phone, role = 'staff', branch_id, is_active = true } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if email already registered on this website
    const existing = await queryDb(
      `SELECT id FROM website_users WHERE website_id = $1 AND LOWER(email) = LOWER($2) LIMIT 1`,
      [website.id, email.trim()]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists on this store' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const res = await queryDb(
      `INSERT INTO website_users (
         website_id, branch_id, name, email, password, phone, role, is_active, email_verified
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
       RETURNING id, id AS user_id, website_id, branch_id, name, email, phone, role, is_active, created_at, updated_at`,
      [
        website.id,
        branch_id ? Number(branch_id) : null,
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        phone || null,
        role,
        is_active
      ]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'STAFF_ACCOUNT_CREATED',
      details: `Created staff user "${name}" (${email}) with role ${role}`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('People POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
