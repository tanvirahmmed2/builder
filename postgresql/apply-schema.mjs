import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

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

    console.log('Creating creators table, trigger, and index...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS creators (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email CITEXT UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          avatar_url TEXT,
          bio TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          is_verified BOOLEAN NOT NULL DEFAULT FALSE,
          verification_code VARCHAR(255),
          verification_expires_at TIMESTAMPTZ,
          two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
          two_factor_secret VARCHAR(255),
          two_factor_code VARCHAR(10),
          two_factor_expires_at TIMESTAMPTZ,
          recovery_token VARCHAR(255),
          recovery_token_expires_at TIMESTAMPTZ,
          last_login_at TIMESTAMPTZ,
          last_login_ip VARCHAR(45),
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE creators ALTER COLUMN verification_code TYPE VARCHAR(255);

      CREATE INDEX IF NOT EXISTS idx_creators_email ON creators (email);

      DROP TRIGGER IF EXISTS trg_creators_updated_at ON creators;
      CREATE TRIGGER trg_creators_updated_at
      BEFORE UPDATE ON creators
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);

    // Ensure foreign keys on payment, subscription, websites
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_payment_creator' AND table_name = 'payment'
        ) THEN
          BEGIN
            ALTER TABLE payment ADD CONSTRAINT fk_payment_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE;
          EXCEPTION WHEN others THEN NULL;
          END;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_subscription_creator' AND table_name = 'subscription'
        ) THEN
          BEGIN
            ALTER TABLE subscription ADD CONSTRAINT fk_subscription_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE;
          EXCEPTION WHEN others THEN NULL;
          END;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_websites_creator' AND table_name = 'websites'
        ) THEN
          BEGIN
            ALTER TABLE websites ADD CONSTRAINT fk_websites_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE;
          EXCEPTION WHEN others THEN NULL;
          END;
        END IF;
      END $$;
    `);

    // Check if initial packages exist, if not seed packages
    const pkgsCount = await client.query('SELECT COUNT(*)::int AS count FROM packages');
    if (pkgsCount.rows[0].count === 0) {
      console.log('Seeding initial Packages...');
      await client.query(`
        INSERT INTO packages (name, slug, description, price_in_cents, currency, billing_interval, max_portfolios, is_active) VALUES
        ('Starter Launch', 'starter-launch', 'Ideal for solo practitioners and freelancers launching their first flagship portfolio site.', 1900, 'USD', 'MONTHLY', 1, TRUE),
        ('Creator Pro', 'creator-pro', 'Full-featured suite with custom domains, premium themes, booking inquiries, and edge hosting.', 4900, 'USD', 'MONTHLY', 3, TRUE),
        ('Studio Unlimited', 'studio-unlimited', 'Complete agency grade solution with multi-website hosting, team management, and zero platform fees.', 29900, 'USD', 'YEARLY', 10, TRUE)
      `);
    }

    // Check if initial creator exists, if not seed creator, subscription, payment, and website
    const creatorsCount = await client.query('SELECT COUNT(*)::int AS count FROM creators');
    if (creatorsCount.rows[0].count === 0) {
      console.log('Seeding initial Creator, Subscription, Payment, and Website...');
      const creatorRes = await client.query(`
        INSERT INTO creators (name, email, password, phone, avatar_url, bio, is_active, is_verified)
        VALUES (
          'Alex Vance',
          'alex.creator@designcraft.com',
          'Creator@123456',
          '+1 555-0199',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          'Lead Design Technologist & Visual Brand Consultant crafting immersive web experiences.',
          TRUE,
          TRUE
        ) RETURNING id
      `);
      const creatorId = creatorRes.rows[0].id;

      // Get first package
      const pkgRes = await client.query("SELECT id FROM packages WHERE slug = 'creator-pro' LIMIT 1");
      const packageId = pkgRes.rows[0]?.id || 1;

      // Insert subscription
      const subRes = await client.query(`
        INSERT INTO subscription (creator_id, package_id, status, current_period_start, current_period_end)
        VALUES ($1, $2, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')
        RETURNING id
      `, [creatorId, packageId]);
      const subId = subRes.rows[0].id;

      // Insert payment
      await client.query(`
        INSERT INTO payment (creator_id, package_id, subscription_id, amount_in_cents, currency, payment_method, transaction_id, status)
        VALUES ($1, $2, $3, 4900, 'USD', 'CARD', 'TXN_INIT_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 10), 'COMPLETED')
      `, [creatorId, packageId, subId]);

      // Insert website
      await client.query(`
        INSERT INTO websites (creator_id, name, subdomain, custom_domain, status, storage_used_mb, is_published, theme_config)
        VALUES (
          $1,
          'Alex Vance Studio',
          'alex-design',
          'alexvance.design',
          'ACTIVE',
          48,
          TRUE,
          '{"primaryColor": "#6366f1", "fontFamily": "Inter", "accent": "#10b981", "mode": "dark"}'::jsonb
        )
      `, [creatorId]);
    }

    console.log('Creating reviews table, indexes, and trigger...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          creator_id INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
          subscription_id INTEGER NOT NULL REFERENCES subscription(id) ON DELETE CASCADE,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255),
          comment TEXT NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
          approved_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
          approved_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uq_creator_subscription_review UNIQUE (subscription_id)
      );

      CREATE INDEX IF NOT EXISTS idx_reviews_creator ON reviews (creator_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_subscription ON reviews (subscription_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status, created_at DESC);

      DROP TRIGGER IF EXISTS trg_reviews_updated_at ON reviews;
      CREATE TRIGGER trg_reviews_updated_at
      BEFORE UPDATE ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);

    // Check if initial review exists for the seed creator's subscription
    const reviewsCount = await client.query('SELECT COUNT(*)::int AS count FROM reviews');
    if (reviewsCount.rows[0].count === 0) {
      const subRes = await client.query('SELECT id, creator_id FROM subscription LIMIT 1');
      if (subRes.rows.length > 0) {
        console.log('Seeding initial approved review for creator subscription...');
        const adminRes = await client.query("SELECT id FROM developers WHERE role IN ('admin', 'manager') LIMIT 1");
        const adminId = adminRes.rows[0]?.id || null;
        await client.query(`
          INSERT INTO reviews (creator_id, subscription_id, rating, title, comment, status, approved_by_developer_id, approved_at)
          VALUES (
            $1,
            $2,
            5,
            'Superb Studio Builder with Instant Custom Domain',
            'Upgrading to the Creator Pro plan gave me full creative freedom. The custom domain edge SSL provisioned in seconds, and my inquiries skyrocketed. Truly a premier SaaS portfolio solution.',
            'APPROVED',
            $3,
            CURRENT_TIMESTAMP
          )
        `, [subRes.rows[0].creator_id, subRes.rows[0].id, adminId]);
      }
    }

    console.log('Migrating contacts table, indexes, and trigger...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email CITEXT NOT NULL,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'NEW',
          reply TEXT,
          replied_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'contacts' AND column_name = 'admin_reply'
        ) THEN 
          ALTER TABLE contacts RENAME COLUMN admin_reply TO reply; 
        END IF; 
      END $$;

      CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts (status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email);

      DROP TRIGGER IF EXISTS trg_contacts_updated_at ON contacts;
      CREATE TRIGGER trg_contacts_updated_at
      BEFORE UPDATE ON contacts
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);

    console.log('Ensuring support table has creator_id foreign key and index...');
    await client.query(`
      ALTER TABLE support ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES creators(id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS idx_support_creator ON support (creator_id);
    `);

    
    console.log('Renaming any existing website_* tables to website_* tables...');
    const tablesToRename = [
      'website_modules',
      'website_roles',
      'website_permissions',
      'website_role_permissions',
      'website_users',
      'website_user_roles',
      'website_settings',
      'website_blogs',
      'website_blog_images',
      'website_products',
      'website_product_images',
      'website_support',
      'website_support_messages',
      'website_support_images',
      'website_contact',
      'website_purchase',
      'website_purchase_payments',
      'website_offers',
      'website_appointments',
      'website_experiences',
      'website_gallery',
      'website_services',
      'website_testimonials',
      'website_skills',
    ];
    for (const tbl of tablesToRename) {
      const newName = tbl.replace('website_', 'website_');
      try {
        await client.query(`ALTER TABLE IF EXISTS ${tbl} RENAME TO ${newName}`);
      } catch (e) {
        // Ignored if table does not exist or already renamed
      }
    }

    console.log('Applying website-schema.psql for websites...');
    const websiteSchemaPath = path.resolve(__dirname, 'website-schema.psql');
    if (fs.existsSync(websiteSchemaPath)) {
      const websiteSql = fs.readFileSync(websiteSchemaPath, 'utf8');
      await client.query(websiteSql);
      console.log('website-schema.psql applied successfully!');
    }

    // Seed default modules, roles, and settings for any existing websites that don't have them
    const allWebsites = await client.query('SELECT id, name, subdomain, theme_config FROM websites');
    for (const w of allWebsites.rows) {
      // 1. Settings
      const setCheck = await client.query('SELECT id FROM website_settings WHERE website_id = $1', [w.id]);
      if (setCheck.rows.length === 0) {
        const theme = typeof w.theme_config === 'object' && w.theme_config !== null ? w.theme_config : {};
        await client.query(`
          INSERT INTO website_settings (website_id, site_title, tagline, primary_color, font_family)
          VALUES ($1, $2, 'Portfolio & Showcase', $3, $4)
          ON CONFLICT (website_id) DO NOTHING
        `, [w.id, w.name || 'My Portfolio', theme.primaryColor || '#6366f1', theme.fontFamily || 'Inter']);
      }

      // Check if website already has modules seeded to prevent redundant round-trips
      const existingMods = await client.query('SELECT COUNT(*)::int AS count FROM website_modules WHERE website_id = $1', [w.id]);
      if (existingMods.rows[0].count > 0) {
        continue;
      }

      // 2. Default Modules
      const defaultModules = [
        { name: 'Products & Store', slug: 'products', description: 'E-commerce products, digital downloads & inventory' },
        { name: 'Blog & Articles', slug: 'blogs', description: 'Articles, news and blog publishing' },
        { name: 'Appointment Booking', slug: 'appointments', description: 'Client booking and schedule management' },
        { name: 'Support Tickets', slug: 'support', description: 'Customer inquiry and support ticketing' },
        { name: 'Portfolio Gallery', slug: 'gallery', description: 'Media showcase and portfolio visual gallery' },
        { name: 'Experiences Timeline', slug: 'experiences', description: 'Work history, education and milestones' },
        { name: 'Services Offered', slug: 'services', description: 'Bespoke service packages and pricing' },
        { name: 'Client Testimonials', slug: 'testimonials', description: 'Customer reviews and endorsements' },
        { name: 'Contact Inquiries', slug: 'contact', description: 'Direct contact messaging and leads' },
      ];

      for (const m of defaultModules) {
        await client.query(`
          INSERT INTO website_modules (website_id, name, slug, description, is_enabled)
          VALUES ($1, $2, $3, $4, TRUE)
          ON CONFLICT (website_id, slug) DO NOTHING
        `, [w.id, m.name, m.slug, m.description]);
      }

      // 3. Default Roles (Owner, Admin, Editor, Customer)
      const defaultRoles = [
        { name: 'Owner', slug: 'owner', description: 'Full owner access with all privileges', is_system: true },
        { name: 'Admin', slug: 'admin', description: 'Site administrator with full management rights', is_system: true },
        { name: 'Editor', slug: 'editor', description: 'Content editor for blogs, products & portfolio', is_system: false },
        { name: 'Support Specialist', slug: 'support-specialist', description: 'Support ticket and inquiry handler', is_system: false },
      ];

      for (const r of defaultRoles) {
        await client.query(`
          INSERT INTO website_roles (website_id, name, slug, description, is_system)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (website_id, slug) DO NOTHING
        `, [w.id, r.name, r.slug, r.description, r.is_system]);
      }

      // 4. Default Permissions for standard modules
      const modRows = await client.query('SELECT id, slug FROM website_modules WHERE website_id = $1', [w.id]);
      const actions = ['view', 'create', 'edit', 'delete', 'manage'];
      for (const mod of modRows.rows) {
        for (const act of actions) {
          const pName = `${act.charAt(0).toUpperCase() + act.slice(1)} ${mod.slug}`;
          const pSlug = `${mod.slug}.${act}`;
          await client.query(`
            INSERT INTO website_permissions (website_id, module_id, name, slug, action, is_custom)
            VALUES ($1, $2, $3, $4, $5, FALSE)
            ON CONFLICT (website_id, slug) DO NOTHING
          `, [w.id, mod.id, pName, pSlug, act]);
        }
      }

      // 5. Seed owner role permissions (grant all)
      const ownerRole = await client.query('SELECT id FROM website_roles WHERE website_id = $1 AND slug = $2', [w.id, 'owner']);
      if (ownerRole.rows.length > 0) {
        const allPerms = await client.query('SELECT id FROM website_permissions WHERE website_id = $1', [w.id]);
        for (const p of allPerms.rows) {
          await client.query(`
            INSERT INTO website_role_permissions (role_id, permission_id)
            VALUES ($1, $2)
            ON CONFLICT (role_id, permission_id) DO NOTHING
          `, [ownerRole.rows[0].id, p.id]);
        }
      }

      // 6. Seed sample services, experiences, skills, blogs & products if none exist
      const servicesCount = await client.query('SELECT COUNT(*)::int AS count FROM website_services WHERE website_id = $1', [w.id]);
      if (servicesCount.rows[0].count === 0) {
        await client.query(`
          INSERT INTO website_services (website_id, title, slug, description, price_starting_at, features) VALUES
          ($1, 'Full-Stack Web Architecture', 'full-stack-architecture', 'Bespoke high-performance web applications built with Next.js, Node.js and PostgreSQL.', 1499, '["End-to-End Development", "Custom Database Schema", "Responsive UI/UX", "SEO Optimization"]'::jsonb),
          ($1, 'UI/UX & Brand Design', 'ui-ux-design', 'Elevate your brand with award-winning visual identities and interactive component systems.', 899, '["Design System", "Figma Prototypes", "Dark/Light Modes", "Mobile-First Layouts"]'::jsonb),
          ($1, 'Technical Consulting & Audit', 'technical-consulting', 'Deep-dive security, performance, and scalability code reviews for growing digital products.', 499, '["Code Audit", "Performance Profiling", "Security Hardening", "Architecture Roadmap"]'::jsonb)
        `, [w.id]);
      }

      const expCount = await client.query('SELECT COUNT(*)::int AS count FROM website_experiences WHERE website_id = $1', [w.id]);
      if (expCount.rows[0].count === 0) {
        await client.query(`
          INSERT INTO website_experiences (website_id, role_title, organization, location, start_date, is_current, description, skills_used, sort_order) VALUES
          ($1, 'Lead Full-Stack Engineer', 'Apex Digital Studio', 'San Francisco, CA', '2023-01-01', TRUE, 'Architected distributed SaaS platforms, increased core web vitals by 45%, and spearheaded design system revamp.', ARRAY['Next.js', 'PostgreSQL', 'TailwindCSS', 'TypeScript'], 1),
          ($1, 'Senior Frontend Developer', 'Pulse Cloud Systems', 'Remote', '2021-03-01', FALSE, 'Built real-time interactive analytics dashboards, streaming websocket interfaces, and accessible design components.', ARRAY['React', 'JavaScript', 'Node.js', 'WebSockets'], 2)
        `, [w.id]);
      }

      const prodCount = await client.query('SELECT COUNT(*)::int AS count FROM website_products WHERE website_id = $1', [w.id]);
      if (prodCount.rows[0].count === 0) {
        await client.query(`
          INSERT INTO website_products (website_id, name, slug, description, short_description, price_in_cents, compare_at_price_in_cents, status, is_featured, is_digital) VALUES
          ($1, 'Next.js Ultimate SaaS Starter Kit', 'saas-starter-kit', 'Production-ready starter boilerplate with auth, PostgreSQL, Stripe payments, and modular dashboards.', 'Complete multi-website SaaS starter kit.', 4900, 7900, 'ACTIVE', TRUE, TRUE),
          ($1, 'Minimalist Portfolio & Blog Template', 'minimalist-portfolio-template', 'Ultra-clean responsive portfolio layout tailored for designers, creators, and engineers.', 'Responsive portfolio template with dark mode.', 2900, 4900, 'ACTIVE', TRUE, TRUE)
        `, [w.id]);
      }

      const blogCount = await client.query('SELECT COUNT(*)::int AS count FROM website_blogs WHERE website_id = $1', [w.id]);
      if (blogCount.rows[0].count === 0) {
        await client.query(`
          INSERT INTO website_blogs (website_id, title, slug, excerpt, content, is_published, views_count) VALUES
          ($1, 'Building Resilient Multi-Website Architectures in 2026', 'building-resilient-multi-website-architectures', 'An in-depth exploration of database partitioning, role-based access control, and subdomain routing.', '<p>Modern SaaS applications demand flexibility, isolation, and speed. By architecting website models with dedicated foreign keys, customizable roles, and fine-grained module permissions, platforms can scale seamlessly.</p><p>In this guide, we break down best practices for multi-website state and permissions management.</p>', TRUE, 128)
        `, [w.id]);
      }

      const skillsCount = await client.query('SELECT COUNT(*)::int AS count FROM website_skills WHERE website_id = $1', [w.id]);
      if (skillsCount.rows[0].count === 0) {
        await client.query(`
          INSERT INTO website_skills (website_id, name, category, proficiency, sort_order) VALUES
          ($1, 'Next.js & React 19', 'Frontend', 95, 1),
          ($1, 'PostgreSQL & Database Architecture', 'Backend', 90, 2),
          ($1, 'TailwindCSS & Modern UI', 'Design', 92, 3),
          ($1, 'Node.js & REST APIs', 'Backend', 88, 4)
        `, [w.id]);
      }
    }

    // =========================================================================
    // DEVELOPERS INITIAL SUPER ADMIN SEED
    // =========================================================================
    console.log('Checking developers table and seeding initial Super Admin if empty...');
    const devCount = await client.query('SELECT COUNT(*)::int AS count FROM developers');
    if (devCount.rows[0].count === 0) {
      console.log('Seeding initial Super Admin developer...');
      const adminPass = await bcrypt.hash('admin123456', 10);
      await client.query(`
        INSERT INTO developers (name, email, password, role, is_active, is_verified)
        VALUES ('Super Admin', 'admin@portfoliobuilder.com', $1, 'admin', TRUE, TRUE)
      `, [adminPass]);
    }

    // =========================================================================
    // PAYROLL TABLES
    // =========================================================================
    console.log('Creating payrolls, developer_payrolls, and payroll_payments tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS payrolls (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          pay_period_start DATE NOT NULL,
          pay_period_end DATE NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'CANCELLED')),
          total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          notes TEXT,
          created_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_payrolls_status ON payrolls (status);
      CREATE INDEX IF NOT EXISTS idx_payrolls_period ON payrolls (pay_period_start, pay_period_end);

      DROP TRIGGER IF EXISTS trg_payrolls_updated_at ON payrolls;
      CREATE TRIGGER trg_payrolls_updated_at
      BEFORE UPDATE ON payrolls
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();

      CREATE TABLE IF NOT EXISTS developer_payrolls (
          id SERIAL PRIMARY KEY,
          payroll_id INTEGER NOT NULL REFERENCES payrolls(id) ON DELETE CASCADE,
          developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
          base_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          bonus NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          net_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PROCESSING', 'PAID', 'FAILED')),
          payment_method VARCHAR(50) DEFAULT 'BANK_TRANSFER' CHECK (payment_method IN ('BANK_TRANSFER', 'STRIPE', 'PAYPAL', 'CASH', 'CRYPTO', 'CHECK')),
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uq_developer_payroll UNIQUE (payroll_id, developer_id)
      );

      CREATE INDEX IF NOT EXISTS idx_developer_payrolls_payroll ON developer_payrolls (payroll_id);
      CREATE INDEX IF NOT EXISTS idx_developer_payrolls_developer ON developer_payrolls (developer_id);
      CREATE INDEX IF NOT EXISTS idx_developer_payrolls_status ON developer_payrolls (payment_status);

      DROP TRIGGER IF EXISTS trg_developer_payrolls_updated_at ON developer_payrolls;
      CREATE TRIGGER trg_developer_payrolls_updated_at
      BEFORE UPDATE ON developer_payrolls
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();

      CREATE TABLE IF NOT EXISTS payroll_payments (
          id SERIAL PRIMARY KEY,
          developer_payroll_id INTEGER NOT NULL REFERENCES developer_payrolls(id) ON DELETE CASCADE,
          payroll_id INTEGER NOT NULL REFERENCES payrolls(id) ON DELETE CASCADE,
          developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
          amount NUMERIC(12, 2) NOT NULL,
          payment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          payment_method VARCHAR(50) NOT NULL,
          transaction_reference VARCHAR(255),
          status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'PENDING', 'FAILED', 'REFUNDED')),
          processed_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_payroll_payments_developer_payroll ON payroll_payments (developer_payroll_id);
      CREATE INDEX IF NOT EXISTS idx_payroll_payments_developer ON payroll_payments (developer_id);
      CREATE INDEX IF NOT EXISTS idx_payroll_payments_date ON payroll_payments (payment_date DESC);
    `);

    // =========================================================================
    // INTERNAL CHAT TABLES
    // =========================================================================
    console.log('Creating internal_chats, chat_participants, chat_messages, chat_images tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS internal_chats (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255),
          type VARCHAR(50) NOT NULL DEFAULT 'DIRECT' CHECK (type IN ('DIRECT', 'GROUP')),
          created_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_internal_chats_type ON internal_chats (type);
      CREATE INDEX IF NOT EXISTS idx_internal_chats_updated_at ON internal_chats (updated_at DESC);

      DROP TRIGGER IF EXISTS trg_internal_chats_updated_at ON internal_chats;
      CREATE TRIGGER trg_internal_chats_updated_at
      BEFORE UPDATE ON internal_chats
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();

      CREATE TABLE IF NOT EXISTS chat_participants (
          id SERIAL PRIMARY KEY,
          chat_id INTEGER NOT NULL REFERENCES internal_chats(id) ON DELETE CASCADE,
          developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
          joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_read_at TIMESTAMPTZ,
          CONSTRAINT uq_chat_participant UNIQUE (chat_id, developer_id)
      );

      CREATE INDEX IF NOT EXISTS idx_chat_participants_chat ON chat_participants (chat_id);
      CREATE INDEX IF NOT EXISTS idx_chat_participants_developer ON chat_participants (developer_id);

      CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          chat_id INTEGER NOT NULL REFERENCES internal_chats(id) ON DELETE CASCADE,
          sender_developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
          message TEXT,
          is_system BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_created ON chat_messages (chat_id, created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages (sender_developer_id);

      CREATE TABLE IF NOT EXISTS chat_images (
          id SERIAL PRIMARY KEY,
          message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          file_name VARCHAR(255),
          file_size INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_chat_images_message ON chat_images (message_id);
    `);

    // =========================================================================
    // TASKS & TASK COMMENTS TABLES
    // =========================================================================
    console.log('Creating tasks and task_comments tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED')),
          priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
          assigned_to_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
          created_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
          due_date TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks (priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks (assigned_to_developer_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks (created_at DESC);

      DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks;
      CREATE TRIGGER trg_tasks_updated_at
      BEFORE UPDATE ON tasks
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();

      CREATE TABLE IF NOT EXISTS task_comments (
          id SERIAL PRIMARY KEY,
          task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
          developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
          comment TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments (task_id, created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_task_comments_developer ON task_comments (developer_id);

      DROP TRIGGER IF EXISTS trg_task_comments_updated_at ON task_comments;
      CREATE TRIGGER trg_task_comments_updated_at
      BEFORE UPDATE ON task_comments
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);

    // =========================================================================
    // NOTICES TABLE
    // =========================================================================
    console.log('Creating notices table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS notices (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
          category VARCHAR(100) NOT NULL DEFAULT 'GENERAL' CHECK (category IN ('GENERAL', 'ANNOUNCEMENT', 'MAINTENANCE', 'SECURITY', 'POLICY')),
          is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
          target_role VARCHAR(50) NOT NULL DEFAULT 'ALL',
          created_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
          expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_notices_pinned_created ON notices (is_pinned DESC, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notices_target_role ON notices (target_role);

      DROP TRIGGER IF EXISTS trg_notices_updated_at ON notices;
      CREATE TRIGGER trg_notices_updated_at
      BEFORE UPDATE ON notices
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);

    // Seed starter notices if empty
    const noticesCount = await client.query('SELECT COUNT(*)::int AS count FROM notices');
    if (noticesCount.rows[0].count === 0) {
      console.log('Seeding initial company notice...');
      await client.query(`
        INSERT INTO notices (title, content, priority, category, is_pinned, target_role)
        VALUES (
          'Welcome to the Multi-Website Platform Developer Center',
          'All developers, managers, and administrators now have centralized access to team sprints, internal communications, company notices, and operational modules. Please ensure your profile credentials and security settings are up to date.',
          'HIGH',
          'ANNOUNCEMENT',
          TRUE,
          'ALL'
        )
      `);
    }

    // =========================================================================
    // TUTORIALS TABLE
    // =========================================================================
    console.log('Creating tutorials table, indexes and trigger...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tutorials (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          youtube_link VARCHAR(500) NOT NULL,
          created_by_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tutorials_created_at ON tutorials (created_at DESC);

      DROP TRIGGER IF EXISTS trg_tutorials_updated_at ON tutorials;
      CREATE TRIGGER trg_tutorials_updated_at
      BEFORE UPDATE ON tutorials
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);

    // Seed starter tutorials if empty
    const tutsCount = await client.query('SELECT COUNT(*)::int AS count FROM tutorials');
    if (tutsCount.rows[0].count === 0) {
      console.log('Seeding initial tutorials...');
      await client.query(`
        INSERT INTO tutorials (title, description, youtube_link) VALUES
        ('Building Your First Portfolio Website in Under 5 Minutes', 'Learn how to choose a theme, customize typography and colors, and launch your personal portfolio on a fast custom subdomain.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
        ('Connecting Custom Domains and Configuring SSL Provisioning', 'A step-by-step walkthrough explaining how to point DNS CNAME and A records to publish your portfolio to your personal domain name.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
        ('Managing E-commerce Products & Digital Storefronts', 'Discover how to add digital downloads, set up payment methods, organize inventory categories, and receive client inquiries.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
        ('Role-Based Staff Access & Client Permissions Guide', 'A comprehensive operational guide on assigning granular roles (Owner, Admin, Editor) and permissions to team members.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
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
