import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read .env manually to ensure compatibility across all Node versions
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function applySchema() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database:', process.env.PG_DATABASE, 'at', process.env.PG_HOST);

    const schemaPath = path.join(rootDir, 'schema.psql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema.psql...');
    await client.query(sql);
    console.log('Schema applied successfully!');

    // Query list of created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nTables currently in public schema:');
    res.rows.forEach((row, i) => {
      console.log(` ${i + 1}. ${row.table_name}`);
    });
  } catch (err) {
    console.error('Error applying schema:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

applySchema();
