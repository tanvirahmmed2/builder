import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const [totalsRes, topProductsRes, dailyRes] = await Promise.all([
      queryDb(
        `SELECT COUNT(*) AS total_orders,
                COALESCE(SUM(total_amount), 0) AS total_revenue,
                COALESCE(SUM(paid_amount), 0) AS total_collected,
                COALESCE(SUM(due_amount), 0) AS total_due,
                COALESCE(SUM(discount_amount), 0) AS total_discounts
         FROM website_sales
         WHERE website_id = $1 AND order_status != 'cancelled'`,
        [website.id]
      ),
      queryDb(
        `SELECT product_name, SUM(quantity) AS total_qty, SUM(subtotal) AS total_amount
         FROM website_sale_items
         WHERE website_id = $1
         GROUP BY product_name
         ORDER BY total_qty DESC
         LIMIT 10`,
        [website.id]
      ),
      queryDb(
        `SELECT DATE(created_at) AS sale_date,
                COUNT(*) AS order_count,
                COALESCE(SUM(total_amount), 0) AS daily_revenue
         FROM website_sales
         WHERE website_id = $1 AND order_status != 'cancelled'
         GROUP BY DATE(created_at)
         ORDER BY sale_date DESC
         LIMIT 30`,
        [website.id]
      )
    ]);

    return NextResponse.json({
      summary: totalsRes.rows[0],
      top_products: topProductsRes.rows,
      daily_sales: dailyRes.rows
    });

  } catch (error) {
    console.error('Report GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
