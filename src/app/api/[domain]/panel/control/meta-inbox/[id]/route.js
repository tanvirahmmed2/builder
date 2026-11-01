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
    const { status } = body;

    const res = await queryDb(
      `UPDATE website_meta_conversations
       SET status = COALESCE($1, status), updated_at = NOW()
       WHERE id = $2 AND website_id = $3
       RETURNING *`,
      [status, id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    return NextResponse.json({ success: true, conversation: res.rows[0] });
  } catch (error) {
    console.error('Meta Inbox PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;

    await queryDb(`DELETE FROM website_meta_messages WHERE conversation_id = $1 AND website_id = $2`, [id, website.id]);
    const res = await queryDb(`DELETE FROM website_meta_conversations WHERE id = $1 AND website_id = $2 RETURNING id`, [id, website.id]);

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Meta Inbox DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

