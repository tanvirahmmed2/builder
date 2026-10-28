import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const [sharesRes, totalInvRes] = await Promise.all([
      queryDb(
        `SELECT s.id, s.id AS share_id, s.website_id, s.investor_id, s.shares_count,
                s.share_percentage, s.share_value, s.note, s.created_at, s.updated_at,
                i.name AS investor_name, i.phone AS investor_phone,
                COALESCE(inv.total_invested, 0) AS total_invested
         FROM website_shares s
         JOIN website_investors i ON i.id = s.investor_id
         LEFT JOIN (
           SELECT investor_id, SUM(amount) AS total_invested
           FROM website_investments
           WHERE website_id = $1
           GROUP BY investor_id
         ) inv ON inv.investor_id = s.investor_id
         WHERE s.website_id = $1
         ORDER BY s.share_percentage DESC`,
        [website.id]
      ),
      queryDb(
        `SELECT COALESCE(SUM(amount), 0) AS grand_investment
         FROM website_investments
         WHERE website_id = $1`,
        [website.id]
      )
    ]);

    const grandTotal = parseFloat(totalInvRes.rows[0]?.grand_investment || 0);

    return NextResponse.json({
      shares: sharesRes.rows,
      grand_total_investment: grandTotal
    });

  } catch (error) {
    console.error('Shares GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
