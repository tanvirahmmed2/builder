import { queryDb } from '../src/lib/db/pg.js';

async function runTest() {
  console.log('--- 1. Resetting Payment 8 to UNPAID ---');
  await queryDb(
    `UPDATE payment 
     SET status = 'UNPAID', subscription_id = NULL, transaction_id = 'ORD_P8_TEST_RESET', updated_at = CURRENT_TIMESTAMP 
     WHERE id = 8`
  );

  console.log('\n--- 2. Testing Incomplete Demo Data (Should Fail with 400) ---');
  // bKash without OTP
  let res = await fetch('http://localhost:3000/api/creator/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'pay_invoice',
      creatorId: 2,
      paymentId: 8,
      paymentMethod: 'BKASH',
      bkashNumber: '01987131369',
      bkashPin: '12345',
      // No bkashOtp provided!
    }),
  });
  let data = await res.json();
  console.log('bKash without OTP status:', res.status, '| error:', data.error);

  // Card without 3DS authCode
  res = await fetch('http://localhost:3000/api/creator/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'pay_invoice',
      creatorId: 2,
      paymentId: 8,
      paymentMethod: 'PAYONEER',
      cardNumber: '4532015012345678',
      cardExpiry: '12/28',
      cardCvv: '789',
      // No authCode provided!
    }),
  });
  data = await res.json();
  console.log('Card without 3DS status:', res.status, '| error:', data.error);

  console.log('\n--- 3. Testing Valid bKash Payment (Package BDT Price) ---');
  res = await fetch('http://localhost:3000/api/creator/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'pay_invoice',
      creatorId: 2,
      paymentId: 8,
      paymentMethod: 'BKASH',
      bkashNumber: '01987131369',
      bkashOtp: '123456',
      bkashPin: '12345',
    }),
  });
  data = await res.json();
  console.log('bKash Payment result success:', data.success, '| msg:', data.message);
  console.log('Payment record:', {
    id: data.payment?.id,
    status: data.payment?.status,
    amount_in_cents: data.payment?.amount_in_cents,
    currency: data.payment?.currency,
    payment_method: data.payment?.payment_method,
    transaction_id: data.payment?.transaction_id,
  });

  console.log('\n--- 4. Resetting Payment 8 to UNPAID for Card Test ---');
  await queryDb(
    `UPDATE payment 
     SET status = 'UNPAID', subscription_id = NULL, transaction_id = 'ORD_P8_TEST_RESET', updated_at = CURRENT_TIMESTAMP 
     WHERE id = 8`
  );

  console.log('\n--- 5. Testing Valid International Card Payment (Package USD Price) ---');
  res = await fetch('http://localhost:3000/api/creator/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'pay_invoice',
      creatorId: 2,
      paymentId: 8,
      paymentMethod: 'PAYONEER',
      cardNumber: '4532015012345678',
      cardExpiry: '12/28',
      cardCvv: '789',
      authCode: '884219',
    }),
  });
  data = await res.json();
  console.log('Card Payment result success:', data.success, '| msg:', data.message);
  console.log('Payment record:', {
    id: data.payment?.id,
    status: data.payment?.status,
    amount_in_cents: data.payment?.amount_in_cents,
    currency: data.payment?.currency,
    payment_method: data.payment?.payment_method,
    transaction_id: data.payment?.transaction_id,
  });

  console.log('\n--- 6. Finally Resetting Payment 8 to UNPAID so the user can test UI ---');
  await queryDb(
    `UPDATE payment 
     SET status = 'UNPAID', subscription_id = NULL, transaction_id = 'ORD_P8_READY_FOR_USER', updated_at = CURRENT_TIMESTAMP 
     WHERE id = 8`
  );
  console.log('Payment 8 is now UNPAID and ready for user testing in browser!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
