import { NextResponse } from 'next/server';
import { queryDb, pool } from '@/lib/db/pg';
import { resolveWebsiteFromRequest, hashPassword } from '@/lib/middleware/user';
import { generateUserToken, WEBSITE_USER_AUTH_COOKIE } from '@/lib/middleware/website/user';

export async function POST(req, { params }) {
  try {
    const { domain } = await params;
    const website = await resolveWebsiteFromRequest(req, domain);

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const websiteId = website.id;
    const { firstName, lastName, email, phone, password } = await req.json();

    if (!firstName || (!email && !phone) || !password) {
      return NextResponse.json({ success: false, error: 'Name, email/phone, and password are required' }, { status: 400 });
    }

    // Check if user already exists on this tenant
    const existing = await queryDb(
      'SELECT id FROM website_users WHERE website_id = $1 AND (email = $2 OR (phone = $3 AND $3 IS NOT NULL)) LIMIT 1',
      [websiteId, email || null, phone || null]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'An account with this email or phone already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        `INSERT INTO website_users (website_id, first_name, last_name, email, phone, password_hash, is_verified, status)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE, 'active')
         RETURNING id, first_name, last_name, email, phone`,
        [websiteId, firstName, lastName || '', email || null, phone || null, passwordHash]
      );
      const user = userRes.rows[0];

      // Create linked customer record
      await client.query(
        `INSERT INTO website_customers (website_id, user_id, customer_code, status)
         VALUES ($1, $2, $3, 'active')`,
        [websiteId, user.id, `CUST-${Date.now().toString().slice(-6)}`]
      );

      await client.query('COMMIT');

      // Generate JWT
      const token = generateUserToken({
        userId: user.id,
        websiteId,
        email: user.email,
        name: `${user.first_name} ${user.last_name || ''}`.trim()
      });

      const response = NextResponse.json({
        success: true,
        message: 'Registration successful',
        data: { user, token }
      });

      // Set HTTP-only session cookie
      response.cookies.set(WEBSITE_USER_AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60
      });

      return response;
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Customer register error:', error);
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}

