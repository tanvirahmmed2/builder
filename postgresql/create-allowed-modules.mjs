import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
const envConfig = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      envConfig[key] = val;
    }
  });
}

const pool = new Pool({
  host: envConfig.PG_HOST || process.env.PG_HOST,
  port: envConfig.PG_PORT ? Number(envConfig.PG_PORT) : 5432,
  database: envConfig.PG_DATABASE || process.env.PG_DATABASE,
  user: envConfig.PG_USER || process.env.PG_USER,
  password: envConfig.PG_PASSWORD || process.env.PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    console.log('Creating allowed_modules table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS allowed_modules (
        id SERIAL PRIMARY KEY,
        package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
        module_title VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_package_module UNIQUE (package_id, module_title)
      );
      CREATE INDEX IF NOT EXISTS idx_allowed_modules_pkg ON allowed_modules (package_id);
    `);
    console.log('allowed_modules table created successfully!');

    // Check if packages exist and seed initial allowed modules for existing packages
    const pkgRes = await pool.query('SELECT id, name FROM packages');
    console.log(`Found ${pkgRes.rows.length} existing packages.`);

    const standardModules = [
      'Products',
      'Orders & Payments',
      'Appointments',
      'Blog & Articles',
      'Contact Inquiries',
      'Services',
      'Experiences',
      'Portfolio Gallery',
      'Offers & Discounts',
      'Support Tickets',
      'Roles & Permissions',
      'Team & Users',
      'Settings & Domain'
    ];

    for (const pkg of pkgRes.rows) {
      const countRes = await pool.query('SELECT count(*) FROM allowed_modules WHERE package_id = $1', [pkg.id]);
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        for (const mod of standardModules) {
          await pool.query(
            'INSERT INTO allowed_modules (package_id, module_title) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [pkg.id, mod]
          );
        }
        console.log(`Initialized default modules for package #${pkg.id} (${pkg.name}).`);
      }
    }

    const testRes = await pool.query('SELECT * FROM allowed_modules LIMIT 5');
    console.log('Sample allowed_modules records:', testRes.rows);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

main();
