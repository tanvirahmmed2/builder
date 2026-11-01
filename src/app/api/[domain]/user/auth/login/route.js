import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { resolveWebsiteFromRequest, comparePassword } from '@/lib/middleware/user';
import { generateUserToken, WEBSITE_USER_AUTH_COOKIE } from '@/lib/middleware/website/user';

export async function POST(req, { params }) {
  try {
    const { domain } = await params;
    const website = await resolveWebsiteFromRequest(req, domain);

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const websiteId = website.id;
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Email/phone and password are required' }, { status: 400 });
    }

    // Strict multi-tenant query: website_id = $1
    const userRes = await queryDb(
      `SELECT id, website_id, first_name, last_name, email, phone, password_hash, avatar_url, status
       FROM website_users
       WHERE website_id = $1 AND (email = $2 OR phone = $2)
       LIMIT 1`,
      [websiteId, identifier]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const user = userRes.rows[0];

    if (user.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Account is deactivated or suspended' }, { status: 403 });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateUserToken({
      userId: user.id,
      websiteId,
      email: user.email,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          email: user.email,
          phone: user.phone,
          avatar_url: user.avatar_url
        },
        token
      }
    });

    response.cookies.set(WEBSITE_USER_AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}

