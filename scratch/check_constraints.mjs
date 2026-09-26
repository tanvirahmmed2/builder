import { queryDb, pool } from '../src/lib/db/pg.js';

async function main() {
  const constraints = await queryDb(`
    SELECT conname, contype, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid IN ('payment'::regclass, 'payment_transactions'::regclass)
  `);
  console.log('Constraints:', constraints.rows);
  await pool.end();
}

main().catch(console.error);
