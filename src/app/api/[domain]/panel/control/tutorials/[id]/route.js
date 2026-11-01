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
    const { title, summary, difficulty_level, estimated_time_minutes, is_published } = body;

    const res = await queryDb(
      `UPDATE website_tutorials
       SET title = COALESCE($1, title),
           summary = COALESCE($2, summary),
           difficulty_level = COALESCE($3, difficulty_level),
           estimated_time_minutes = COALESCE($4, estimated_time_minutes),
           is_published = COALESCE($5, is_published),
           updated_at = NOW()
       WHERE id = $6 AND website_id = $7
       RETURNING *`,
      [title, summary, difficulty_level, estimated_time_minutes ? Number(estimated_time_minutes) : null, is_published, id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Tutorial not found' }, { status: 404 });
    return NextResponse.json({ success: true, tutorial: res.rows[0] });
  } catch (error) {
    console.error('Tutorials PUT error:', error);
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
      `DELETE FROM website_tutorials WHERE id = $1 AND website_id = $2 RETURNING id`,
      [id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Tutorial not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Tutorials DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

