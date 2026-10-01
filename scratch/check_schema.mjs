import { queryDb } from '../src/lib/db/pg.js';

async function checkPayment() {
  const res = await queryDb(
    `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'payment' ORDER BY ordinal_position`
  );
  console.log('=== TABLE: payment ===');
  console.table(res.rows);

  const sample = await queryDb(`SELECT * FROM payment ORDER BY id DESC LIMIT 3`);
  console.log('=== SAMPLE ROWS: ===');
  console.log(sample.rows);
  process.exit(0);
}

checkPayment().catch((e) => {
  console.error(e);
  process.exit(1);
});
