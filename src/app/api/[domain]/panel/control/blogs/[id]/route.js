import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function PUT(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;
    const body = await request.json();
    const { title, summary, content, thumbnail_url, is_published } = body;

    const res = await queryDb(
      `UPDATE website_blogs
       SET title = COALESCE($1, title),
           summary = COALESCE($2, summary),
           content = COALESCE($3, content),
           thumbnail_url = COALESCE($4, thumbnail_url),
           is_published = COALESCE($5, is_published),
           updated_at = NOW()
       WHERE id = $6 AND website_id = $7
       RETURNING *`,
      [title, summary, content, thumbnail_url, is_published, id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    return NextResponse.json({ success: true, blog: res.rows[0] });
  } catch (error) {
    console.error('Blogs PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;

    const res = await queryDb(
      `DELETE FROM website_blogs WHERE id = $1 AND website_id = $2 RETURNING id`,
      [id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Blogs DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

