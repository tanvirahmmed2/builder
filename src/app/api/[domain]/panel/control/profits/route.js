import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const [salesProfitRes, logsRes, investorsRes] = await Promise.all([
      queryDb(
        `SELECT COALESCE(SUM(s.total_amount), 0) AS total_revenue,
                COALESCE(SUM(si.quantity * p.buy_price), 0) AS total_cogs
         FROM website_sales s
         JOIN website_sale_items si ON si.sale_id = s.id
         LEFT JOIN website_products p ON p.id = si.product_id
         WHERE s.website_id = $1 AND s.order_status != 'cancelled'`,
        [website.id]
      ),
      queryDb(
        `SELECT pt.id, pt.id AS transfer_id, pt.amount, pt.note, pt.transfer_date, pt.created_at,
                i.name AS investor_name, i.phone AS investor_phone
         FROM website_profit_transfers pt
         JOIN website_investors i ON i.id = pt.investor_id
         WHERE pt.website_id = $1
         ORDER BY pt.transfer_date DESC, pt.id DESC`,
        [website.id]
      ),
      queryDb(
        `SELECT i.id, i.id AS investor_id, i.name AS investor_name,
                COALESCE(s.share_percentage, 0) AS share_percentage,
                COALESCE(t.total_transferred, 0) AS total_transferred
         FROM website_investors i
         LEFT JOIN website_shares s ON s.investor_id = i.id AND s.website_id = $1
         LEFT JOIN (
           SELECT investor_id, SUM(amount) AS total_transferred
           FROM website_profit_transfers
           WHERE website_id = $1
           GROUP BY investor_id
         ) t ON t.investor_id = i.id
         WHERE i.website_id = $1 AND i.is_active = TRUE
         ORDER BY i.name ASC`,
        [website.id]
      )
    ]);

    const rev = parseFloat(salesProfitRes.rows[0]?.total_revenue || 0);
    const cogs = parseFloat(salesProfitRes.rows[0]?.total_cogs || 0);
    const grandProfit = Math.max(0, rev - cogs);

    return NextResponse.json({
      grand_total_profit: grandProfit,
      logs: logsRes.rows,
      investor_summary: investorsRes.rows
    });

  } catch (error) {
    console.error('Profits GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
