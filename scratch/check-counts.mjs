import { queryDb } from '../src/lib/db/pg.js';

async function main() {
  const tables = ['packages', 'allowed_modules', 'roles', 'permissions', 'apps', 'themes', 'privacy_policies', 'terms_and_conditions', 'refund_conditions'];
  for (const t of tables) {
    const count = await queryDb(`SELECT COUNT(*)::int AS count FROM "${t}"`);
    console.log(`Table [${t}]: ${count.rows[0].count} rows`);
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
