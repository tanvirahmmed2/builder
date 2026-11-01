import { NextResponse } from 'next/server';
import { WEBSITE_AUTH_COOKIE } from '@/lib/middleware/user';
import { WEBSITE_STAFF_AUTH_COOKIE } from '@/lib/middleware/website/staff';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete(WEBSITE_STAFF_AUTH_COOKIE);
  response.cookies.delete(WEBSITE_AUTH_COOKIE);
  return response;
}

