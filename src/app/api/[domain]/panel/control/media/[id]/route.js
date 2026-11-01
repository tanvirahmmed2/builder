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
    const { file_name, alt_text } = body;

    const res = await queryDb(
      `UPDATE website_media
       SET file_name = COALESCE($1, file_name),
           alt_text = COALESCE($2, alt_text),
           updated_at = NOW()
       WHERE id = $3 AND website_id = $4
       RETURNING *`,
      [file_name, alt_text, id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Media file not found' }, { status: 404 });
    return NextResponse.json({ success: true, media: res.rows[0] });
  } catch (error) {
    console.error('Media PUT error:', error);
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
      `DELETE FROM website_media WHERE id = $1 AND website_id = $2 RETURNING id`,
      [id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Media file not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Media DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

