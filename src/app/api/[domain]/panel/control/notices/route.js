import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT n.id, n.id AS notice_id, n.website_id, n.created_by, n.title,
              n.description, n.notice_date, n.is_active, n.created_at, n.updated_at,
              u.name AS author_name
       FROM website_notices n
       LEFT JOIN website_users u ON u.id = n.created_by
       WHERE n.website_id = $1
       ORDER BY n.notice_date DESC, n.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Notices GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { title, description, notice_date = new Date().toISOString().split('T')[0], is_active = true } = body;

    if (!title || !description) {
      return NextResponse.json({ success: false, error: 'Title and description are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_notices (website_id, created_by, title, description, notice_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, id AS notice_id, website_id, created_by, title, description, notice_date, is_active, created_at, updated_at`,
      [website.id, user?.id || null, title.trim(), description.trim(), notice_date, is_active]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'NOTICE_POSTED',
      details: `Posted staff notice "${title}"`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Notices POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
