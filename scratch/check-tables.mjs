import { queryDb } from '../src/lib/db/pg.js';

async function main() {
  const r = await queryDb(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
    ORDER BY table_name;
  `);
  console.log(`Found ${r.rows.length} tables in DB:`);
  console.log(r.rows.map(x => x.table_name));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
