import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let sql = `
      SELECT p.id, p.id AS product_id, p.name, p.barcode, p.sku, p.sale_price, p.discount_price,
             p.unit, c.name AS category_name, b.name AS brand_name
      FROM website_products p
      LEFT JOIN website_categories c ON c.id = p.category_id
      LEFT JOIN website_brands b ON b.id = p.brand_id
      WHERE p.website_id = $1 AND p.is_active = TRUE
    `;
    const params = [website.id];

    if (category && category !== 'all') {
      sql += ` AND (p.category_id = $2 OR LOWER(c.slug) = $3)`;
      params.push(isNaN(Number(category)) ? -1 : Number(category), category.toLowerCase());
    }

    sql += ` ORDER BY p.name ASC`;

    const res = await queryDb(sql, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Price tag GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
