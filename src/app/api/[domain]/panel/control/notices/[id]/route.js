import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const noticeId = Number(params.id);

    const res = await queryDb(
      `SELECT n.id, n.id AS notice_id, n.website_id, n.created_by, n.title,
              n.description, n.notice_date, n.is_active, n.created_at, n.updated_at,
              u.name AS author_name
       FROM website_notices n
       LEFT JOIN website_users u ON u.id = n.created_by
       WHERE n.id = $1 AND n.website_id = $2
       LIMIT 1`,
      [noticeId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Notice not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Notice GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const noticeId = Number(params.id);
    const body = await request.json();

    const { title, description, notice_date, is_active } = body;

    const res = await queryDb(
      `UPDATE website_notices
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           notice_date = COALESCE($3, notice_date),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5 AND website_id = $6
       RETURNING id, id AS notice_id, website_id, created_by, title, description, notice_date, is_active, created_at, updated_at`,
      [title, description, notice_date, is_active, noticeId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Notice not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'NOTICE_UPDATED',
      details: `Updated notice #${noticeId}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Notice PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const noticeId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_notices
       WHERE id = $1 AND website_id = $2
       RETURNING id, title`,
      [noticeId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Notice not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'NOTICE_DELETED',
      details: `Deleted notice "${res.rows[0].title}" (#${noticeId})`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Notice DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
