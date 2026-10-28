import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT w.id, w.id AS withdrawal_id, w.website_id, w.investor_id,
              w.amount, w.payment_method, w.reference_no, w.withdrawal_date,
              w.note, w.created_at,
              i.name AS investor_name, i.phone AS investor_phone
       FROM website_withdrawals w
       JOIN website_investors i ON i.id = w.investor_id
       WHERE w.website_id = $1
       ORDER BY w.withdrawal_date DESC, w.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Withdrawals GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const {
      investor_id,
      amount,
      payment_method = 'bank_transfer',
      reference_no = '',
      withdrawal_date = new Date().toISOString().split('T')[0],
      note = ''
    } = body;

    const withAmt = parseFloat(amount);
    if (!investor_id || !withAmt || withAmt <= 0) {
      return NextResponse.json({ success: false, error: 'Valid investor and withdrawal amount are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_withdrawals (website_id, investor_id, amount, payment_method, reference_no, withdrawal_date, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, id AS withdrawal_id, website_id, investor_id, amount, payment_method, reference_no, withdrawal_date, note, created_at`,
      [website.id, Number(investor_id), withAmt, payment_method, reference_no, withdrawal_date, note]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'WITHDRAWAL_RECORDED',
      details: `Recorded investor withdrawal of ৳${withAmt} for investor #${investor_id}`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Withdrawals POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
