import { NextResponse } from 'next/server';
import { queryDb, pool } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const purchaseId = Number(params.id);

    const purchaseRes = await queryDb(
      `SELECT p.id, p.id AS purchase_id, p.website_id, p.branch_id, p.supplier_id, p.user_id,
              p.invoice_no, p.subtotal_amount, p.extra_discount, p.total_amount, p.total_paid,
              p.due_amount, p.payment_method, p.payment_status, p.note, p.items, p.created_at, p.updated_at,
              s.name AS supplier_name, s.phone AS supplier_phone, s.company_name AS supplier_company,
              b.name AS branch_name, b.code AS branch_code,
              u.name AS staff_name
       FROM website_purchases p
       LEFT JOIN website_suppliers s ON s.id = p.supplier_id
       LEFT JOIN website_branches b ON b.id = p.branch_id
       LEFT JOIN website_users u ON u.id = p.user_id
       WHERE p.id = $1 AND p.website_id = $2
       LIMIT 1`,
      [purchaseId, website.id]
    );

    if (purchaseRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Purchase not found' }, { status: 404 });
    }

    const purchase = purchaseRes.rows[0];

    // Fetch payments made for this purchase
    const paymentsRes = await queryDb(
      `SELECT id, id AS payment_id, amount, payment_method, transaction_id, note, payment_date, created_at
       FROM website_purchase_payments
       WHERE purchase_id = $1 AND website_id = $2
       ORDER BY id DESC`,
      [purchaseId, website.id]
    );

    // Fetch items
    const itemsRes = await queryDb(
      `SELECT id, product_id, variant_id, product_name, quantity, unit_cost, subtotal
       FROM website_purchase_items
       WHERE purchase_id = $1 AND website_id = $2
       ORDER BY id ASC`,
      [purchaseId, website.id]
    );

    return NextResponse.json({
      ...purchase,
      purchase_payments: paymentsRes.rows,
      items: itemsRes.rows.length > 0 ? itemsRes.rows : (Array.isArray(purchase.items) ? purchase.items : [])
    });

  } catch (error) {
    console.error('Purchase GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const client = await pool.connect();
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) {
      client.release();
      return errorResponse;
    }

    const params = await context.params;
    const purchaseId = Number(params.id);

    await client.query('BEGIN');

    // 1. Get purchase items to revert stock
    const itemsRes = await client.query(
      `SELECT product_id, quantity FROM website_purchase_items WHERE purchase_id = $1 AND website_id = $2`,
      [purchaseId, website.id]
    );

    for (const item of itemsRes.rows) {
      if (item.product_id) {
        await client.query(
          `UPDATE website_products
           SET stock = GREATEST(0, stock - $1), updated_at = NOW()
           WHERE id = $2 AND website_id = $3`,
          [item.quantity, item.product_id, website.id]
        );
      }
    }

    // 2. Delete purchase (cascade deletes items and payments)
    const delRes = await client.query(
      `DELETE FROM website_purchases WHERE id = $1 AND website_id = $2 RETURNING invoice_no`,
      [purchaseId, website.id]
    );

    if (delRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Purchase not found' }, { status: 404 });
    }

    await client.query('COMMIT');

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'PURCHASE_DELETED',
      details: `Deleted purchase #${delRes.rows[0].invoice_no} and reverted stock`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Purchase deleted and stock reverted' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Purchase DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
