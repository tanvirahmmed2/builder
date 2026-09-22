import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getCreatorSession } from '@/lib/middleware/creator';
import { createPaymentSession } from '@/lib/db/payooner';

/**
 * API Route: /api/creator/payments
 * Dedicated to the `payment` table.
 */

export async function GET(request) {
  try {
    const sessionCreator = await getCreatorSession(request);
    const { searchParams } = new URL(request.url);
    const creatorIdParam = searchParams.get('creatorId');
    const paymentIdParam = searchParams.get('id');

    const creatorId = creatorIdParam ? Number(creatorIdParam) : sessionCreator?.id;
    if (!creatorId) {
      return NextResponse.json({ success: false, error: 'Unauthorized or missing creator ID' }, { status: 401 });
    }

    if (sessionCreator && sessionCreator.id !== creatorId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // If single payment requested
    if (paymentIdParam) {
      const singleRes = await queryDb(
        `SELECT pay.*, 
                p.name AS package_name, 
                p.slug AS package_slug, 
                p.billing_interval, 
                p.price_in_cents AS package_price,
                pu.status AS purchase_status,
                pu.notes AS purchase_notes
         FROM payment pay
         LEFT JOIN packages p ON pay.package_id = p.id
         LEFT JOIN purchases pu ON pay.purchase_id = pu.id
         WHERE pay.id = $1 AND pay.creator_id = $2
         LIMIT 1`,
        [Number(paymentIdParam), creatorId]
      );

      if (singleRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Payment record not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, payment: singleRes.rows[0] });
    }

    // All payments for creator
    const res = await queryDb(
      `SELECT pay.*, 
              p.name AS package_name, 
              p.slug AS package_slug, 
              p.billing_interval, 
              pu.status AS purchase_status,
              pu.id AS purchase_id_ref
       FROM payment pay
       LEFT JOIN packages p ON pay.package_id = p.id
       LEFT JOIN purchases pu ON pay.purchase_id = pu.id
       WHERE pay.creator_id = $1
       ORDER BY pay.id DESC`,
      [creatorId]
    );

    return NextResponse.json({ success: true, payments: res.rows });
  } catch (error) {
    console.error('Payments GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function handlePaymentsAction(body, sessionCreator, request = null) {
  const { action } = body;
  const creatorId = Number(body.creatorId || sessionCreator?.id);

  if (!creatorId) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Creator ID required' }, { status: 401 });
  }

  if (sessionCreator && sessionCreator.id !== creatorId) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  // 1. Pay Invoice (Processes payment via Payoneer, activates subscription)
  if (action === 'pay_invoice' || action === 'pay') {
    const paymentId = Number(body.paymentId);
    const paymentMethod = body.paymentMethod || 'PAYONEER';
    const returnUrl = body.returnUrl || '';

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'Payment ID is required' }, { status: 400 });
    }

    // Fetch payment record
    const payRes = await queryDb(
      `SELECT pay.*, p.name AS package_name, p.billing_interval, p.price_in_cents AS pkg_price, pu.notes AS purchase_notes
       FROM payment pay
       LEFT JOIN packages p ON pay.package_id = p.id
       LEFT JOIN purchases pu ON pay.purchase_id = pu.id
       WHERE pay.id = $1 AND pay.creator_id = $2
       LIMIT 1`,
      [paymentId, creatorId]
    );

    const payment = payRes.rows[0];
    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment invoice not found or unauthorized' }, { status: 404 });
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        message: 'This invoice is already paid and completed.',
        payment,
      });
    }

    const amountDecimal = Number(payment.amount_in_cents || 0) / 100;
    const currency = payment.currency || 'USD';
    const merchantRef = `PAY_${payment.id}_${Date.now()}`;

    let payoneerSession = null;
    let payoneerRedirectUrl = null;

    // Attempt Payoneer session creation
    if (paymentMethod === 'PAYONEER') {
      try {
        const creatorData = sessionCreator || (await queryDb('SELECT name, email FROM creators WHERE id = $1', [creatorId])).rows[0];
        payoneerSession = await createPaymentSession({
          amount: amountDecimal,
          currency,
          merchantReference: merchantRef,
          customer: {
            id: String(creatorId),
            email: creatorData?.email || `creator-${creatorId}@platform.local`,
            name: creatorData?.name || 'Platform Creator',
          },
          description: `Payment for ${payment.package_name || 'Package Subscription'}`,
          redirectUrl: returnUrl,
        });

        if (payoneerSession && payoneerSession.redirectUrl) {
          payoneerRedirectUrl = payoneerSession.redirectUrl;
        }
      } catch (payoneerErr) {
        console.warn('Payoneer session generation notice:', payoneerErr.message);
      }
    }

    // Determine duration interval: MONTHLY = 30 days, YEARLY = 365 days
    const isYearly = String(payment.billing_interval || '').toUpperCase() === 'YEARLY';
    const durationInterval = isYearly ? "INTERVAL '365 days'" : "INTERVAL '30 days'";

    // Create and activate subscription
    const subRes = await queryDb(
      `INSERT INTO subscription (creator_id, package_id, status, current_period_start, current_period_end)
       VALUES ($1, $2, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + ${durationInterval})
       RETURNING *`,
      [creatorId, payment.package_id]
    );
    const subscription = subRes.rows[0];

    // Mark payment as COMPLETED
    const updatedPayRes = await queryDb(
      `UPDATE payment 
       SET status = 'COMPLETED', 
           subscription_id = $1, 
           payment_method = $2,
           transaction_id = COALESCE(NULLIF($3, ''), transaction_id)
       WHERE id = $4
       RETURNING *`,
      [subscription.id, paymentMethod, merchantRef, payment.id]
    );
    const completedPayment = updatedPayRes.rows[0];

    // Mark purchase as COMPLETED
    let completedPurchase = null;
    if (payment.purchase_id) {
      const puRes = await queryDb(
        `UPDATE purchases 
         SET status = 'COMPLETED', payment_id = $1 
         WHERE id = $2 
         RETURNING *`,
        [payment.id, payment.purchase_id]
      );
      completedPurchase = puRes.rows[0];
    }

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully. Your package subscription is now active!',
      payment: completedPayment,
      purchase: completedPurchase,
      subscription,
      payoneerRedirectUrl,
    });
  }

  return NextResponse.json({ success: false, error: `Unknown payments action: ${action}` }, { status: 400 });
}

export async function POST(request) {
  try {
    const sessionCreator = await getCreatorSession(request);
    const body = await request.json();
    return await handlePaymentsAction(body, sessionCreator, request);
  } catch (error) {
    console.error('Payments POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
