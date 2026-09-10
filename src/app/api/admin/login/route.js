import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/admin/admin';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const result = await authenticateAdmin(email, password);
    return NextResponse.json({
      success: true,
      admin: result.admin,
      message: 'Logged in successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed.' },
      { status: 401 }
    );
  }
}
