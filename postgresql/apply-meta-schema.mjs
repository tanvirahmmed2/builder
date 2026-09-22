import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
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

async function applyMetaSchema() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL. Creating meta_conversations and meta_messages tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS meta_conversations (
          id SERIAL PRIMARY KEY,
          platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'whatsapp')),
          external_conversation_id VARCHAR(255) NOT NULL,
          recipient_id VARCHAR(255) NOT NULL,
          recipient_name VARCHAR(255) NOT NULL DEFAULT 'Customer',
          recipient_phone VARCHAR(50),
          recipient_avatar TEXT,
          last_message TEXT,
          last_message_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED', 'SPAM')),
          unread_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uq_meta_conversations_platform_ext UNIQUE (platform, external_conversation_id)
      );

      CREATE INDEX IF NOT EXISTS idx_meta_conversations_platform ON meta_conversations (platform, status, updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_meta_conversations_recipient ON meta_conversations (platform, recipient_id);

      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_set_timestamp') THEN
          DROP TRIGGER IF EXISTS trg_meta_conversations_updated_at ON meta_conversations;
          CREATE TRIGGER trg_meta_conversations_updated_at
          BEFORE UPDATE ON meta_conversations
          FOR EACH ROW
          EXECUTE FUNCTION trigger_set_timestamp();
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS meta_messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER NOT NULL REFERENCES meta_conversations(id) ON DELETE CASCADE,
          platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'whatsapp')),
          sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('CUSTOMER', 'STAFF', 'SYSTEM')),
          sender_id VARCHAR(255),
          sender_name VARCHAR(255) NOT NULL,
          message_text TEXT NOT NULL,
          media_url TEXT,
          media_type VARCHAR(50) DEFAULT 'text',
          external_message_id VARCHAR(255),
          delivery_status VARCHAR(50) NOT NULL DEFAULT 'SENT' CHECK (delivery_status IN ('SENT', 'DELIVERED', 'READ', 'FAILED')),
          error_message TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_meta_messages_conv ON meta_messages (conversation_id, created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_meta_messages_ext ON meta_messages (platform, external_message_id);
    `);

    console.log('✅ Meta messaging tables and indexes created successfully!');
  } catch (err) {
    console.error('❌ Error applying Meta schema:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

applyMetaSchema();
