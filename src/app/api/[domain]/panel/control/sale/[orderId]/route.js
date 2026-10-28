import { NextResponse } from 'next/server';
import { queryDb, pool } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const identifier = params.orderId || params.id;
    const isNum = !isNaN(Number(identifier));

    const condition = isNum ? '(s.id = $1 OR s.invoice_no = $2)' : 's.invoice_no = $2';
    const saleRes = await queryDb(
      `SELECT s.id, s.id AS order_id, s.website_id, s.branch_id, s.user_id, s.customer_id,
              s.customer_name, s.customer_phone, s.invoice_no, s.subtotal, s.tax_amount,
              s.delivery_charge, s.discount_amount, s.total_amount, s.amount_received,
              s.change_amount, s.paid_amount, s.due_amount, s.payment_type, s.payment_status,
              s.order_status, s.note, s.items, s.created_at, s.updated_at,
              b.name AS branch_name, b.code AS branch_code, b.address AS branch_address, b.phone AS branch_phone,
              u.name AS staff_name
       FROM website_sales s
       LEFT JOIN website_branches b ON b.id = s.branch_id
       LEFT JOIN website_users u ON u.id = s.user_id
       WHERE ${condition} AND s.website_id = $3
       LIMIT 1`,
      [isNum ? Number(identifier) : -1, String(identifier), website.id]
    );

    if (saleRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const sale = saleRes.rows[0];

    // Fetch line items
    const itemsRes = await queryDb(
      `SELECT id, product_id, variant_id, product_name, quantity, unit_price, subtotal
       FROM website_sale_items
       WHERE sale_id = $1 AND website_id = $2
       ORDER BY id ASC`,
      [sale.id, website.id]
    );

    // Fetch payments
    const paymentsRes = await queryDb(
      `SELECT id, id AS payment_id, amount, payment_method, transaction_id, note, payment_date, created_at
       FROM website_sale_payments
       WHERE sale_id = $1 AND website_id = $2
       ORDER BY id DESC`,
      [sale.id, website.id]
    );

    return NextResponse.json({
      ...sale,
      items: itemsRes.rows.length > 0 ? itemsRes.rows : (Array.isArray(sale.items) ? sale.items : []),
      sale_payments: paymentsRes.rows
    });

  } catch (error) {
    console.error('Sale GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  const client = await pool.connect();
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) {
      client.release();
      return errorResponse;
    }

    const params = await context.params;
    const identifier = params.orderId || params.id;
    const isNum = !isNaN(Number(identifier));

    const body = await request.json();
    const { order_status, payment_status, payment_type, paid_amount, amount_to_add } = body;

    await client.query('BEGIN');

    const condition = isNum ? '(id = $1 OR invoice_no = $2)' : 'invoice_no = $2';
    const saleCheck = await client.query(
      `SELECT id, invoice_no, total_amount, paid_amount, due_amount, order_status, payment_status
       FROM website_sales
       WHERE ${condition} AND website_id = $3
       FOR UPDATE`,
      [isNum ? Number(identifier) : -1, String(identifier), website.id]
    );

    if (saleCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const currentSale = saleCheck.rows[0];

    // Compute updated payment amounts
    let newPaid = currentSale.paid_amount;
    let newDue = currentSale.due_amount;
    let newPayStatus = payment_status || currentSale.payment_status;

    if (amount_to_add !== undefined && parseFloat(amount_to_add) > 0) {
      const addAmt = parseFloat(amount_to_add);
      newPaid = parseFloat(currentSale.paid_amount) + addAmt;
      newDue = Math.max(0, parseFloat(currentSale.total_amount) - newPaid);
      newPayStatus = newDue <= 0 ? 'PAID' : 'PARTIAL';

      await client.query(
        `INSERT INTO website_sale_payments (sale_id, website_id, amount, payment_method, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [currentSale.id, website.id, addAmt, payment_type || 'cash', `Payment added via control panel`]
      );
    } else if (paid_amount !== undefined) {
      newPaid = parseFloat(paid_amount);
      newDue = Math.max(0, parseFloat(currentSale.total_amount) - newPaid);
      newPayStatus = newDue <= 0 ? 'PAID' : 'PARTIAL';
    }

    const updatedRes = await client.query(
      `UPDATE website_sales
       SET order_status = COALESCE($1, order_status),
           payment_status = COALESCE($2, payment_status),
           paid_amount = $3,
           due_amount = $4,
           updated_at = NOW()
       WHERE id = $5 AND website_id = $6
       RETURNING *`,
      [order_status, newPayStatus, newPaid, newDue, currentSale.id, website.id]
    );

    await client.query('COMMIT');

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SALE_UPDATED',
      details: `Updated order #${currentSale.invoice_no}: status=${order_status || currentSale.order_status}`,
      req: request
    });

    return NextResponse.json({
      success: true,
      sale: updatedRes.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sale PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
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
    const identifier = params.orderId || params.id;
    const isNum = !isNaN(Number(identifier));

    await client.query('BEGIN');

    const condition = isNum ? '(id = $1 OR invoice_no = $2)' : 'invoice_no = $2';
    const saleRes = await client.query(
      `SELECT id, invoice_no FROM website_sales WHERE ${condition} AND website_id = $3`,
      [isNum ? Number(identifier) : -1, String(identifier), website.id]
    );

    if (saleRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const orderId = saleRes.rows[0].id;
    const invoiceNo = saleRes.rows[0].invoice_no;

    // Revert product stocks for each sold item
    const itemsRes = await client.query(
      `SELECT product_id, quantity FROM website_sale_items WHERE sale_id = $1 AND website_id = $2`,
      [orderId, website.id]
    );

    for (const item of itemsRes.rows) {
      if (item.product_id) {
        await client.query(
          `UPDATE website_products
           SET stock = stock + $1, updated_at = NOW()
           WHERE id = $2 AND website_id = $3`,
          [item.quantity, item.product_id, website.id]
        );
      }
    }

    // Delete sale
    await client.query(`DELETE FROM website_sales WHERE id = $1 AND website_id = $2`, [orderId, website.id]);

    await client.query('COMMIT');

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SALE_DELETED',
      details: `Deleted order #${invoiceNo} and restored stock`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Order deleted and items restocked' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sale DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
