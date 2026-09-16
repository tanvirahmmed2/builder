import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;
const envContent = fs.readFileSync('.env', 'utf8');
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length > 0) {
      process.env[key.trim()] = vals.join('=').replace(/^['"]|['"]$/g, '').trim();
    }
  }
});

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();

  try {
    const psqlPath = path.resolve('postgresql/admin.psql');
    const psqlContent = fs.readFileSync(psqlPath, 'utf8');

    const tableMatches = [...psqlContent.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi)];
    const allowedTables = new Set(tableMatches.map((m) => m[1].toLowerCase()));

    const currentRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const currentTables = currentRes.rows.map((r) => r.table_name.toLowerCase());
    console.log(`\nCurrent database tables in public schema (${currentTables.length}):`);
    currentTables.forEach((t, idx) => console.log(`  ${idx + 1}. ${t}`));

    const tablesToDrop = currentTables.filter((t) => !allowedTables.has(t));
    if (tablesToDrop.length > 0) {
      console.log(`\nDropping ${tablesToDrop.length} remaining extraneous tables:`);
      for (const tbl of tablesToDrop) {
        await client.query(`DROP TABLE IF EXISTS "${tbl}" CASCADE;`);
        console.log(`  Dropped "${tbl}"`);
      }
    } else {
      console.log('\n✓ All remaining tables exactly match admin.psql!');
    }

    const finalRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const finalTables = finalRes.rows.map((r) => r.table_name.toLowerCase());
    console.log(`\nVerified database tables (${finalTables.length}):`);
    finalTables.forEach((t, idx) => console.log(`  ${idx + 1}. ${t}`));

    // Verify admin table has super admin
    const adminRows = await client.query('SELECT id, name, email, is_active, is_verified FROM admin');
    console.log('\nAdmin rows in database:', adminRows.rows);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  pool.end();
  process.exit(1);
});
