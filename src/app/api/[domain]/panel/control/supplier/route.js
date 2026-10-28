import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, id AS supplier_id, website_id, name, company_name, email, phone, address, balance, note, is_active, created_at, updated_at
       FROM website_suppliers
       WHERE website_id = $1
       ORDER BY name ASC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Supplier GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, company_name, email, phone, address, balance = 0, note, is_active = true } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Supplier name is required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_suppliers (website_id, name, company_name, email, phone, address, balance, note, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, id AS supplier_id, website_id, name, company_name, email, phone, address, balance, note, is_active, created_at, updated_at`,
      [website.id, name.trim(), company_name || null, email || null, phone || null, address || null, parseFloat(balance) || 0, note || null, is_active]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SUPPLIER_CREATED',
      details: `Created supplier "${name}"`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Supplier POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
