import { queryDb } from '../src/lib/db/pg.js';

async function fixTables() {
  console.log('=== Step 1: Fixing purchases table ===');
  await queryDb(`
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES creators(id) ON DELETE CASCADE;
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_id INTEGER;
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS amount_in_cents INTEGER DEFAULT 0;
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS billing_interval VARCHAR(50) DEFAULT 'MONTHLY';
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS notes TEXT;
    UPDATE purchases SET creator_id = user_id WHERE creator_id IS NULL AND user_id IS NOT NULL;
  `);
  console.log('✓ purchases table fixed.');

  console.log('=== Step 2: Fixing payment table ===');
  await queryDb(`
    ALTER TABLE payment ADD COLUMN IF NOT EXISTS purchase_id INTEGER REFERENCES purchases(id) ON DELETE SET NULL;
  `);
  console.log('✓ payment table fixed.');

  console.log('=== Step 3: Fixing subscription table ===');
  await queryDb(`
    ALTER TABLE subscription ADD COLUMN IF NOT EXISTS app_id INTEGER REFERENCES apps(id) ON DELETE SET NULL;
    ALTER TABLE subscription ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;
  `);
  console.log('✓ subscription table fixed.');

  console.log('=== Step 4: Fixing reports table ===');
  await queryDb(`
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS reporter_name VARCHAR(255);
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS reporter_email CITEXT;
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'GENERAL';
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'MEDIUM';
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS admin_response TEXT;
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL;
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
    UPDATE reports SET reporter_name = name WHERE reporter_name IS NULL AND name IS NOT NULL;
    UPDATE reports SET reporter_email = email WHERE reporter_email IS NULL AND email IS NOT NULL;
  `);
  console.log('✓ reports table fixed.');

  console.log('=== Step 5: Fixing themes table ===');
  await queryDb(`
    ALTER TABLE themes ADD COLUMN IF NOT EXISTS name VARCHAR(100);
    ALTER TABLE themes ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Modern';
    ALTER TABLE themes ADD COLUMN IF NOT EXISTS preview_image TEXT;
    ALTER TABLE themes ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE themes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    ALTER TABLE themes ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
    UPDATE themes SET name = title WHERE name IS NULL AND title IS NOT NULL;
    UPDATE themes SET title = name WHERE title IS NULL AND name IS NOT NULL;
  `);
  console.log('✓ themes table fixed.');

  console.log('=== Step 6: Fixing chat_messages table ===');
  await queryDb(`
    ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message TEXT;
    ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;
    UPDATE chat_messages SET message = content WHERE message IS NULL AND content IS NOT NULL;
    UPDATE chat_messages SET content = message WHERE content IS NULL AND message IS NOT NULL;
  `);
  console.log('✓ chat_messages table fixed.');

  console.log('=== Step 7: Fixing reviews table ===');
  await queryDb(`
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES creators(id) ON DELETE CASCADE;
    UPDATE reviews SET creator_id = user_id WHERE creator_id IS NULL AND user_id IS NOT NULL;
  `);
  console.log('✓ reviews table fixed.');

  console.log('\n=== All missing columns and table fixes successfully applied! ===');
  process.exit(0);
}

fixTables().catch(e => {
  console.error('Error fixing tables:', e);
  process.exit(1);
});
