import fs from 'fs';
import path from 'path';
import { queryDb } from '../src/lib/db/pg.js';

async function main() {
  console.log('--- Step 1: Checking and creating policies table ---');
  await queryDb(`
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
  console.log('✓ Policies table and indexes ensured.');

  // Create policies trigger
  try {
    await queryDb(`
      DROP TRIGGER IF EXISTS trg_policies_updated_at ON policies;
      CREATE TRIGGER trg_policies_updated_at
      BEFORE UPDATE ON policies
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);
    console.log('✓ Policies trigger ensured.');
  } catch (e) {
    console.log('Note on trigger:', e.message);
  }

  // Check if career and career_application tables exist
  console.log('--- Step 2: Checking career and career_application tables ---');
  await queryDb(`
    CREATE TABLE IF NOT EXISTS career (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        department VARCHAR(100) NOT NULL,
        job_type VARCHAR(50) NOT NULL DEFAULT 'FULL_TIME',
        workplace_type VARCHAR(50) NOT NULL DEFAULT 'REMOTE',
        location VARCHAR(255) DEFAULT 'Remote',
        experience_level VARCHAR(50) DEFAULT 'MID_LEVEL',
        salary_range VARCHAR(100),
        description TEXT NOT NULL,
        requirements TEXT,
        responsibilities TEXT,
        benefits TEXT,
        deadline TIMESTAMPTZ,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        created_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_career_slug ON career (slug);
    CREATE INDEX IF NOT EXISTS idx_career_published ON career (is_published, created_at DESC);
  `);
  console.log('✓ Career table ensured.');

  await queryDb(`
    CREATE TABLE IF NOT EXISTS career_application (
        id SERIAL PRIMARY KEY,
        career_id INTEGER NOT NULL REFERENCES career(id) ON DELETE CASCADE,
        applicant_name VARCHAR(255) NOT NULL,
        applicant_email CITEXT NOT NULL,
        applicant_phone VARCHAR(50),
        resume_url TEXT NOT NULL,
        portfolio_url TEXT,
        linkedin_url TEXT,
        cover_letter TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        reviewer_notes TEXT,
        reviewed_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_career_application_career ON career_application (career_id, created_at DESC);
  `);
  console.log('✓ Career application table ensured.');

  // Step 3: Insert default policies if table is empty
  const polCount = await queryDb('SELECT COUNT(*)::int AS count FROM policies');
  if (polCount.rows[0].count === 0) {
    console.log('--- Step 3: Seeding standard policies ---');
    const defaultPolicies = [
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        description: `Welcome to our platform. By accessing or using our websites, APIs, creator studios, or applications, you agree to be bound by these Terms of Service.

1. Acceptance of Terms
By creating an account or accessing our services, you confirm that you are at least 18 years of age and legally capable of entering into binding contracts.

2. Creator Accounts & Responsibilities
You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to distribute malicious software, violate intellectual property rights, or engage in abusive platform behavior.

3. Subscription Plans & Billing
Platform subscriptions are billed in advance on a recurring monthly or annual basis. You may cancel your subscription at any time via your Creator Settings.

4. Intellectual Property
All content, themes, visual systems, and platform tools remain the property of the platform or their respective licensors. You retain full ownership of the digital assets and media you upload to your portfolio.

5. Termination & Suspension
We reserve the right to suspend or terminate accounts that violate our security guidelines or acceptable use policies without prior liability.`,
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        description: `We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, store, and process your personal information.

1. Information We Collect
We collect information you provide directly to us when registering an account, publishing content, submitting support tickets, or communicating with us. This includes your name, email address, payment details, and portfolio configurations.

2. How We Use Your Data
We utilize your information to operate, maintain, and enhance platform functionality, process subscriptions, authenticate login sessions, and prevent fraudulent activities.

3. Data Sharing & Third Parties
We do not sell your personal data. We only share information with trusted third-party service providers (such as cloud hosting, payment gateways, and email dispatchers) strictly necessary to deliver platform services.

4. Cookies and Tracking Technologies
We employ functional cookies to maintain authenticated sessions and optimize site performance. You can manage cookie preferences through your browser settings.

5. Your Legal Rights
Depending on your location, you have the right to request access to, rectification of, or deletion of your personal data stored within our systems. Contact our compliance desk for assistance.`,
      },
      {
        title: 'Refund & Cancellation Policy',
        slug: 'refund-policy',
        description: `Our refund policy is designed to be fair, transparent, and aligned with standard digital software-as-a-service practices.

1. 14-Day Satisfaction Window
If you are unsatisfied with your subscription plan within the first 14 days of your initial purchase, you may request a full refund by submitting a ticket to our support team.

2. Cancellation Policy
You may cancel your recurring subscription at any time. Upon cancellation, your subscription will remain active until the end of the current billing cycle, with no further automated charges.

3. Digital Goods & Custom Domains
Certain third-party fees, including custom domain registrations and non-refundable transaction fees, may not be eligible for refunds once provisioned.`,
      },
      {
        title: 'Cookie Policy',
        slug: 'cookie-policy',
        description: `This Cookie Policy explains how our platform utilizes cookies and similar tracking technologies to enhance user experience and secure session integrity.

1. What Are Cookies?
Cookies are small data files placed on your computer or mobile device when you browse websites.

2. Essential Cookies
Essential cookies are strictly required to authenticate user sessions, maintain shopping carts, and prevent cross-site request forgery attacks.

3. Analytics Cookies
We use anonymous telemetry cookies to monitor website performance and identify bugs.

4. Managing Preferences
You can configure your browser to block or alert you about cookies; however, some platform features may not function properly without essential cookies.`,
      },
    ];

    for (const p of defaultPolicies) {
      await queryDb(`
        INSERT INTO policies (title, slug, description, is_published)
        VALUES ($1, $2, $3, TRUE)
        ON CONFLICT (slug) DO NOTHING
      `, [p.title, p.slug, p.description]);
    }
    console.log(`✓ Seeded ${defaultPolicies.length} standard policies.`);
  }

  // Step 4: Ensure permissions table has policies and careers
  console.log('--- Step 4: Updating system permissions & role_permissions ---');
  const newPerms = [
    { name: 'Company Policies', slug: 'policies', folder: 'policies', desc: 'Platform terms of service, privacy policies, and compliance documents' },
    { name: 'Careers & Hiring', slug: 'careers', folder: 'careers', desc: 'Job postings, applicant resumes, and hiring pipelines' },
  ];

  for (const perm of newPerms) {
    const res = await queryDb(`
      INSERT INTO permissions (name, slug, folder, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, folder = EXCLUDED.folder, description = EXCLUDED.description
      RETURNING id, slug
    `, [perm.name, perm.slug, perm.folder, perm.desc]);
    
    const permId = res.rows[0].id;
    console.log(`✓ Permission [${perm.slug}] id: ${permId}`);

    // Grant to admin (role 1), manager (role 2), developer (role 3)
    for (const roleId of [1, 2, 3]) {
      await queryDb(`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ($1, $2)
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `, [roleId, permId]);
    }
    console.log(`✓ Granted [${perm.slug}] to roles 1, 2, 3`);
  }

  console.log('\n--- All database tables & permissions updated successfully! ---');
  process.exit(0);
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
