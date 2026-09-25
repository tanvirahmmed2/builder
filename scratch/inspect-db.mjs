import { queryDb } from '../src/lib/db/pg.js';

async function main() {
  const tables = ['policies', 'privacy_policies', 'terms_and_conditions', 'refund_conditions', 'website_modules', 'allowed_modules', 'modules'];
  
  for (const t of tables) {
    try {
      const r = await queryDb(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [t]);
      if (r.rows.length > 0) {
        console.log(`\nTable [${t}] exists with columns:`);
        console.log(r.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
        
        // Sample rows
        const sample = await queryDb(`SELECT * FROM "${t}" LIMIT 3`);
        console.log(`Sample rows (${sample.rows.length}):`, sample.rows);
      } else {
        console.log(`\nTable [${t}] DOES NOT EXIST in DB.`);
      }
    } catch (e) {
      console.error(`Error checking ${t}:`, e.message);
    }
  }

  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
