import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { resolveWebsiteFromRequest, comparePassword, generateWebsiteToken, WEBSITE_AUTH_COOKIE } from '@/lib/middleware/user';
import { generateStaffToken, WEBSITE_STAFF_AUTH_COOKIE } from '@/lib/middleware/website/staff';

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

    // 1. First look in website_staffs
    let staff = null;
    const staffRes = await queryDb(
      `SELECT id, website_id, branch_id, first_name, last_name, email, phone, 
              password_hash, avatar_url, status, is_superadmin
       FROM website_staffs
       WHERE website_id = $1 AND (LOWER(email) = LOWER($2) OR phone = $2)
       LIMIT 1`,
      [websiteId, identifier]
    );

    if (staffRes.rows.length > 0) {
      staff = staffRes.rows[0];
      const isMatch = await comparePassword(password, staff.password_hash);
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
      }
      if (staff.status !== 'active') {
        return NextResponse.json({ success: false, error: 'Staff account is suspended' }, { status: 403 });
      }
    } else {
      // 2. Fallback check website_users (e.g. site owner)
      const userRes = await queryDb(
        `SELECT id, website_id, first_name, last_name, email, phone, password_hash, avatar_url, status
         FROM website_users
         WHERE website_id = $1 AND (LOWER(email) = LOWER($2) OR phone = $2)
         LIMIT 1`,
        [websiteId, identifier]
      );

      if (userRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
      }

      const user = userRes.rows[0];
      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
      }

      staff = {
        id: user.id,
        website_id: user.website_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        is_superadmin: true
      };
    }

    // Generate tokens
    const staffToken = generateStaffToken({
      staffId: staff.id,
      userId: staff.id,
      websiteId,
      email: staff.email,
      name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim()
    });

    const sessionToken = generateWebsiteToken({
      userId: staff.id,
      websiteId,
      email: staff.email,
      name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim()
    });

    const response = NextResponse.json({
      success: true,
      message: 'Staff authenticated successfully',
      data: {
        staff: {
          id: staff.id,
          name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim(),
          email: staff.email,
          phone: staff.phone,
          is_superadmin: staff.is_superadmin
        },
        token: staffToken
      }
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    };

    response.cookies.set(WEBSITE_STAFF_AUTH_COOKIE, staffToken, cookieOptions);
    response.cookies.set(WEBSITE_AUTH_COOKIE, sessionToken, cookieOptions);

    return response;
  } catch (error) {
    console.error('Staff login error:', error);
    return NextResponse.json({ success: false, error: 'Staff authentication failed' }, { status: 500 });
  }
}

