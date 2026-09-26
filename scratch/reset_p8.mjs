import { queryDb, pool } from '../src/lib/db/pg.js';

async function main() {
  await queryDb(`
    UPDATE payment 
    SET status = 'UNPAID', subscription_id = NULL, transaction_id = 'ORD_P8_TEST_RESET', updated_at = CURRENT_TIMESTAMP 
    WHERE id = 8
  `);
  console.log('Payment 8 successfully reset to UNPAID!');
  await pool.end();
}

main().catch(console.error);
