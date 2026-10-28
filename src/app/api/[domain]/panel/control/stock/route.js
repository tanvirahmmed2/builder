import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT p.id, p.id AS product_id, p.website_id, p.name, p.slug, p.sku, p.barcode,
              p.buy_price, p.sale_price, p.stock, p.unit, p.image, p.is_active,
              c.id AS category_id, c.name AS category_name, b.name AS brand_name,
              (p.stock * p.buy_price) AS total_cost_value,
              (p.stock * p.sale_price) AS total_retail_value
       FROM website_products p
       LEFT JOIN website_categories c ON c.id = p.category_id
       LEFT JOIN website_brands b ON b.id = p.brand_id
       WHERE p.website_id = $1
       ORDER BY p.stock ASC, p.name ASC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Stock GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
