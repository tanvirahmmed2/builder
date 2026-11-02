import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDbPool } from '@/lib/db/pg';

/**
 * /api/seed/website-modules
 * 
 * Seeds all website modules into `website_modules` derived from:
 * 1. Public storefront pages: `/[domain]/(home)/...`
 * 2. Control center panels: `/[domain]/panel/control/...`
 */

export const ALL_TENANT_MODULES = [
  // --------------------------------------------------------------------------
  // SECTION 1: Storefront & Public-Facing Modules (/[domain]/(home)/...)
  // --------------------------------------------------------------------------
  { slug: 'home', name: 'Storefront Homepage', category: 'storefront', description: 'Public storefront hero, featured catalog, and brand showcase' },
  { slug: 'about', name: 'About Us', category: 'storefront', description: 'Company biography, founder story, mission, and value pillars' },
  { slug: 'products', name: 'Catalog & Menu', category: 'storefront', description: 'Public product catalog, food menu items, and project showcase' },
  { slug: 'cart', name: 'Shopping Cart', category: 'storefront', description: 'Dynamic cart slideover, item quantities, and checkout drawer' },
  { slug: 'appointments', name: 'Reservations & Booking', category: 'storefront', description: 'Online table reservation calendar and appointment scheduling' },
  { slug: 'contacts', name: 'Contact Us', category: 'storefront', description: 'Customer contact inquiry form, direct phone, and location map' },
  { slug: 'blogs', name: 'Articles & News', category: 'storefront', description: 'Public blog feed, editorial stories, categories, and author bios' },
  { slug: 'faqs', name: 'FAQs & Help', category: 'storefront', description: 'Frequently asked questions, search, and help center answers' },
  { slug: 'gallery', name: 'Media Gallery', category: 'storefront', description: 'Visual photo albums, event galleries, and media lightbox' },
  { slug: 'services', name: 'Services Offered', category: 'storefront', description: 'Professional service tiers, deliverable lists, and pricing' },
  { slug: 'reviews', name: 'Customer Reviews', category: 'storefront', description: 'Public customer feedback ratings, testimonials, and verified badges' },
  { slug: 'search', name: 'Catalog Search', category: 'storefront', description: 'Full-text catalog search, filter tags, and instant suggestions' },
  { slug: 'awards', name: 'Awards & Honors', category: 'storefront', description: 'Industry certifications, awards, and organizational honors' },
  { slug: 'partners', name: 'Brand Partners', category: 'storefront', description: 'Partner logos, enterprise affiliations, and vendor network' },
  { slug: 'privacy-policy', name: 'Privacy & Terms', category: 'storefront', description: 'Legal compliance policy, privacy notice, and return terms' },

  // --------------------------------------------------------------------------
  // SECTION 2: Control Panel Operations & Catalog (/[domain]/panel/control/...)
  // --------------------------------------------------------------------------
  { slug: 'overview', name: 'Control Overview', category: 'operations', description: 'Real-time performance analytics, revenue summaries, and activity metrics' },
  { slug: 'balance', name: 'Balance Management', category: 'operations', description: 'Available balance, income/expense breakdown, and fund adjustments' },
  { slug: 'branches', name: 'Branch Outlets', category: 'operations', description: 'Multi-branch outlet locations, contact information, and registers' },
  { slug: 'people', name: 'People & Accounts', category: 'operations', description: 'Staff user accounts, role assignments, access permissions, and profiles' },
  { slug: 'category', name: 'Product Categories', category: 'operations', description: 'Nested catalog categories, sub-categories, taxonomies, and visual groups' },
  { slug: 'brands', name: 'Brands Directory', category: 'operations', description: 'Product brand directory, manufacturer details, logos, and vendor affiliations' },
  { slug: 'product', name: 'Products Catalog', category: 'operations', description: 'Product items, multi-variant SKUs, pricing rules, and media galleries' },
  { slug: 'stock', name: 'Stock & Inventory', category: 'operations', description: 'Inventory stock levels, low-stock alerts, reorder thresholds, and adjustments' },
  { slug: 'purchase', name: 'Purchases & Inbound', category: 'operations', description: 'Purchase orders, inbound inventory shipments, and supplier invoices' },
  { slug: 'supplier', name: 'Suppliers Directory', category: 'operations', description: 'Vendor contacts, supplier profiles, purchase agreements, and terms' },
  { slug: 'customers', name: 'Customer Directory', category: 'operations', description: 'Customer profiles, purchase histories, loyalty metrics, and contacts' },
  { slug: 'sale', name: 'Touch POS & Invoicing', category: 'operations', description: 'Fast POS checkouts, customer cards, manual discounting, and transactions' },
  { slug: 'orders', name: 'Store Orders', category: 'operations', description: 'Order status lifecycle, invoices, delivery dispatch, and courier tracking' },
  { slug: 'pending-sale', name: 'Pending Orders', category: 'operations', description: 'Review cash-on-delivery orders waiting for dispatch confirmation' },
  { slug: 'confirmed-sale', name: 'Confirmed Orders', category: 'operations', description: 'Confirmed sales orders ready for packing, dispatch, or pickup fulfillment' },
  { slug: 'out_for_delivery', name: 'Out for Delivery', category: 'operations', description: 'Orders currently with shipping couriers. Update delivery status or returns' },
  { slug: 'completed-sale', name: 'Completed Orders', category: 'operations', description: 'Finalized invoices, paid receipts, and archive order histories' },
  { slug: 'returned-sale', name: 'Returned Orders', category: 'operations', description: 'Returned sales orders with restocked inventory items' },
  { slug: 'history', name: 'Sales Register History', category: 'operations', description: 'Sales register shift transactions, staff checkouts, and historical ledger' },
  { slug: 'payments', name: 'Payment Transactions', category: 'operations', description: 'Cash register collections, digital payments, bank transfers, and receipts' },
  { slug: 'return', name: 'Returns & Refunds', category: 'operations', description: 'Product return authorization, customer credit notes, and restocking logs' },
  { slug: 'support', name: 'Support Tickets', category: 'operations', description: 'Customer helpdesk tickets, issue logs, and inquiry resolution' },
  { slug: 'contact', name: 'Contact Messages', category: 'operations', description: 'Contact form submissions, customer inquiries, and lead communication' },
  { slug: 'report', name: 'Reports & Analytics', category: 'operations', description: 'Financial statements, sales summaries, and tax computation reports' },
  { slug: 'backup', name: 'System Backups', category: 'operations', description: 'Database snapshots, export data archives, and recovery restore points' },
  { slug: 'settings', name: 'Platform Settings', category: 'operations', description: 'Store parameters, tax configuration, currencies, and custom domain setup' },
  { slug: 'issue', name: 'Issue Reports', category: 'operations', description: 'Staff technical bug reports, feature requests, and system tickets' },
  { slug: 'profile', name: 'Account Profile', category: 'operations', description: 'Staff profile details, active sessions, and password security' },
  { slug: 'price-tag', name: 'Price Tag Generator', category: 'operations', description: 'Barcode labels, QR price tags, and shelf label printing' },
  { slug: 'login-logs', name: 'Login Activity Logs', category: 'operations', description: 'Staff login history, IP address tracking, and authentication audits' },
  { slug: 'activity-logs', name: 'Activity Audit Trail', category: 'operations', description: 'Audit trail of administrative mutations, stock changes, and refunds' },

  // --------------------------------------------------------------------------
  // SECTION 3: Control Panel Financial & Ledger Modules
  // --------------------------------------------------------------------------
  { slug: 'expenses', name: 'Expense Vouchers', category: 'finance', description: 'Operational expenses, petty cash vouchers, and bill categorization' },
  { slug: 'expense-payments', name: 'Expense Payments', category: 'finance', description: 'Disbursement transactions, bank checks, and expense payment receipts' },
  { slug: 'salaries', name: 'Staff Salaries', category: 'finance', description: 'Employee salary structures, monthly payroll rosters, and pay grades' },
  { slug: 'salary-payments', name: 'Salary Payments', category: 'finance', description: 'Processed salary disbursements, mobile banking transfers, and slips' },
  { slug: 'staff-salaries', name: 'Staff Payroll Profiles', category: 'finance', description: 'Staff compensation setup, allowances, deductions, and tax withholdings' },
  { slug: 'my-salary', name: 'My Paystubs', category: 'finance', description: 'Individual staff salary receipts, deductions, and bonus ledger' },
  { slug: 'profits', name: 'Profit & Loss', category: 'finance', description: 'Gross profit margins, operating income, and net earnings breakdowns' },
  { slug: 'investments', name: 'Capital Investments', category: 'finance', description: 'Capital funding, expansion investments, and asset acquisition logs' },
  { slug: 'investor', name: 'Investor Directory', category: 'finance', description: 'Stakeholder profiles, invested capital, and equity percentages' },
  { slug: 'shares', name: 'Shareholder Equity', category: 'finance', description: 'Equity share certificates, capital ownership, and dividend history' },
  { slug: 'withdrawals', name: 'Capital Withdrawals', category: 'finance', description: 'Partner drawings, owner withdrawals, and dividend disbursements' },
  { slug: 'purchase-payments', name: 'Supplier Bill Payments', category: 'finance', description: 'Inbound supplier bill payments, credit terms, and due clearances' },

  // --------------------------------------------------------------------------
  // SECTION 4: Specialized Multi-Type Engines & Tools
  // --------------------------------------------------------------------------
  { slug: 'portfolio', name: 'Portfolio Showcase', category: 'specialized', description: 'Creative project galleries, case studies, skill sets, and services' },
  { slug: 'restaurant', name: 'Restaurant & POS', category: 'specialized', description: 'Digital food menus, kitchen display system (KDS), addons, and dining tables' },
  { slug: 'organization', name: 'Team & Organization', category: 'specialized', description: 'Staff directory, departments, org chart, company notices, and careers' },
  { slug: 'tours', name: 'Tour & Travel Booking', category: 'specialized', description: 'Tour packages, itinerary schedules, travel bookings, and destination guides' },
  { slug: 'real-estate', name: 'Real Estate Listings', category: 'specialized', description: 'Property catalog, rental/sale listings, amenities, and agent directory' },
  { slug: 'transport', name: 'Vehicle & Transport', category: 'specialized', description: 'Fleet vehicles, transport routes, booking schedules, and trips' },
  { slug: 'tutorials', name: 'Guides & Tutorials', category: 'specialized', description: 'Knowledge base articles, step-by-step guides, and video tutorials' },
  { slug: 'coupons', name: 'Coupons & Discounts', category: 'specialized', description: 'Promotional discount codes, percentage vouchers, and cart promo rules' },
  { slug: 'loyalty', name: 'Loyalty Rewards', category: 'specialized', description: 'Customer loyalty point programs, VIP tiers, and redemption rewards' },
  { slug: 'affiliates', name: 'Affiliate Referrals', category: 'specialized', description: 'Affiliate referral partners, tracking links, and commission payouts' },
  { slug: 'tali-khata', name: 'Tali-Khata (Due Book)', category: 'specialized', description: 'Traditional credit ledger, customer dues, supplier payables, and reminders' },
  { slug: 'meta-inbox', name: 'Meta Unified Inbox', category: 'specialized', description: 'Synchronized Facebook Page Messenger and WhatsApp Business chat inbox' },
  { slug: 'automation', name: 'Automation Workflows', category: 'specialized', description: 'Triggered business automations, webhooks, and recurring system tasks' },
  { slug: 'media', name: 'Media Library', category: 'specialized', description: 'Centralized media storage, image asset uploads, and gallery management' },
  { slug: 'notices', name: 'Notice Board', category: 'specialized', description: 'Company notices, staff memos, and operational directives' },
  { slug: 'modules', name: 'Modules Switcher', category: 'specialized', description: 'Control panel module activation, visibility toggles, and feature settings' },
];

