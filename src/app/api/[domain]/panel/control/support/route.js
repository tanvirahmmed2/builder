import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT s.id, s.id AS support_id, s.website_id, s.ticket_number, s.user_id,
              s.requester_name, s.requester_email, s.subject, s.priority, s.status,
              s.created_at, s.updated_at,
              COUNT(m.id) AS messages_count
       FROM website_support s
       LEFT JOIN website_support_messages m ON m.support_id = s.id
       WHERE s.website_id = $1
       GROUP BY s.id
       ORDER BY s.updated_at DESC, s.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Support GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
