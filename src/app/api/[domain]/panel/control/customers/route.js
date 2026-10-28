import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let sql = `
      SELECT id, id AS customer_id, website_id, name, phone, email, address, total_spent, total_orders, created_at, updated_at
      FROM website_customers
      WHERE website_id = $1
    `;
    const params = [website.id];

    if (search.trim()) {
      sql += ` AND (LOWER(name) LIKE $2 OR LOWER(phone) LIKE $2 OR LOWER(COALESCE(email, '')) LIKE $2)`;
      params.push(`%${search.trim().toLowerCase()}%`);
    }

    sql += ` ORDER BY id DESC`;

    const res = await queryDb(sql, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Customers GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, phone, email, address } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_customers (website_id, name, phone, email, address)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (website_id, phone) DO UPDATE
       SET name = EXCLUDED.name,
           email = COALESCE(EXCLUDED.email, website_customers.email),
           address = COALESCE(EXCLUDED.address, website_customers.address),
           updated_at = NOW()
       RETURNING id, id AS customer_id, website_id, name, phone, email, address, total_spent, total_orders, created_at, updated_at`,
      [website.id, name.trim(), phone.trim(), email || null, address || null]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'CUSTOMER_SAVED',
      details: `Saved customer profile "${name}" (${phone})`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Customers POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