async function seedWebsiteModules(params = {}) {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Resolve Target Websites
    let targetWebsites = [];

    if (params.website_id) {
      const singleRes = await client.query(
        'SELECT id, name, subdomain FROM websites WHERE id = $1 LIMIT 1',
        [Number(params.website_id)]
      );
      if (singleRes.rows.length > 0) targetWebsites = singleRes.rows;
    } else if (params.domain) {
      const domainRes = await client.query(
        'SELECT id, name, subdomain FROM websites WHERE LOWER(subdomain) = $1 OR LOWER(custom_domain) = $1 LIMIT 1',
        [String(params.domain).toLowerCase().trim()]
      );
      if (domainRes.rows.length > 0) targetWebsites = domainRes.rows;
    }

    // Default to all existing websites
    if (targetWebsites.length === 0) {
      const allRes = await client.query('SELECT id, name, subdomain FROM websites ORDER BY id ASC');
      targetWebsites = allRes.rows;
    }

    // If no websites exist yet in the database, provision a default system creator and starter website
    if (targetWebsites.length === 0) {
      let creatorId;
      const creatorRes = await client.query('SELECT id FROM creators LIMIT 1');
      if (creatorRes.rows.length > 0) {
        creatorId = creatorRes.rows[0].id;
      } else {
        const hashedPw = await bcrypt.hash('creator123456', 10);
        const newCreator = await client.query(
          `INSERT INTO creators (name, email, password, is_verified)
           VALUES ('Primary Creator', 'creator@disibin.com', $1, TRUE)
           RETURNING id`,
          [hashedPw]
        );
        creatorId = newCreator.rows[0].id;
      }

      const starterWeb = await client.query(
        `INSERT INTO websites (creator_id, name, subdomain, theme_config, status, is_published)
         VALUES ($1, 'Primary Store & Showcase', 'main', '{}'::jsonb, 'ACTIVE', TRUE)
         RETURNING id, name, subdomain`,
        [creatorId]
      );
      targetWebsites = [starterWeb.rows[0]];
    }

    // 2. Insert all 75 modules for each target website
    let totalInserted = 0;
    const summary = [];

    for (const web of targetWebsites) {
      let webCount = 0;
      for (const m of ALL_TENANT_MODULES) {
        await client.query(
          `INSERT INTO website_modules (website_id, name, slug, description, is_enabled, is_active, settings)
           VALUES ($1, $2, $3, $4, TRUE, TRUE, $5::jsonb)
           ON CONFLICT (website_id, slug) DO UPDATE
             SET name = EXCLUDED.name,
                 description = EXCLUDED.description,
                 is_enabled = TRUE,
                 is_active = TRUE,
                 settings = EXCLUDED.settings,
                 updated_at = NOW()`,
          [web.id, m.name, m.slug, m.description, JSON.stringify({ category: m.category })]
        );
        webCount++;
        totalInserted++;
      }

      summary.push({
        websiteId: web.id,
        name: web.name,
        subdomain: web.subdomain,
        modulesCount: webCount,
      });
    }

    await client.query('COMMIT');

    return {
      success: true,
      message: 'Website modules (storefront & control panel) seeded successfully',
      totalAvailableModules: ALL_TENANT_MODULES.length,
      websitesUpdated: targetWebsites.length,
      totalModulesSeeded: totalInserted,
      categories: {
        storefront: ALL_TENANT_MODULES.filter((m) => m.category === 'storefront').length,
        operations: ALL_TENANT_MODULES.filter((m) => m.category === 'operations').length,
        finance: ALL_TENANT_MODULES.filter((m) => m.category === 'finance').length,
        specialized: ALL_TENANT_MODULES.filter((m) => m.category === 'specialized').length,
      },
      websites: summary,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const website_id = searchParams.get('website_id');
    const domain = searchParams.get('domain');

    const result = await seedWebsiteModules({ website_id, domain });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed website-modules API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed website modules',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (_) {}

    const result = await seedWebsiteModules(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed website-modules POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed website modules',
      },
      { status: 500 }
    );
  }
}

