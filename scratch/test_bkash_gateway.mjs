import { queryDb } from '../src/lib/db/pg.js';

const BASE_URL = 'http://localhost:3000';

async function runBkashTests() {
  console.log('===========================================================');
  console.log('   BKASH PAYMENT GATEWAY COMPREHENSIVE API VALIDATION SUITE');
  console.log('===========================================================');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // -------------------------------------------------------------
  // Test 1: Gateway Status & Health Check
  // -------------------------------------------------------------
  console.log('\n--- 1. Testing GET /api/creator/payments/bkash (Health Check) ---');
  let res = await fetch(`${BASE_URL}/api/creator/payments/bkash`);
  let data = await res.json();
  assert(res.status === 200, 'Health check returns HTTP 200');
  assert(data.success === true, 'Response success is true');
  assert(data.currency === 'BDT', 'Currency is BDT');
  assert(Array.isArray(data.supportedOperators), 'Returns supported operators list');
  console.log('    Mode:', data.mode, '| Operators:', data.supportedOperators.length);

  // -------------------------------------------------------------
  // Setup: Find or prepare a test payment invoice for creator 2
  // -------------------------------------------------------------
  console.log('\n--- Setting up Test Invoice for Creator 2 ---');
  // Find payment record
  let payRes = await queryDb('SELECT * FROM payment WHERE creator_id = 2 ORDER BY id DESC LIMIT 1');
  let testPayment = payRes.rows[0];

  if (!testPayment) {
    // Create one if none exists
    const newPay = await queryDb(
      `INSERT INTO payment (creator_id, package_id, amount_in_cents, currency, payment_method, status, transaction_id)
       VALUES (2, 2, 300, 'USD', 'BKASH', 'UNPAID', 'TEST_ORD_INIT')
       RETURNING *`
    );
    testPayment = newPay.rows[0];
  }

  const testPaymentId = testPayment.id;
  console.log(`    Using test payment ID: ${testPaymentId}`);

  // Reset payment to UNPAID for validation
  await queryDb(
    `UPDATE payment 
     SET status = 'UNPAID', subscription_id = NULL, transaction_id = 'ORD_BK_TEST_${Date.now()}', updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [testPaymentId]
  );

  // -------------------------------------------------------------
  // Test 2: Input Validation (Invalid Mobile Numbers)
  // -------------------------------------------------------------
  console.log('\n--- 2. Testing Invalid Mobile Number Rejection ---');
  const invalidNumbers = ['01234567890', '017123', '018abcdefgh', ''];
  for (const num of invalidNumbers) {
    res = await fetch(`${BASE_URL}/api/creator/payments/bkash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_otp',
        creatorId: 2,
        paymentId: testPaymentId,
        bkashNumber: num,
      }),
    });
    data = await res.json();
    assert(res.status === 400, `Rejected invalid mobile "${num}" with HTTP 400`);
    assert(data.success === false, `Error message returned for "${num}": ${data.error}`);
  }

  // -------------------------------------------------------------
  // Test 3: Input Validation (Invalid OTP Format)
  // -------------------------------------------------------------
  console.log('\n--- 3. Testing Invalid OTP Rejection ---');
  const invalidOtps = ['123', '12345', '1234567', 'abcdef', ''];
  for (const otp of invalidOtps) {
    res = await fetch(`${BASE_URL}/api/creator/payments/bkash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify_otp',
        creatorId: 2,
        paymentId: testPaymentId,
        bkashOtp: otp,
      }),
    });
    data = await res.json();
    assert(res.status === 400, `Rejected invalid OTP "${otp}" with HTTP 400`);
    assert(data.success === false, `Error message returned for OTP: ${data.error}`);
  }

  // -------------------------------------------------------------
  // Test 4: Input Validation (Invalid PIN Format)
  // -------------------------------------------------------------
  console.log('\n--- 4. Testing Invalid PIN Rejection ---');
  const invalidPins = ['1234', '123456', 'abcde', ''];
  for (const pin of invalidPins) {
    res = await fetch(`${BASE_URL}/api/creator/payments/bkash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'execute',
        creatorId: 2,
        paymentId: testPaymentId,
        bkashNumber: '01712345678',
        bkashOtp: '123456',
        bkashPin: pin,
      }),
    });
    data = await res.json();
    assert(res.status === 400, `Rejected invalid PIN "${pin}" with HTTP 400`);
    assert(data.success === false, `Error message returned for PIN: ${data.error}`);
  }

  // -------------------------------------------------------------
  // Test 5: Step 1 - Payment Creation API (action: 'create')
  // -------------------------------------------------------------
  console.log('\n--- 5. Testing Payment Session Creation (action: create) ---');
  res = await fetch(`${BASE_URL}/api/creator/payments/bkash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      creatorId: 2,
      paymentId: testPaymentId,
    }),
  });
  data = await res.json();
  assert(res.status === 200, 'Create payment session returns HTTP 200');
  assert(data.success === true, 'Create payment success is true');
  assert(Boolean(data.bkashPaymentId), `Received bkashPaymentId: ${data.bkashPaymentId}`);
  assert(data.currency === 'BDT', 'Currency is BDT');
  assert(Number(data.amount) > 0, `BDT Amount is ${data.amount}`);
  const createdBkashPaymentId = data.bkashPaymentId;

  // -------------------------------------------------------------
  // Test 6: Step 2 - Send OTP Challenge (action: send_otp)
  // -------------------------------------------------------------
  console.log('\n--- 6. Testing Send OTP Challenge (action: send_otp) ---');
  res = await fetch(`${BASE_URL}/api/creator/payments/bkash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'send_otp',
      creatorId: 2,
      paymentId: testPaymentId,
      bkashNumber: '01712345678',
      bkashPaymentId: createdBkashPaymentId,
    }),
  });
  data = await res.json();
  assert(res.status === 200, 'Send OTP returns HTTP 200');
  assert(data.success === true, 'Send OTP success is true');
  assert(data.operator === 'Grameenphone', `Detected operator: ${data.operator}`);
  assert(Boolean(data.maskedNumber), `Masked mobile: ${data.maskedNumber}`);
  console.log('    OTP Message:', data.message);

  // -------------------------------------------------------------
  // Test 7: Step 3 - Verify OTP (action: verify_otp)
  // -------------------------------------------------------------
  console.log('\n--- 7. Testing Verify OTP (action: verify_otp) ---');
  res = await fetch(`${BASE_URL}/api/creator/payments/bkash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'verify_otp',
      creatorId: 2,
      paymentId: testPaymentId,
      bkashOtp: '123456',
    }),
  });
  data = await res.json();
  assert(res.status === 200, 'Verify OTP returns HTTP 200');
  assert(data.success === true, 'Verify OTP success is true');
  console.log('    Verify Message:', data.message);

  // -------------------------------------------------------------
  // Test 8: Step 4 - Execute Payment (action: execute)
  // -------------------------------------------------------------
  console.log('\n--- 8. Testing Payment Execution & Subscription Activation (action: execute) ---');
  res = await fetch(`${BASE_URL}/api/creator/payments/bkash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'execute',
      creatorId: 2,
      paymentId: testPaymentId,
      bkashPaymentId: createdBkashPaymentId,
      bkashNumber: '01712345678',
      bkashOtp: '123456',
      bkashPin: '12345',
    }),
  });
  data = await res.json();
  assert(res.status === 200, 'Execute payment returns HTTP 200');
  assert(data.success === true, 'Payment execution success is true');
  assert(Boolean(data.trxId), `Received Transaction ID: ${data.trxId}`);
  assert(data.payment?.status === 'COMPLETED', 'Payment status is COMPLETED');
  assert(data.payment?.currency === 'BDT', 'Payment currency is BDT');
  assert(data.payment?.payment_method === 'BKASH', 'Payment method is BKASH');
  assert(data.subscription?.status === 'ACTIVE', 'Subscription status is ACTIVE');

  // Verify in PostgreSQL database directly
  const dbPay = (await queryDb('SELECT * FROM payment WHERE id = $1', [testPaymentId])).rows[0];
  assert(dbPay.status === 'COMPLETED', 'Database payment.status is COMPLETED');
  assert(dbPay.currency === 'BDT', 'Database payment.currency is BDT');
  assert(dbPay.amount_in_cents === 30000, `Database payment.amount_in_cents is ${dbPay.amount_in_cents} (300 BDT)`);
  assert(Boolean(dbPay.subscription_id), `Linked to subscription ID: ${dbPay.subscription_id}`);

  // Verify payment_transactions log
  const txRes = await queryDb(
    'SELECT * FROM payment_transactions WHERE payment_id = $1 ORDER BY id DESC LIMIT 1',
    [testPaymentId]
  );
  assert(txRes.rows.length > 0, 'Transaction recorded in payment_transactions table');
  assert(txRes.rows[0].gateway === 'BKASH', 'Transaction gateway is BKASH');
  assert(txRes.rows[0].status === 'SUCCESS', 'Transaction status is SUCCESS');
  assert(txRes.rows[0].currency === 'BDT', 'Transaction currency is BDT');

  // -------------------------------------------------------------
  // Test 9: Idempotency (Cannot double-pay completed invoice)
  // -------------------------------------------------------------
  console.log('\n--- 9. Testing Idempotency on Already COMPLETED Invoice ---');
  res = await fetch(`${BASE_URL}/api/creator/payments/bkash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'execute',
      creatorId: 2,
      paymentId: testPaymentId,
      bkashNumber: '01712345678',
      bkashOtp: '123456',
      bkashPin: '12345',
    }),
  });
  data = await res.json();
  assert(res.status === 200, 'Re-executing completed payment returns handled 200');
  assert(data.success === true, 'Response signals already completed');
  assert(data.message.includes('already'), `Notice: ${data.message}`);

  // -------------------------------------------------------------
  // Test 10: Query bKash Payment Status (action: query)
  // -------------------------------------------------------------
  console.log('\n--- 10. Testing Query Payment Status (action: query) ---');
  res = await fetch(`${BASE_URL}/api/creator/payments/bkash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'query',
      creatorId: 2,
      bkashPaymentId: createdBkashPaymentId,
    }),
  });
  data = await res.json();
  assert(res.status === 200, 'Query payment status returns HTTP 200');
  assert(data.success === true, 'Query success is true');
  console.log('    Payment Status Query Result:', data.result?.transactionStatus || 'Completed');

  // -------------------------------------------------------------
  // Test 11: Search bKash Transaction by TrxID (action: search)
  // -------------------------------------------------------------
  console.log('\n--- 11. Testing Search Transaction by trxID (action: search) ---');
  res = await fetch(`${BASE_URL}/api/creator/payments/bkash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'search',
      creatorId: 2,
      trxId: dbPay.transaction_id,
    }),
  });
  data = await res.json();
  assert(res.status === 200, 'Search transaction returns HTTP 200');
  assert(data.success === true, 'Search success is true');
  assert(data.result?.trxID === dbPay.transaction_id, `Verified matching trxID in search`);

  // -------------------------------------------------------------
  // Test 12: Backward Compatibility via /api/creator/payments
  // -------------------------------------------------------------
  console.log('\n--- 12. Testing Standard /api/creator/payments route with BKASH ---');
  // Reset payment again to test the main endpoint
  await queryDb(
    `UPDATE payment 
     SET status = 'UNPAID', subscription_id = NULL, transaction_id = 'ORD_MAIN_ROUTE_TEST', updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [testPaymentId]
  );

  res = await fetch(`${BASE_URL}/api/creator/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'pay_invoice',
      creatorId: 2,
      paymentId: testPaymentId,
      paymentMethod: 'BKASH',
      bkashNumber: '01812345678',
      bkashOtp: '654321',
      bkashPin: '54321',
    }),
  });
  data = await res.json();
  assert(res.status === 200, 'Standard payments route returns HTTP 200');
  assert(data.success === true, 'Standard payments route completed successfully');
  assert(data.payment?.currency === 'BDT', 'Standard route updated currency to BDT');
  assert(data.payment?.status === 'COMPLETED', 'Standard route updated status to COMPLETED');
  console.log('    Main route message:', data.message);

  // -------------------------------------------------------------
  // Teardown: Leave test payment UNPAID for user UI testing
  // -------------------------------------------------------------
  await queryDb(
    `UPDATE payment 
     SET status = 'UNPAID', subscription_id = NULL, transaction_id = 'ORD_READY_FOR_USER_TESTING', updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [testPaymentId]
  );
  console.log(`\n--- Reset Payment ${testPaymentId} to UNPAID for browser UI testing ---`);

  console.log('\n===========================================================');
  console.log(`   ALL TESTS PASSED! (${passedTests} / ${totalTests} assertions)`);
  console.log('===========================================================');
  process.exit(0);
}

runBkashTests().catch((err) => {
  console.error('\n*** TEST FAILED WITH ERROR ***\n', err);
  process.exit(1);
});
