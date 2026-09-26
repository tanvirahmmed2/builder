import { queryDb, pool } from '../src/lib/db/pg.js';

async function main() {
  await queryDb(`
    UPDATE payment 
    SET status = 'UNPAID', subscription_id = NULL, payment_method = 'BKASH', transaction_id = 'ORD_BK_TEST_01' 
    WHERE id = 3
  `);
  console.log('Payment 3 reset to UNPAID with bKash method');
  await pool.end();
}

main().catch(console.error);
