import { queryDb } from '../src/lib/db/pg.js';

async function inspectLegacy() {
  const tables = [
    'privacy_policies',
    'terms_and_conditions',
    'refund_conditions',
    'careers',
    'career_applications',
    'tenants',
    'staffs',
    'features',
    'package_features'
  ];

  for (const t of tables) {
    const cols = await queryDb(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = $1 
       ORDER BY ordinal_position`,
      [t]
    );
    console.log(`\n--- Columns for ${t} (${cols.rows.length} cols) ---`);
    console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  }

  process.exit(0);
}

inspectLegacy().catch(e => {
  console.error(e);
  process.exit(1);
});
