import { queryDb } from '../src/lib/db/pg.js';

async function main() {
  const p = await queryDb('SELECT id, name, slug, folder FROM permissions ORDER BY id ASC');
  console.log(`Permissions (${p.rows.length}):`);
  console.table(p.rows);

  const r = await queryDb('SELECT id, name, slug FROM roles ORDER BY id ASC');
  console.log(`Roles (${r.rows.length}):`);
  console.table(r.rows);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
