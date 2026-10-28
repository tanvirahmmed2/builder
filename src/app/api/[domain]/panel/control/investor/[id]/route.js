import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const investorId = Number(params.id);

    const res = await queryDb(
      `SELECT id, id AS investor_id, website_id, name, phone, email, address, nid_passport, is_active, note, created_at, updated_at
       FROM website_investors
       WHERE id = $1 AND website_id = $2
       LIMIT 1`,
      [investorId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Investor not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Investor GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const investorId = Number(params.id);
    const body = await request.json();

    const { name, phone, email, address, nid_passport, is_active, note } = body;

    const res = await queryDb(
      `UPDATE website_investors
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           address = COALESCE($4, address),
           nid_passport = COALESCE($5, nid_passport),
           is_active = COALESCE($6, is_active),
           note = COALESCE($7, note),
           updated_at = NOW()
       WHERE id = $8 AND website_id = $9
       RETURNING id, id AS investor_id, website_id, name, phone, email, address, nid_passport, is_active, note, created_at, updated_at`,
      [name, phone, email, address, nid_passport, is_active, note, investorId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Investor not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'INVESTOR_UPDATED',
      details: `Updated investor #${investorId}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Investor PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const investorId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_investors
       WHERE id = $1 AND website_id = $2
       RETURNING id, name`,
      [investorId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Investor not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'INVESTOR_DELETED',
      details: `Deleted investor "${res.rows[0].name}" (#${investorId})`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Investor deleted successfully' });
  } catch (error) {
    console.error('Investor DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
