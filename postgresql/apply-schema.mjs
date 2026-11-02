import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file if environment variables not already set
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith("'") && val.endsWith("'")) ||
          (val.startsWith('"') && val.endsWith('"'))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

loadEnv();

const pgHost = process.env.PG_HOST;
const pgPort = process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432;
const pgDatabase = process.env.PG_DATABASE || 'postgres';
const pgUser = process.env.PG_USER;
const pgPassword = process.env.PG_PASSWORD;
const isProduction = process.env.NODE_ENV === 'production' || process.env.PG_SSL === 'true' || (pgHost && pgHost.includes('supabase'));

console.log('----------------------------------------------------');
console.log('Database Migration Engine: Multi-Type SaaS & Tenant');
console.log(`Target Host: ${pgHost}:${pgPort}`);
console.log(`Database:    ${pgDatabase}`);
console.log(`User:        ${pgUser}`);
console.log(`SSL:         ${isProduction ? 'Enabled' : 'Disabled'}`);
console.log('----------------------------------------------------');

if (!pgHost || !pgUser) {
  console.error('ERROR: Missing PG_HOST or PG_USER in .env file.');
  process.exit(1);
}

const pool = new Pool({
  host: pgHost,
  port: pgPort,
  database: pgDatabase,
  user: pgUser,
  password: pgPassword,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

async function runMigration() {
  let client;
  try {
    console.log('Connecting to PostgreSQL database...');
    client = await pool.connect();
    console.log('Connection established successfully!\n');

    // Step 1: Read and apply schema.psql (56 platform tables)
    const schemaPath = path.resolve(__dirname, 'schema.psql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.psql not found at ${schemaPath}`);
    }
    console.log('Applying postgresql/schema.psql (56 platform tables)...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('Successfully applied schema.psql!\n');

    // Step 2: Read and apply website_tables.psql (339 website tenant tables)
    const websiteTablesPath = path.resolve(__dirname, 'website_tables.psql');
    if (!fs.existsSync(websiteTablesPath)) {
      throw new Error(`website_tables.psql not found at ${websiteTablesPath}`);
    }
    console.log('Applying postgresql/website_tables.psql (339 website tenant tables)...');
    const websiteSql = fs.readFileSync(websiteTablesPath, 'utf8');
    await client.query(websiteSql);
    console.log('Successfully applied website_tables.psql!\n');

    // Step 3: Verification of table counts
    console.log('Verifying created database tables...');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC;
    `);

    const allTables = tablesRes.rows.map((r) => r.table_name);
    const platformTables = allTables.filter((t) => !t.startsWith('website_'));
    const tenantTables = allTables.filter((t) => t.startsWith('website_'));

    console.log('----------------------------------------------------');
    console.log(`Total Tables in Database:    ${allTables.length}`);
    console.log(`Platform / SaaS Tables:      ${platformTables.length} (Expected: ~56)`);
    console.log(`Website / Tenant Tables:     ${tenantTables.length} (Expected: ~339)`);
    console.log('----------------------------------------------------');

    console.log('\nMigration completed successfully! All tables are active and ready.');
  } catch (err) {
    console.error('\n====================================================');
    console.error('MIGRATION ERROR ENCOUNTERED:');
    console.error(err.message);

    if (err.message && err.message.includes('(ENOTFOUND) tenant/user')) {
      const match = err.message.match(/postgres\.([a-zA-Z0-9_-]+)/);
      const projectRef = match ? match[1] : 'your-project';
      console.error('\nCAUSE: Supabase Project Paused or Inactive');
      console.error('Supabase automatically pauses free-tier databases after 7 days of inactivity.');
      console.error(`1. Go to your Supabase Dashboard:`);
      console.error(`   https://supabase.com/dashboard/project/${projectRef}`);
      console.error('2. Click "Restore project" or "Unpause project".');
      console.error('3. Once active, rerun: npm run db:migrate');
    }
    console.error('====================================================\n');
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runMigration();

