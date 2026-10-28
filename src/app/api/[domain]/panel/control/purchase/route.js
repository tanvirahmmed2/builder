import { NextResponse } from 'next/server';
import { queryDb, pool } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT p.id, p.id AS purchase_id, p.website_id, p.branch_id, p.supplier_id, p.user_id,
              p.invoice_no, p.subtotal_amount, p.extra_discount, p.total_amount, p.total_paid,
              p.due_amount, p.payment_method, p.payment_status, p.note, p.items, p.created_at, p.updated_at,
              s.name AS supplier_name, s.phone AS supplier_phone,
              b.name AS branch_name, b.code AS branch_code,
              u.name AS staff_name, u.role AS staff_role
       FROM website_purchases p
       LEFT JOIN website_suppliers s ON s.id = p.supplier_id
       LEFT JOIN website_branches b ON b.id = p.branch_id
       LEFT JOIN website_users u ON u.id = p.user_id
       WHERE p.website_id = $1
       ORDER BY p.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Purchases GET API error:', error);
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
      supplier_id, branch_id, items = [], subtotal_amount = 0,
      extra_discount = 0, total_amount = 0, total_paid = 0,
      payment_method = 'Cash', note = ''
    } = body;

    const totalAmt = parseFloat(total_amount) || 0;
    const paidAmt = parseFloat(total_paid) || 0;
    const dueAmt = Math.max(0, totalAmt - paidAmt);
    const paymentStatus = dueAmt <= 0 ? 'PAID' : (paidAmt > 0 ? 'PARTIAL' : 'DUE');
    const invoiceNo = `PR-${Date.now().toString().slice(-6)}`;

    await client.query('BEGIN');

    // 1. Insert into website_purchases
    const purchaseRes = await client.query(
      `INSERT INTO website_purchases (
         website_id, branch_id, supplier_id, user_id, invoice_no,
         subtotal_amount, extra_discount, total_amount, total_paid,
         due_amount, payment_method, payment_status, note, items
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        website.id,
        branch_id ? Number(branch_id) : (user?.branch_id || null),
        supplier_id ? Number(supplier_id) : null,
        user?.id || null,
        invoiceNo,
        parseFloat(subtotal_amount) || totalAmt,
        parseFloat(extra_discount) || 0,
        totalAmt,
        paidAmt,
        dueAmt,
        payment_method,
        paymentStatus,
        note,
        JSON.stringify(items)
      ]
    );

    const purchase = purchaseRes.rows[0];

    // 2. Insert items into website_purchase_items & increment product stock
    for (const item of items) {
      const prodId = item.product_id ? Number(item.product_id) : null;
      const qty = parseInt(item.quantity, 10) || 1;
      const unitCost = parseFloat(item.unit_cost || item.buy_price) || 0;
      const itemSubtotal = qty * unitCost;

      await client.query(
        `INSERT INTO website_purchase_items (purchase_id, website_id, product_id, variant_id, product_name, quantity, unit_cost, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [purchase.id, website.id, prodId, item.variant_id ? Number(item.variant_id) : null, item.name || item.product_name || 'Item', qty, unitCost, itemSubtotal]
      );

      if (prodId) {
        await client.query(
          `UPDATE website_products
           SET stock = stock + $1,
               buy_price = CASE WHEN $2 > 0 THEN $2 ELSE buy_price END,
               updated_at = NOW()
           WHERE id = $3 AND website_id = $4`,
          [qty, unitCost, prodId, website.id]
        );
      }
    }

    // 3. Record purchase payment if paidAmt > 0
    if (paidAmt > 0) {
      await client.query(
        `INSERT INTO website_purchase_payments (purchase_id, website_id, amount, payment_method, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [purchase.id, website.id, paidAmt, payment_method, `Initial payment for #${invoiceNo}`]
      );
    }

    // 4. Update supplier balance if supplier_id given
    if (supplier_id && dueAmt > 0) {
      await client.query(
        `UPDATE website_suppliers
         SET balance = balance + $1, updated_at = NOW()
         WHERE id = $2 AND website_id = $3`,
        [dueAmt, Number(supplier_id), website.id]
      );
    }

    await client.query('COMMIT');

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'PURCHASE_CREATED',
      details: `Created purchase #${invoiceNo} of ${totalAmt}`,
      req: request
    });

    return NextResponse.json({
      ...purchase,
      purchase_id: purchase.id
    }, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Purchase POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
