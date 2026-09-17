import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PG_HOST || 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 6543,
  database: process.env.PG_DATABASE || 'postgres',
  user: process.env.PG_USER || 'postgres.odqqmjjlycdtouwgebyu',
  password: process.env.PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  console.log('Connected to PostgreSQL successfully.');

  try {
    // 1. Check if 'admin' table exists and 'developers' does not
    const tableCheckRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('admin', 'developers');
    `);

    const existingTables = tableCheckRes.rows.map((r) => r.table_name);
    console.log('Existing target tables:', existingTables);

    if (existingTables.includes('admin') && !existingTables.includes('developers')) {
      console.log('Renaming table "admin" -> "developers"...');
      await client.query('ALTER TABLE admin RENAME TO developers;');
      console.log('Renamed table "admin" to "developers".');
    }

    // 2. Ensure indexes & triggers for developers table
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_developers_email ON developers (email);
      DROP TRIGGER IF EXISTS trg_admin_updated_at ON developers;
      DROP TRIGGER IF EXISTS trg_developers_updated_at ON developers;
      CREATE TRIGGER trg_developers_updated_at
      BEFORE UPDATE ON developers
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);

    // 3. Migrate and remove all admin_id columns from tables
    console.log('Migrating and removing admin_id columns...');
    await client.query(`
      -- session table
      ALTER TABLE session ADD COLUMN IF NOT EXISTS developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE;
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session' AND column_name = 'admin_id') THEN
          UPDATE session SET developer_id = admin_id WHERE developer_id IS NULL AND admin_id IS NOT NULL;
          ALTER TABLE session DROP COLUMN admin_id CASCADE;
        END IF;
      END $$;
      CREATE INDEX IF NOT EXISTS idx_session_developer_id ON session (developer_id);

      -- login_activity table
      ALTER TABLE login_activity ADD COLUMN IF NOT EXISTS developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL;
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'login_activity' AND column_name = 'admin_id') THEN
          UPDATE login_activity SET developer_id = admin_id WHERE developer_id IS NULL AND admin_id IS NOT NULL;
          ALTER TABLE login_activity DROP COLUMN admin_id CASCADE;
        END IF;
      END $$;
      CREATE INDEX IF NOT EXISTS idx_login_activity_developer_id ON login_activity (developer_id);

      -- contacts table
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS replied_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL;
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'replied_by_admin_id') THEN
          UPDATE contacts SET replied_by_developer_id = replied_by_admin_id WHERE replied_by_developer_id IS NULL;
          ALTER TABLE contacts DROP COLUMN replied_by_admin_id CASCADE;
        END IF;
      END $$;

      -- support table
      ALTER TABLE support ADD COLUMN IF NOT EXISTS assigned_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL;
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support' AND column_name = 'assigned_admin_id') THEN
          UPDATE support SET assigned_developer_id = assigned_admin_id WHERE assigned_developer_id IS NULL;
          ALTER TABLE support DROP COLUMN assigned_admin_id CASCADE;
        END IF;
      END $$;

      -- reports table
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL;
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'resolved_by_admin_id') THEN
          UPDATE reports SET resolved_by_developer_id = resolved_by_admin_id WHERE resolved_by_developer_id IS NULL;
          ALTER TABLE reports DROP COLUMN resolved_by_admin_id CASCADE;
        END IF;
      END $$;

      -- apps table is_published
      ALTER TABLE apps ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;
      CREATE INDEX IF NOT EXISTS idx_apps_published ON apps (is_published);
    `);

    // 4. Update check constraint on developers role if needed
    try {
      await client.query(`
        ALTER TABLE developers DROP CONSTRAINT IF EXISTS developers_role_check;
        ALTER TABLE developers ADD CONSTRAINT developers_role_check 
        CHECK (role IN ('admin', 'manager', 'support', 'developer', 'marketer'));
        ALTER TABLE developers ALTER COLUMN role SET DEFAULT 'developer';
      `);
    } catch (e) {
      console.warn('Notice updating role constraint:', e.message);
    }

    // 5. Read and apply schema.psql
    const schemaSql = fs.readFileSync(path.resolve(__dirname, 'schema.psql'), 'utf8');
    console.log('Applying schema.psql...');
    await client.query(schemaSql);
    console.log('Successfully applied schema.psql.');

    // 6. Verify developers table records
    const devRes = await client.query('SELECT id, name, email, role, is_active FROM developers;');
    console.log('Current records in developers table:', devRes.rows);

    console.log('Migration completed successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
