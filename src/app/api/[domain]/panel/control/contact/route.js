import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, id AS contact_id, website_id, name, email, phone, subject,
              message, status, reply, replied_at, created_at, updated_at
       FROM website_contact
       WHERE website_id = $1
       ORDER BY id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Contact GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
