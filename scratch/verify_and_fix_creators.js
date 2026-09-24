import { queryDb } from '../src/lib/db/pg.js';

async function main() {
  try {
    console.log('--- Step 1: Ensure extensions exist ---');
    await queryDb('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    await queryDb('CREATE EXTENSION IF NOT EXISTS "citext";');
    console.log('Extensions verified.');

    console.log('\n--- Step 2: Ensure trigger function exists ---');
    await queryDb(`
      CREATE OR REPLACE FUNCTION trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('trigger_set_timestamp function verified.');

    console.log('\n--- Step 3: Drop avatar_url from creators if it still exists ---');
    await queryDb('ALTER TABLE creators DROP COLUMN IF EXISTS avatar_url CASCADE;');
    console.log('Column avatar_url dropped if it existed.');

    console.log('\n--- Step 4: Ensure all required columns exist with proper defaults ---');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS phone VARCHAR(50);');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS bio TEXT;');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS verification_code VARCHAR(255);');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ;');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS two_factor_code VARCHAR(10);');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS two_factor_expires_at TIMESTAMPTZ;');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS recovery_token VARCHAR(255);');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS recovery_token_expires_at TIMESTAMPTZ;');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45);');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;');
    await queryDb('ALTER TABLE creators ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;');
    console.log('All column definitions verified.');

    console.log('\n--- Step 5: Ensure index and trigger exist ---');
    await queryDb('CREATE INDEX IF NOT EXISTS idx_creators_email ON creators (email);');
    await queryDb('DROP TRIGGER IF EXISTS trg_creators_updated_at ON creators;');
    await queryDb(`
      CREATE TRIGGER trg_creators_updated_at
      BEFORE UPDATE ON creators
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);
    console.log('Index and trigger verified.');

    console.log('\n--- Step 6: Inspect current schema of creators table ---');
    const cols = await queryDb(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'creators' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.table(cols.rows);

    console.log('\n--- Step 7: Test CRUD cycle on creators table ---');
    const testEmail = `test_verification_${Date.now()}@example.com`;
    const insertRes = await queryDb(`
      INSERT INTO creators (name, email, password, phone, bio, is_active, is_verified)
      VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
      RETURNING id, name, email, is_active, is_verified, created_at, updated_at;
    `, ['Test Creator Verification', testEmail, 'securepassword123', '+15551234', 'Verification bio']);

    const newCreator = insertRes.rows[0];
    console.log('Inserted test creator:', newCreator);

    const updateRes = await queryDb(`
      UPDATE creators SET bio = $1 WHERE id = $2 RETURNING id, bio, updated_at;
    `, ['Updated bio test', newCreator.id]);
    console.log('Updated test creator:', updateRes.rows[0]);

    await queryDb('DELETE FROM creators WHERE id = $1;', [newCreator.id]);
    console.log(`Deleted test creator (ID: ${newCreator.id}).`);

    console.log('\nSUCCESS: creators table in database is fully verified, synchronized, and operational.');

  } catch (err) {
    console.error('Error verifying creators table:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
