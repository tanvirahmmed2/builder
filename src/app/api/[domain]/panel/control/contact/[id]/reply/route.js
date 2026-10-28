import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const contactId = Number(params.id);

    const body = await request.json();
    const { reply } = body;

    if (!reply || !reply.trim()) {
      return NextResponse.json({ success: false, error: 'Reply text cannot be empty' }, { status: 400 });
    }

    const res = await queryDb(
      `UPDATE website_contact
       SET reply = $1,
           status = 'REPLIED',
           replied_at = NOW(),
           updated_at = NOW()
       WHERE id = $2 AND website_id = $3
       RETURNING *`,
      [reply.trim(), contactId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Contact message not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'CONTACT_REPLIED',
      details: `Replied to contact inquiry #${contactId}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Contact reply POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
