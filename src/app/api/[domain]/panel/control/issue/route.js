import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // 1. Receivers list
    if (action === 'receivers') {
      const recRes = await queryDb(
        `SELECT id, name, role, email
         FROM website_users
         WHERE website_id = $1 AND is_active = TRUE
         ORDER BY role ASC, name ASC`,
        [website.id]
      );
      return NextResponse.json(recRes.rows);
    }

    // 2. Issues list
    const res = await queryDb(
      `SELECT i.id, i.id AS issue_id, i.website_id, i.sender_id, i.receiver_id,
              i.title, i.message, i.status, i.priority, i.created_at, i.updated_at,
              s.name AS sender_name, s.role AS sender_role,
              r.name AS receiver_name, r.role AS receiver_role
       FROM website_issues i
       JOIN website_users s ON s.id = i.sender_id
       LEFT JOIN website_users r ON r.id = i.receiver_id
       WHERE i.website_id = $1
       ORDER BY i.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Issue GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { receiver_id, receiverId, title, message, priority = 'medium' } = body;
    const recId = receiver_id || receiverId;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Title and message are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_issues (website_id, sender_id, receiver_id, title, message, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, id AS issue_id, website_id, sender_id, receiver_id, title, message, status, priority, created_at, updated_at`,
      [website.id, user.id, recId ? Number(recId) : null, title.trim(), message.trim(), priority]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user.id,
      userName: user.name,
      action: 'ISSUE_FILED',
      details: `Filed issue log: "${title}"`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Issue POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
