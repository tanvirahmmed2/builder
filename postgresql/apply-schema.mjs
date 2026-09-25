import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load .env variables if not already present
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
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
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'postgres',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  ssl: process.env.PG_SSL === 'false' ? false : { rejectUnauthorized: false },
});

async function runMigration() {
  console.log('🚀 Starting PostgreSQL Database Migration & Schema Sync...');
  const client = await pool.connect();

  try {
    // 0. Ensure table compatibility columns
    console.log('🛠️  Ensuring database table column compatibility...');
    await client.query(`
      -- Purchases compatibility
      ALTER TABLE purchases ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES creators(id) ON DELETE CASCADE;
      ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_id INTEGER;
      ALTER TABLE purchases ADD COLUMN IF NOT EXISTS amount_in_cents INTEGER DEFAULT 0;
      ALTER TABLE purchases ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
      ALTER TABLE purchases ADD COLUMN IF NOT EXISTS billing_interval VARCHAR(50) DEFAULT 'MONTHLY';
      ALTER TABLE purchases ADD COLUMN IF NOT EXISTS notes TEXT;
      UPDATE purchases SET creator_id = user_id WHERE creator_id IS NULL AND user_id IS NOT NULL;

      -- Payment compatibility
      ALTER TABLE payment ADD COLUMN IF NOT EXISTS purchase_id INTEGER REFERENCES purchases(id) ON DELETE SET NULL;

      -- Subscription compatibility
      ALTER TABLE subscription ADD COLUMN IF NOT EXISTS app_id INTEGER REFERENCES apps(id) ON DELETE SET NULL;
      ALTER TABLE subscription ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

      -- Reports compatibility
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS reporter_name VARCHAR(255);
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS reporter_email CITEXT;
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'GENERAL';
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'MEDIUM';
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS admin_response TEXT;
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL;
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
      UPDATE reports SET reporter_name = name WHERE reporter_name IS NULL AND name IS NOT NULL;
      UPDATE reports SET reporter_email = email WHERE reporter_email IS NULL AND email IS NOT NULL;

      -- Themes compatibility
      ALTER TABLE themes ADD COLUMN IF NOT EXISTS name VARCHAR(100);
      ALTER TABLE themes ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Modern';
      ALTER TABLE themes ADD COLUMN IF NOT EXISTS preview_image TEXT;
      ALTER TABLE themes ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}'::jsonb;
      ALTER TABLE themes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      ALTER TABLE themes ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
      UPDATE themes SET name = title WHERE name IS NULL AND title IS NOT NULL;
      UPDATE themes SET title = name WHERE title IS NULL AND name IS NOT NULL;

      -- Chat messages compatibility
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message TEXT;
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;
      UPDATE chat_messages SET message = content WHERE message IS NULL AND content IS NOT NULL;
      UPDATE chat_messages SET content = message WHERE content IS NULL AND message IS NOT NULL;

      -- Reviews compatibility
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES creators(id) ON DELETE CASCADE;
      UPDATE reviews SET creator_id = user_id WHERE creator_id IS NULL AND user_id IS NOT NULL;
    `);
    console.log('✓ Database table compatibility columns ensured.');

    // 1. Execute schema.psql
    const schemaFile = path.join(__dirname, 'schema.psql');
    if (fs.existsSync(schemaFile)) {
      console.log('📄 Applying schema.psql (Core platform schema)...');
      const schemaSql = fs.readFileSync(schemaFile, 'utf8');
      await client.query(schemaSql);
      console.log('✓ Core platform schema applied successfully.');
    }

    // 2. Execute website-schema.psql
    const websiteSchemaFile = path.join(__dirname, 'website-schema.psql');
    if (fs.existsSync(websiteSchemaFile)) {
      console.log('📄 Applying website-schema.psql (Multi-website customer schema)...');
      const websiteSql = fs.readFileSync(websiteSchemaFile, 'utf8');
      await client.query(websiteSql);
      console.log('✓ Multi-website customer schema applied successfully.');
    }

    // 3. Ensure policies table, indexes and trigger
    console.log('🛡️  Verifying policies table & default policies...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS policies (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT NOT NULL,
          is_published BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_policies_slug ON policies (slug);
      CREATE INDEX IF NOT EXISTS idx_policies_published ON policies (is_published, created_at DESC);
    `);

    // Ensure policies trigger
    try {
      await client.query(`
        DROP TRIGGER IF EXISTS trg_policies_updated_at ON policies;
        CREATE TRIGGER trg_policies_updated_at
        BEFORE UPDATE ON policies
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_timestamp();
      `);
    } catch (_) {}

    // Seed policies if empty
    const polCount = await client.query('SELECT COUNT(*)::int AS count FROM policies');
    if (polCount.rows[0].count === 0) {
      const defaultPolicies = [
        {
          title: 'Terms of Service',
          slug: 'terms-of-service',
          description: `Welcome to our platform. By accessing or using our websites, APIs, creator studios, or applications, you agree to be bound by these Terms of Service.\n\n1. Acceptance of Terms\nBy creating an account or accessing our services, you confirm that you are at least 18 years of age and legally capable of entering into binding contracts.\n\n2. Creator Accounts & Responsibilities\nYou are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.\n\n3. Subscription Plans & Billing\nPlatform subscriptions are billed in advance on a recurring monthly or annual basis. You may cancel your subscription at any time via your Creator Settings.\n\n4. Intellectual Property\nAll content, themes, visual systems, and platform tools remain the property of the platform or their respective licensors. You retain full ownership of the digital assets and media you upload to your portfolio.\n\n5. Termination & Suspension\nWe reserve the right to suspend or terminate accounts that violate our security guidelines or acceptable use policies without prior liability.`,
        },
        {
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          description: `We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, store, and process your personal information.\n\n1. Information We Collect\nWe collect information you provide directly to us when registering an account, publishing content, submitting support tickets, or communicating with us.\n\n2. How We Use Your Data\nWe utilize your information to operate, maintain, and enhance platform functionality, process subscriptions, authenticate login sessions, and prevent fraudulent activities.\n\n3. Data Sharing & Third Parties\nWe do not sell your personal data. We only share information with trusted third-party service providers strictly necessary to deliver platform services.\n\n4. Cookies and Tracking Technologies\nWe employ functional cookies to maintain authenticated sessions and optimize site performance.\n\n5. Your Legal Rights\nDepending on your location, you have the right to request access to, rectification of, or deletion of your personal data.`,
        },
        {
          title: 'Refund & Cancellation Policy',
          slug: 'refund-policy',
          description: `Our refund policy is designed to be fair, transparent, and aligned with standard digital software-as-a-service practices.\n\n1. 14-Day Satisfaction Window\nIf you are unsatisfied with your subscription plan within the first 14 days of your initial purchase, you may request a full refund by submitting a ticket to our support team.\n\n2. Cancellation Policy\nYou may cancel your recurring subscription at any time. Upon cancellation, your subscription will remain active until the end of the current billing cycle.\n\n3. Digital Goods & Custom Domains\nCertain third-party fees, including custom domain registrations, may not be eligible for refunds once provisioned.`,
        },
        {
          title: 'Cookie Policy',
          slug: 'cookie-policy',
          description: `This Cookie Policy explains how our platform utilizes cookies and similar tracking technologies to enhance user experience and secure session integrity.\n\n1. What Are Cookies?\nCookies are small data files placed on your computer or mobile device when you browse websites.\n\n2. Essential Cookies\nEssential cookies are strictly required to authenticate user sessions, maintain shopping carts, and prevent cross-site request forgery attacks.\n\n3. Analytics Cookies\nWe use anonymous telemetry cookies to monitor website performance and identify bugs.`,
        },
      ];

      for (const p of defaultPolicies) {
        await client.query(`
          INSERT INTO policies (title, slug, description, is_published)
          VALUES ($1, $2, $3, TRUE)
          ON CONFLICT (slug) DO NOTHING
        `, [p.title, p.slug, p.description]);
      }
      console.log(`✓ Seeded ${defaultPolicies.length} standard platform policies.`);
    }

    // 4. Ensure modern and legacy permissions
    console.log('🔑 Synchronizing platform permissions & role permissions...');
    const allSystemPerms = [
      { name: 'Platform Overview', slug: 'overview', folder: 'core', desc: 'Platform health and KPI dashboard' },
      { name: 'Sprint Tasks', slug: 'tasks', folder: 'core', desc: 'Developer sprints and engineering tasks' },
      { name: 'Company Notices', slug: 'notices', folder: 'core', desc: 'Broadcast internal developer bulletins' },
      { name: 'Developer Profile', slug: 'profile', folder: 'core', desc: 'Staff profile and authentication settings' },
      { name: 'My Salaries', slug: 'my-salaries', folder: 'core', desc: 'Personal salary slips and payout history' },
      { name: 'Platform Settings', slug: 'settings', folder: 'core', desc: 'Global platform configuration' },
      { name: 'Developers Team', slug: 'developers', folder: 'staff', desc: 'Manage internal engineering staff and credentials' },
      { name: 'Roles & Permissions', slug: 'roles', folder: 'staff', desc: 'Manage administrative roles and fine-grained permissions' },
      { name: 'Creators', slug: 'creators', folder: 'users', desc: 'Creator account administration' },
      { name: 'End Users', slug: 'users', folder: 'users', desc: 'End-user client directory' },
      { name: 'Customer Websites', slug: 'websites', folder: 'websites', desc: 'Provisioned customer portfolio websites' },
      { name: 'Blogs & Articles', slug: 'blogs', folder: 'content', desc: 'Platform publication and articles' },
      { name: 'Visual Themes', slug: 'themes', folder: 'content', desc: 'Marketplace design templates' },
      { name: 'Company Policies', slug: 'policies', folder: 'content', desc: 'Terms of service, privacy policies, and compliance documents' },
      { name: 'FAQs', slug: 'faqs', folder: 'content', desc: 'Help center questions and answers' },
      { name: 'Product Updates', slug: 'updates', folder: 'content', desc: 'Changelog and release notes' },
      { name: 'Video Tutorials', slug: 'tutorials', folder: 'content', desc: 'Tutorial academy and educational videos' },
      { name: 'Subscription Packages', slug: 'packages', folder: 'commerce', desc: 'Pricing tiers and subscription packages' },
      { name: 'Platform Features', slug: 'features', folder: 'commerce', desc: 'Feature flags and entitlement toggles' },
      { name: 'Database Modules', slug: 'modules', folder: 'commerce', desc: 'Database tables introspection and module mapping' },
      { name: 'Payments', slug: 'payments', folder: 'commerce', desc: 'Financial transaction ledger' },
      { name: 'Subscriptions', slug: 'subscriptions', folder: 'commerce', desc: 'Active creator subscriptions and renewals' },
      { name: 'Staff Payroll', slug: 'payroll', folder: 'commerce', desc: 'Staff compensation and monthly payroll runs' },
      { name: 'Internal Chats', slug: 'chats', folder: 'communication', desc: 'Internal engineering discussions' },
      { name: 'Live Support Chats', slug: 'live-chats', folder: 'communication', desc: 'Real-time client live chats' },
      { name: 'Contact Inquiries', slug: 'contacts', folder: 'communication', desc: 'Incoming contact form submissions' },
      { name: 'Support Tickets', slug: 'support', folder: 'communication', desc: 'Customer support helpdesk ticketing' },
      { name: 'Custom Projects', slug: 'projects', folder: 'communication', desc: 'Bespoke custom development orders' },
      { name: 'User Reports', slug: 'reports', folder: 'communication', desc: 'Incident reports and client feedback' },
      { name: 'Facebook Messages', slug: 'facebook-messages', folder: 'meta', desc: 'Integrated Meta Facebook page conversations' },
      { name: 'Instagram Messages', slug: 'instagram-messages', folder: 'meta', desc: 'Integrated Meta Instagram Direct messaging' },
      { name: 'WhatsApp Messages', slug: 'whatsapp-messages', folder: 'meta', desc: 'Integrated WhatsApp Cloud API communications' },
      { name: 'Customer Reviews', slug: 'reviews', folder: 'trust', desc: 'Testimonials and social proof moderation' },
      { name: 'Spam Defense', slug: 'spams', folder: 'trust', desc: 'Automated spam defense logs and filters' },
      { name: 'CRM Leads', slug: 'leads', folder: 'growth', desc: 'Sales opportunities and prospective clients' },
      { name: 'Subscribers', slug: 'subscribers', folder: 'growth', desc: 'Email newsletter audience' },
      { name: 'Ecosystem Apps', slug: 'apps', folder: 'growth', desc: 'App marketplace and integrations' },
      { name: 'Careers & Hiring', slug: 'careers', folder: 'growth', desc: 'Job postings, applicant resumes, and hiring pipelines' },
    ];

    for (const p of allSystemPerms) {
      const res = await client.query(`
        INSERT INTO permissions (name, slug, folder, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, folder = EXCLUDED.folder, description = EXCLUDED.description
        RETURNING id, slug
      `, [p.name, p.slug, p.folder, p.desc]);

      const permId = res.rows[0].id;

      // Admin (role 1) gets all permissions
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (1, $1)
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `, [permId]);

      // Manager (role 2) gets all except developers management
      if (p.slug !== 'developers') {
        await client.query(`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES (2, $1)
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [permId]);
      }
    }
    console.log(`✓ Synchronized ${allSystemPerms.length} platform permissions.`);

    console.log('\n✨ Database migration and schema synchronization completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
