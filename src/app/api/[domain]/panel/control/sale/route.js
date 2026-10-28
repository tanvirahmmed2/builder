import { NextResponse } from 'next/server';
import { queryDb, pool } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const branchId = searchParams.get('branch_id');
    const search = searchParams.get('search');

    let sql = `
      SELECT s.id, s.id AS order_id, s.website_id, s.branch_id, s.user_id, s.customer_id,
             s.customer_name, s.customer_phone, s.invoice_no, s.subtotal, s.tax_amount,
             s.delivery_charge, s.discount_amount, s.total_amount, s.amount_received,
             s.change_amount, s.paid_amount, s.due_amount, s.payment_type, s.payment_status,
             s.order_status, s.note, s.items, s.created_at, s.updated_at,
             b.name AS branch_name, b.code AS branch_code,
             u.name AS staff_name
      FROM website_sales s
      LEFT JOIN website_branches b ON b.id = s.branch_id
      LEFT JOIN website_users u ON u.id = s.user_id
      WHERE s.website_id = $1
    `;
    const params = [website.id];
    let pIdx = 2;

    if (status && status !== 'all') {
      sql += ` AND LOWER(s.order_status) = $${pIdx}`;
      params.push(status.toLowerCase());
      pIdx++;
    }

    if (branchId && branchId !== 'all') {
      sql += ` AND s.branch_id = $${pIdx}`;
      params.push(Number(branchId));
      pIdx++;
    }

    if (search && search.trim()) {
      sql += ` AND (LOWER(s.customer_name) LIKE $${pIdx} OR LOWER(s.customer_phone) LIKE $${pIdx} OR LOWER(COALESCE(s.invoice_no, '')) LIKE $${pIdx})`;
      params.push(`%${search.trim().toLowerCase()}%`);
      pIdx++;
    }

    sql += ` ORDER BY s.id DESC`;

    const res = await queryDb(sql, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Sale GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  const client = await pool.connect();
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) {
      client.release();
      return errorResponse;
    }

    const body = await request.json();
    const {
      customer_name = 'Walk-in Customer',
      customer_phone = '+880',
      branch_id,
      items = [],
      subtotal = 0,
      tax_amount = 0,
      delivery_charge = 0,
      discount_amount = 0,
      total_amount,
      amount_received,
      change_amount = 0,
      payment_type = 'cash',
      payment_status,
      order_status = 'delivered',
      note = ''
    } = body;

    const parsedSubtotal = parseFloat(subtotal) || 0;
    const parsedTax = parseFloat(tax_amount) || 0;
    const parsedDelivery = parseFloat(delivery_charge) || 0;
    const parsedDiscount = parseFloat(discount_amount) || 0;
    const computedTotal = total_amount !== undefined
      ? parseFloat(total_amount)
      : Math.max(0, parsedSubtotal + parsedTax + parsedDelivery - parsedDiscount);

    const received = amount_received !== undefined ? parseFloat(amount_received) : computedTotal;
    const paidAmt = payment_type === 'cash' ? Math.min(computedTotal, received) : computedTotal;
    const dueAmt = Math.max(0, computedTotal - paidAmt);
    const resolvedPayStatus = payment_status || (dueAmt <= 0 ? 'PAID' : (paidAmt > 0 ? 'PARTIAL' : 'DUE'));

    const invoiceNo = `POS-${Date.now().toString().slice(-6)}`;
    const effectiveBranchId = branch_id ? Number(branch_id) : (user?.branch_id || null);

    await client.query('BEGIN');

    // 1. Ensure / update customer record
    let customerId = null;
    if (customer_phone && customer_phone.trim() !== '+880') {
      const custRes = await client.query(
        `INSERT INTO website_customers (website_id, name, phone, total_spent, total_orders)
         VALUES ($1, $2, $3, $4, 1)
         ON CONFLICT (website_id, phone) DO UPDATE
         SET name = COALESCE(EXCLUDED.name, website_customers.name),
             total_spent = website_customers.total_spent + EXCLUDED.total_spent,
             total_orders = website_customers.total_orders + 1,
             updated_at = NOW()
         RETURNING id`,
        [website.id, customer_name.trim() || 'Walk-in Customer', customer_phone.trim(), computedTotal]
      );
      customerId = custRes.rows[0]?.id;
    }

    // 2. Insert into website_sales
    const saleRes = await client.query(
      `INSERT INTO website_sales (
         website_id, branch_id, user_id, customer_id, customer_name, customer_phone,
         invoice_no, subtotal, tax_amount, delivery_charge, discount_amount,
         total_amount, amount_received, change_amount, paid_amount, due_amount,
         payment_type, payment_status, order_status, note, items
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING *`,
      [
        website.id,
        effectiveBranchId,
        user?.id || null,
        customerId,
        customer_name || 'Walk-in Customer',
        customer_phone || '+880',
        invoiceNo,
        parsedSubtotal,
        parsedTax,
        parsedDelivery,
        parsedDiscount,
        computedTotal,
        received,
        parseFloat(change_amount) || 0,
        paidAmt,
        dueAmt,
        payment_type,
        resolvedPayStatus,
        order_status,
        note,
        JSON.stringify(items)
      ]
    );

    const sale = saleRes.rows[0];

    // 3. Insert items and decrement product stock
    for (const item of items) {
      const prodId = item.product_id ? Number(item.product_id) : null;
      const qty = parseInt(item.quantity, 10) || 1;
      const unitPrice = parseFloat(item.unit_price || item.sale_price || item.price) || 0;
      const itemSubtotal = qty * unitPrice;

      await client.query(
        `INSERT INTO website_sale_items (sale_id, website_id, product_id, variant_id, product_name, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [sale.id, website.id, prodId, item.variant_id ? Number(item.variant_id) : null, item.name || item.product_name || 'Product', qty, unitPrice, itemSubtotal]
      );

      if (prodId) {
        await client.query(
          `UPDATE website_products
           SET stock = GREATEST(0, stock - $1), updated_at = NOW()
           WHERE id = $2 AND website_id = $3`,
          [qty, prodId, website.id]
        );
      }
    }

    // 4. Record sale payment
    if (paidAmt > 0) {
      await client.query(
        `INSERT INTO website_sale_payments (sale_id, website_id, amount, payment_method, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [sale.id, website.id, paidAmt, payment_type, `Payment for invoice #${invoiceNo}`]
      );
    }

    await client.query('COMMIT');

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      branchId: effectiveBranchId,
      action: 'SALE_COMPLETED',
      details: `POS Sale completed: #${invoiceNo} of ৳${computedTotal} (${payment_type})`,
      req: request
    });

    return NextResponse.json({
      success: true,
      order_id: sale.id,
      invoice_no: invoiceNo,
      total_amount: computedTotal,
      sale
    }, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sale POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
