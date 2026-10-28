import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const identifier = params.id;
    const isNum = !isNaN(Number(identifier));

    const condition = isNum ? '(s.id = $1 OR s.ticket_number = $2)' : 's.ticket_number = $2';
    const ticketRes = await queryDb(
      `SELECT s.id, s.id AS support_id, s.website_id, s.ticket_number, s.user_id,
              s.requester_name, s.requester_email, s.subject, s.priority, s.status,
              s.created_at, s.updated_at
       FROM website_support s
       WHERE ${condition} AND s.website_id = $3
       LIMIT 1`,
      [isNum ? Number(identifier) : -1, String(identifier), website.id]
    );

    if (ticketRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Support ticket not found' }, { status: 404 });
    }

    const ticket = ticketRes.rows[0];

    // Fetch messages with images
    const messagesRes = await queryDb(
      `SELECT m.id, m.support_id, m.sender_type, m.sender_id, m.sender_name, m.message, m.created_at,
              COALESCE(
                json_agg(
                  json_build_object('id', img.id, 'image_url', img.image_url, 'file_name', img.file_name)
                ) FILTER (WHERE img.id IS NOT NULL),
                '[]'
              ) AS images
       FROM website_support_messages m
       LEFT JOIN website_support_images img ON img.message_id = m.id
       WHERE m.support_id = $1 AND m.website_id = $2
       GROUP BY m.id
       ORDER BY m.id ASC`,
      [ticket.id, website.id]
    );

    return NextResponse.json({
      ...ticket,
      messages: messagesRes.rows
    });

  } catch (error) {
    console.error('Support GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const identifier = params.id;
    const isNum = !isNaN(Number(identifier));

    const body = await request.json();
    const { status, priority } = body;

    const condition = isNum ? '(id = $1 OR ticket_number = $2)' : 'ticket_number = $2';
    const res = await queryDb(
      `UPDATE website_support
       SET status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           updated_at = NOW()
       WHERE ${condition} AND website_id = $5
       RETURNING *`,
      [isNum ? Number(identifier) : -1, String(identifier), status, priority, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Support ticket not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SUPPORT_TICKET_UPDATED',
      details: `Updated ticket #${res.rows[0].ticket_number}: status=${status || res.rows[0].status}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Support PATCH ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const identifier = params.id;
    const isNum = !isNaN(Number(identifier));

    const condition = isNum ? '(id = $1 OR ticket_number = $2)' : 'ticket_number = $2';
    const res = await queryDb(
      `DELETE FROM website_support
       WHERE ${condition} AND website_id = $3
       RETURNING id, ticket_number`,
      [isNum ? Number(identifier) : -1, String(identifier), website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Support ticket not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SUPPORT_TICKET_DELETED',
      details: `Deleted ticket #${res.rows[0].ticket_number}`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Support DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
