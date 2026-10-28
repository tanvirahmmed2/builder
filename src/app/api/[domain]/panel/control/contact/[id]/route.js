import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const contactId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_contact
       WHERE id = $1 AND website_id = $2
       RETURNING id, name, subject`,
      [contactId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Contact message not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'CONTACT_DELETED',
      details: `Deleted contact inquiry #${contactId}`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Contact message deleted successfully' });
  } catch (error) {
    console.error('Contact DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
