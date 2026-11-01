import { NextResponse } from 'next/server';
import { WEBSITE_USER_AUTH_COOKIE } from '@/lib/middleware/website/user';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete(WEBSITE_USER_AUTH_COOKIE);
  return response;
}

