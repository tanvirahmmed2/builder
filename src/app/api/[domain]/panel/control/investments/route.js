import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT inv.id, inv.id AS investment_id, inv.website_id, inv.investor_id,
              inv.amount, inv.payment_method, inv.reference_no, inv.investment_date,
              inv.note, inv.created_at,
              i.name AS investor_name, i.phone AS investor_phone
       FROM website_investments inv
       JOIN website_investors i ON i.id = inv.investor_id
       WHERE inv.website_id = $1
       ORDER BY inv.investment_date DESC, inv.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Investments GET API error:', error);
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
      investment_date = new Date().toISOString().split('T')[0],
      note = ''
    } = body;

    const invAmt = parseFloat(amount);
    if (!investor_id || !invAmt || invAmt <= 0) {
      return NextResponse.json({ success: false, error: 'Valid investor and amount are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_investments (website_id, investor_id, amount, payment_method, reference_no, investment_date, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, id AS investment_id, website_id, investor_id, amount, payment_method, reference_no, investment_date, note, created_at`,
      [website.id, Number(investor_id), invAmt, payment_method, reference_no, investment_date, note]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'INVESTMENT_RECORDED',
      details: `Recorded investment of ৳${invAmt} for investor #${investor_id}`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Investments POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
