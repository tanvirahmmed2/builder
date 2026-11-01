import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');

    if (conversationId) {
      const messagesRes = await queryDb(
        `SELECT id, conversation_id, sender_type, message_type, content, delivery_status, created_at
         FROM website_meta_messages
         WHERE conversation_id = $1 AND website_id = $2
         ORDER BY created_at ASC`,
        [conversationId, website.id]
      );
      return NextResponse.json(messagesRes.rows);
    }

    const res = await queryDb(
      `SELECT c.id, c.platform, c.external_thread_id, c.status, c.last_message_at, c.created_at,
              ct.name as contact_name, ct.phone as contact_phone
       FROM website_meta_conversations c
       LEFT JOIN website_contacts ct ON c.contact_id = ct.id
       WHERE c.website_id = $1
       ORDER BY c.last_message_at DESC NULLS LAST, c.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Meta Inbox GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { conversation_id, content, sender_type = 'staff' } = body;

    if (!conversation_id || !content?.trim()) {
      return NextResponse.json({ success: false, error: 'Conversation ID and message content are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_meta_messages (website_id, conversation_id, sender_type, message_type, content, delivery_status, created_at)
       VALUES ($1, $2, $3, 'text', $4, 'sent', NOW())
       RETURNING *`,
      [website.id, conversation_id, sender_type, content.trim()]
    );

    // Update conversation timestamp
    await queryDb(
      `UPDATE website_meta_conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1 AND website_id = $2`,
      [conversation_id, website.id]
    );

    return NextResponse.json({ success: true, message: res.rows[0] });
  } catch (error) {
    console.error('Meta Inbox POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

