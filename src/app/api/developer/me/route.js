import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/developer';

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, user: null, message: 'Not logged in.' }, { status: 401 });
    }

    const role = (user.role || '').toLowerCase();
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: role === 'admin',
        isActive: user.is_active !== false,
        isVerified: user.is_verified === true,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
