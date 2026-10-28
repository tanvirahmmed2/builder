import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { code, enable = true } = body;

    const userRes = await queryDb(
      `SELECT two_factor_code, two_factor_expires_at FROM website_users WHERE id = $1 AND website_id = $2`,
      [user.id, website.id]
    );

    const record = userRes.rows[0];
    if (!record || record.two_factor_code !== String(code).trim()) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
    }

    if (new Date(record.two_factor_expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Verification code has expired. Please request a new code.' }, { status: 400 });
    }

    // Code verified: toggle 2FA
    await queryDb(
      `UPDATE website_users
       SET two_factor_enabled = $1, two_factor_code = NULL, two_factor_expires_at = NULL, updated_at = NOW()
       WHERE id = $2 AND website_id = $3`,
      [enable, user.id, website.id]
    );

    return NextResponse.json({
      success: true,
      two_factor_enabled: enable,
      message: enable ? 'Two-factor authentication enabled successfully!' : 'Two-factor authentication disabled.'
    });

  } catch (error) {
    console.error('Staff 2FA verify error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
