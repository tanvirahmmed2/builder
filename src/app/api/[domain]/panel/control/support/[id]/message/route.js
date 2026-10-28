import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const identifier = params.id;
    const isNum = !isNaN(Number(identifier));

    const condition = isNum ? '(id = $1 OR ticket_number = $2)' : 'ticket_number = $2';
    const ticketCheck = await queryDb(
      `SELECT id, ticket_number FROM website_support WHERE ${condition} AND website_id = $3 LIMIT 1`,
      [isNum ? Number(identifier) : -1, String(identifier), website.id]
    );

    if (ticketCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Support ticket not found' }, { status: 404 });
    }

    const ticketId = ticketCheck.rows[0].id;
    const ticketNumber = ticketCheck.rows[0].ticket_number;

    const body = await request.json();
    const { message, sender_name, sender_type = 'AGENT' } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message cannot be empty' }, { status: 400 });
    }

    const authorName = sender_name || user?.name || 'Support Staff';

    const msgRes = await queryDb(
      `INSERT INTO website_support_messages (support_id, website_id, sender_type, sender_id, sender_name, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [ticketId, website.id, sender_type, user?.id || null, authorName, message.trim()]
    );

    // Update ticket timestamp
    await queryDb(`UPDATE website_support SET updated_at = NOW() WHERE id = $1`, [ticketId]);

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SUPPORT_MESSAGE_SENT',
      details: `Replied to support ticket #${ticketNumber}`,
      req: request
    });

    return NextResponse.json(msgRes.rows[0], { status: 201 });
  } catch (error) {
    console.error('Support message POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
