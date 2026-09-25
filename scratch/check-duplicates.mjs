import { queryDb } from '../src/lib/db/pg.js';

async function testAll() {
  const badQuery = await queryDb(`
    SELECT t.table_name, count(*) as cnt
    FROM information_schema.tables t
    LEFT JOIN pg_class ON pg_class.relname = t.table_name
    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    GROUP BY t.table_name
    HAVING count(*) > 1
  `);
  console.log('Tables duplicated by joining pg_class without schema check:');
  console.log(badQuery.rows);

  const fixedQuery = await queryDb(`
    SELECT t.table_name, count(*) as cnt
    FROM information_schema.tables t
    LEFT JOIN (
      SELECT c.relname, c.reltuples
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
    ) pc ON pc.relname = t.table_name
    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    GROUP BY t.table_name
    HAVING count(*) > 1
  `);
  console.log('\nWith proper schema join, duplicates:');
  console.log(fixedQuery.rows);

  process.exit(0);
}

testAll().catch(e => {
  console.error(e);
  process.exit(1);
});
