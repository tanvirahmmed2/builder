import { NextResponse } from 'next/server';
import { queryDb, pool } from '@/lib/db/pg';
import { resolveWebsiteFromRequest } from '@/lib/middleware/user';

export async function POST(req, { params }) {
  try {
    const { domain } = await params;
    const website = await resolveWebsiteFromRequest(req, domain);

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const websiteId = website.id;
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress,
      paymentMethod = 'cash_on_delivery',
      items = [],
      customerNote = ''
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    if (!customerName || (!customerEmail && !customerPhone)) {
      return NextResponse.json({ success: false, error: 'Customer name and contact information are required' }, { status: 400 });
    }

    // Start database transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Resolve or create customer
      let customerId = null;
      let userId = null;

      if (customerEmail) {
        const userRes = await client.query(
          'SELECT id FROM website_users WHERE website_id = $1 AND email = $2 LIMIT 1',
          [websiteId, customerEmail]
        );
        if (userRes.rows.length > 0) {
          userId = userRes.rows[0].id;
        } else {
          const newUserRes = await client.query(
            `INSERT INTO website_users (website_id, first_name, email, phone, status)
             VALUES ($1, $2, $3, $4, 'active')
             RETURNING id`,
            [websiteId, customerName, customerEmail, customerPhone || null]
          );
          userId = newUserRes.rows[0].id;
        }

        const custRes = await client.query(
          'SELECT id FROM website_customers WHERE website_id = $1 AND user_id = $2 LIMIT 1',
          [websiteId, userId]
        );
        if (custRes.rows.length > 0) {
          customerId = custRes.rows[0].id;
        } else {
          const newCustRes = await client.query(
            `INSERT INTO website_customers (website_id, user_id, customer_code, status)
             VALUES ($1, $2, $3, 'active')
             RETURNING id`,
            [websiteId, userId, `CUST-${Date.now().toString().slice(-6)}`]
          );
          customerId = newCustRes.rows[0].id;
        }
      }

      // 2. Calculate totals
      let subtotal = 0;
      for (const item of items) {
        const qty = Math.max(Number(item.quantity) || 1, 1);
        const price = Number(item.price) || 0;
        subtotal += qty * price;
      }

      const shippingFee = Number(body.shippingFee) || 0;
      const taxTotal = Number(body.taxTotal) || 0;
      const discountTotal = Number(body.discountTotal) || 0;
      const grandTotal = Math.max(subtotal + shippingFee + taxTotal - discountTotal, 0);

      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

      // 3. Insert order
      const orderRes = await client.query(
        `INSERT INTO website_ecommerce_orders (
          website_id, customer_id, order_number, order_type, status, payment_status,
          subtotal, tax_total, shipping_fee, discount_total, grand_total, paid_amount,
          shipping_address, billing_address, customer_note
        ) VALUES (
          $1, $2, $3, 'online', 'pending', $4,
          $5, $6, $7, $8, $9, $10,
          $11, $12, $13
        ) RETURNING id, order_number`,
        [
          websiteId,
          customerId,
          orderNumber,
          paymentMethod === 'cash_on_delivery' ? 'unpaid' : 'paid',
          subtotal,
          taxTotal,
          shippingFee,
          discountTotal,
          grandTotal,
          paymentMethod === 'cash_on_delivery' ? 0 : grandTotal,
          JSON.stringify(shippingAddress || {}),
          JSON.stringify(billingAddress || {}),
          customerNote
        ]
      );

      const orderId = orderRes.rows[0].id;

      // 4. Insert order items
      for (const item of items) {
        const qty = Math.max(Number(item.quantity) || 1, 1);
        const unitPrice = Number(item.price) || 0;
        const totalPrice = qty * unitPrice;

        await client.query(
          `INSERT INTO website_ecommerce_order_items (
            website_id, order_id, product_id, variant_id, product_name, sku, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            websiteId,
            orderId,
            item.productId || item.id,
            item.variantId || null,
            item.name || 'Product',
            item.sku || null,
            qty,
            unitPrice,
            totalPrice
          ]
        );
      }

      // 5. Insert payment record
      await client.query(
        `INSERT INTO website_payments (
          website_id, customer_id, amount, payment_method, payment_status, reference_number
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          websiteId,
          customerId,
          grandTotal,
          paymentMethod,
          paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed',
          orderNumber
        ]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Order placed successfully',
        data: {
          orderId,
          orderNumber,
          grandTotal,
          status: 'pending'
        }
      });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ success: false, error: 'Checkout failed' }, { status: 500 });
  }
}

