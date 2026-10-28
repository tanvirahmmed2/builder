import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { investor_id, amount, note = '', transfer_date = new Date().toISOString().split('T')[0] } = body;

    const transAmt = parseFloat(amount);
    if (!investor_id || !transAmt || transAmt <= 0) {
      return NextResponse.json({ success: false, error: 'Valid investor and transfer amount are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_profit_transfers (website_id, investor_id, amount, note, transfer_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [website.id, Number(investor_id), transAmt, note, transfer_date]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'PROFIT_TRANSFERRED',
      details: `Distributed profit of ৳${transAmt} to investor #${investor_id}`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Profit transfer POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
