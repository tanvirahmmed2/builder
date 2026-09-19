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

async function migrate() {
  console.log('Connecting to PostgreSQL database...');
  const client = await pool.connect();

  try {
    console.log('Applying trigger_set_timestamp function if not exists...');
    await client.query(`
      CREATE OR REPLACE FUNCTION trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('Creating faqs table and trigger...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS faqs (
          id SERIAL PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      DROP TRIGGER IF EXISTS trg_faqs_updated_at ON faqs;
      CREATE TRIGGER trg_faqs_updated_at
      BEFORE UPDATE ON faqs
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);

    console.log('Creating updates table, indexes and trigger...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS updates (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_updates_slug ON updates (slug);
      CREATE INDEX IF NOT EXISTS idx_updates_created_at ON updates (created_at DESC);

      DROP TRIGGER IF EXISTS trg_updates_updated_at ON updates;
      CREATE TRIGGER trg_updates_updated_at
      BEFORE UPDATE ON updates
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);

    // Check if initial faqs exist, if not seed some helpful starter FAQs
    const faqsCount = await client.query('SELECT COUNT(*)::int AS count FROM faqs');
    if (faqsCount.rows[0].count === 0) {
      console.log('Seeding initial FAQs...');
      await client.query(`
        INSERT INTO faqs (question, answer) VALUES
        ('How do I build my portfolio using this platform?', 'You can choose from our professionally crafted themes or start from a blank canvas. Use our visual drag-and-drop studio to customize sections, typography, images, and projects in real time, then publish with a single click.'),
        ('Can I connect my own custom domain?', 'Yes! Depending on your subscription package, you can connect your own custom domain (e.g., yourname.com) with complimentary automatic SSL certificate provisioning.'),
        ('How does the multi-website management work?', 'Creators can design, publish, and manage multiple distinct portfolio websites from a single centralized dashboard, each with its own subdomain, visitor analytics, and theme settings.'),
        ('Can I receive client inquiries and booking requests directly?', 'Yes, each portfolio can have built-in contact forms and support modules that route inquiries straight to your creator portal and email notifications.')
      `);
    }

    // Check if initial updates exist, if not seed initial product updates
    const updatesCount = await client.query('SELECT COUNT(*)::int AS count FROM updates');
    if (updatesCount.rows[0].count === 0) {
      console.log('Seeding initial Updates...');
      await client.query(`
        INSERT INTO updates (title, slug, description) VALUES
        ('Platform 2.0: Instant Canvas Studio & Live Previews', 'platform-2-instant-canvas-studio', '<h2>Exciting Platform Upgrades</h2><p>We are thrilled to unveil our revamped <strong>Visual Canvas Studio</strong>! This major milestone delivers zero-latency visual editing, real-time responsive previews across mobile and desktop, and streamlined asset uploads.</p><ul><li>Instant drag-and-drop reordering</li><li>Adaptive color palette generation</li><li>Sub-second live preview reloads</li></ul><p>Explore the new studio now in your creator workspace.</p>'),
        ('Custom Domain Automation with Edge SSL', 'custom-domain-automation-edge-ssl', '<h2>Frictionless Custom Domains</h2><p>Connecting your bespoke branded domain to your portfolio builder has never been simpler. Our upgraded DNS validation engine now automatically detects domain records and provisions edge SSL certificates in under 60 seconds.</p><p>Check your website settings to connect your brand domain today.</p>')
      `);
    }

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
