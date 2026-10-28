import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const identifier = params.id;
    const isNum = !isNaN(Number(identifier));

    let custRes;
    if (isNum) {
      custRes = await queryDb(
        `SELECT id, id AS customer_id, website_id, name, phone, email, address, total_spent, total_orders, created_at, updated_at
         FROM website_customers
         WHERE (id = $1 OR phone = $2) AND website_id = $3
         LIMIT 1`,
        [Number(identifier), String(identifier), website.id]
      );
    } else {
      custRes = await queryDb(
        `SELECT id, id AS customer_id, website_id, name, phone, email, address, total_spent, total_orders, created_at, updated_at
         FROM website_customers
         WHERE phone = $1 AND website_id = $2
         LIMIT 1`,
        [String(identifier), website.id]
      );
    }

    if (custRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const customer = custRes.rows[0];

    // Fetch customer's orders history
    const ordersRes = await queryDb(
      `SELECT id, id AS order_id, invoice_no, total_amount, paid_amount, due_amount,
              payment_type, order_status, created_at
       FROM website_sales
       WHERE (customer_id = $1 OR customer_phone = $2) AND website_id = $3
       ORDER BY id DESC
       LIMIT 50`,
      [customer.id, customer.phone, website.id]
    );

    return NextResponse.json({
      ...customer,
      orders: ordersRes.rows
    });
  } catch (error) {
    console.error('Customers GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const identifier = params.id;
    const isNum = !isNaN(Number(identifier));

    const body = await request.json();
    const { name, email, phone, address } = body;

    const condition = isNum ? '(id = $5 OR phone = $6)' : 'phone = $6';

    const res = await queryDb(
      `UPDATE website_customers
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           updated_at = NOW()
       WHERE ${condition} AND website_id = $7
       RETURNING id, id AS customer_id, website_id, name, phone, email, address, total_spent, total_orders, created_at, updated_at`,
      [name, email, phone, address, isNum ? Number(identifier) : -1, String(identifier), website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'CUSTOMER_UPDATED',
      details: `Updated customer profile #${res.rows[0].id}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Customers PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
