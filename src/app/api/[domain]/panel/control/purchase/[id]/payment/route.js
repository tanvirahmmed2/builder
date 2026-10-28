import { NextResponse } from 'next/server';
import { queryDb, pool } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function POST(request, context) {
  const client = await pool.connect();
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) {
      client.release();
      return errorResponse;
    }

    const params = await context.params;
    const purchaseId = Number(params.id);

    const body = await request.json();
    const { amount, payment_method = 'Cash', transaction_id = '', note = '' } = body;

    const payAmt = parseFloat(amount);
    if (!payAmt || payAmt <= 0) {
      client.release();
      return NextResponse.json({ success: false, error: 'Valid payment amount is required' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Verify purchase exists
    const purchRes = await client.query(
      `SELECT id, invoice_no, supplier_id, total_amount, total_paid, due_amount
       FROM website_purchases
       WHERE id = $1 AND website_id = $2
       FOR UPDATE`,
      [purchaseId, website.id]
    );

    if (purchRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Purchase not found' }, { status: 404 });
    }

    const p = purchRes.rows[0];
    const newPaid = parseFloat(p.total_paid) + payAmt;
    const newDue = Math.max(0, parseFloat(p.total_amount) - newPaid);
    const newStatus = newDue <= 0 ? 'PAID' : 'PARTIAL';

    // 2. Insert into website_purchase_payments
    const payRes = await client.query(
      `INSERT INTO website_purchase_payments (purchase_id, website_id, amount, payment_method, transaction_id, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [purchaseId, website.id, payAmt, payment_method, transaction_id, note]
    );

    // 3. Update website_purchases
    await client.query(
      `UPDATE website_purchases
       SET total_paid = $1, due_amount = $2, payment_status = $3, updated_at = NOW()
       WHERE id = $4 AND website_id = $5`,
      [newPaid, newDue, newStatus, purchaseId, website.id]
    );

    // 4. Update supplier balance if applicable
    if (p.supplier_id) {
      await client.query(
        `UPDATE website_suppliers
         SET balance = GREATEST(0, balance - $1), updated_at = NOW()
         WHERE id = $2 AND website_id = $3`,
        [payAmt, p.supplier_id, website.id]
      );
    }

    await client.query('COMMIT');

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'PURCHASE_PAYMENT_ADDED',
      details: `Paid ${payAmt} for purchase #${p.invoice_no}`,
      req: request
    });

    return NextResponse.json({
      success: true,
      payment: payRes.rows[0],
      total_paid: newPaid,
      due_amount: newDue,
      payment_status: newStatus
    }, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Purchase payment API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
