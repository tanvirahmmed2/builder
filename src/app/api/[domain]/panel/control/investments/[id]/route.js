import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const investmentId = Number(params.id);
    const body = await request.json();

    const { amount, payment_method, reference_no, investment_date, note } = body;

    const res = await queryDb(
      `UPDATE website_investments
       SET amount = COALESCE($1, amount),
           payment_method = COALESCE($2, payment_method),
           reference_no = COALESCE($3, reference_no),
           investment_date = COALESCE($4, investment_date),
           note = COALESCE($5, note)
       WHERE id = $6 AND website_id = $7
       RETURNING id, id AS investment_id, website_id, investor_id, amount, payment_method, reference_no, investment_date, note, created_at`,
      [amount !== undefined ? parseFloat(amount) : null, payment_method, reference_no, investment_date, note, investmentId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Investment not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'INVESTMENT_UPDATED',
      details: `Updated investment #${investmentId}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Investment PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const investmentId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_investments
       WHERE id = $1 AND website_id = $2
       RETURNING id, amount, investor_id`,
      [investmentId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Investment not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'INVESTMENT_DELETED',
      details: `Deleted investment #${investmentId} of ৳${res.rows[0].amount}`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Investment DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
