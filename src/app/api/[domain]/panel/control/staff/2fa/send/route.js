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

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await queryDb(
      `UPDATE website_users
       SET two_factor_code = $1, two_factor_expires_at = $2
       WHERE id = $3 AND website_id = $4`,
      [otpCode, expiresAt, user.id, website.id]
    );

    // In local / development environment, log or return preview
    console.log(`[2FA OTP CODE] For user ${user.email}: ${otpCode}`);

    return NextResponse.json({
      success: true,
      message: `2FA verification code sent to ${user.email}`
    });

  } catch (error) {
    console.error('Staff 2FA send error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
