import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db/pg';

/**
 * /api/seed/modules
 * 
 * Reads the developer panel structure and seeds all developer backoffice modules,
 * permissions, system roles, and role-permission mappings into PostgreSQL:
 * - `roles`
 * - `permissions`
 * - `role_permissions`
 */

export const DEVELOPER_PANEL_MODULES = [
  // 1. Workspace & Overview
  { slug: 'overview', name: 'Workspace Overview', folder: 'workspace', description: 'Platform KPIs, activity feed, and system metrics' },
  { slug: 'tasks', name: 'Tasks & Sprints', folder: 'workspace', description: 'Internal team task management and sprint boards' },
  { slug: 'notices', name: 'Company Notices', folder: 'workspace', description: 'Company-wide broadcasts and administrative announcements' },
  { slug: 'chats', name: 'Internal Chat', folder: 'workspace', description: 'Internal developer and team communication channels' },

  // 2. Websites & Audience
  { slug: 'websites', name: 'Websites Directory', folder: 'websites', description: 'Multi-type tenant website provisioning and domain status' },
  { slug: 'creators', name: 'Creators Directory', folder: 'creators', description: 'Registered platform creator accounts, KYC, and storage quotas' },
  { slug: 'users', name: 'End-Users Directory', folder: 'users', description: 'Storefront end-users and client customer database' },
  { slug: 'leads', name: 'Inbound Leads', folder: 'leads', description: 'Landing page lead capture and marketing inquiries' },
  { slug: 'subscribers', name: 'Subscribers Directory', folder: 'subscribers', description: 'Newsletter subscribers and email broadcast lists' },

  // 3. Commerce & Plans
  { slug: 'packages', name: 'Packages & Modules', folder: 'packages', description: 'SaaS pricing tiers, subscription packages, and module limits' },
  { slug: 'subscriptions', name: 'Subscriptions', folder: 'subscriptions', description: 'Active creator subscription cycles, renewals, and cancellations' },
  { slug: 'purchases', name: 'Purchases & Invoices', folder: 'purchases', description: 'Package purchases, invoice receipts, and creator billing history' },
  { slug: 'payments', name: 'Payment Transactions', folder: 'payments', description: 'Payment gateway audit trails, bKash, and cards settlement' },
  { slug: 'projects', name: 'Custom Projects', folder: 'projects', description: 'Bespoke client development contracts and milestones' },

  // 4. Content & Design
  { slug: 'themes', name: 'Themes Catalog', folder: 'themes', description: 'Official theme templates, presets, and color palettes' },
  { slug: 'blogs', name: 'Blogs & Articles', folder: 'blogs', description: 'Platform marketing blog articles, authors, and SEO' },
  { slug: 'policies', name: 'Company Policies', folder: 'policies', description: 'Terms of service, privacy policies, and compliance documents' },
  { slug: 'updates', name: 'Product Updates', folder: 'updates', description: 'Platform version changelog, release notes, and feature announcements' },
  { slug: 'tutorials', name: 'Video Tutorials', folder: 'tutorials', description: 'Creator onboarding video lessons and knowledge base' },
  { slug: 'faqs', name: 'FAQs Directory', folder: 'faqs', description: 'Platform frequently asked questions and help center' },

  // 5. Support & Communications
  { slug: 'support', name: 'Support Tickets', folder: 'support', description: 'Helpdesk tickets, priority escalations, and customer support' },
  { slug: 'live-chats', name: 'Live Chats', folder: 'live-chats', description: 'Real-time live chat widget conversations with visitors' },
  { slug: 'contacts', name: 'Contact Inquiries', folder: 'contacts', description: 'Contact page form submissions and correspondence' },
  { slug: 'reports', name: 'Audit & Abuse Reports', folder: 'reports', description: 'System incident logs, bug tickets, and abuse reports' },
  { slug: 'reviews', name: 'Platform Reviews', folder: 'reviews', description: 'Platform reviews, star ratings, and testimonials' },

  // 6. Meta Messaging Channels
  { slug: 'facebook-messages', name: 'Facebook Messages', folder: 'meta-channels', description: 'Meta Facebook Page Messenger integration inbox' },
  { slug: 'instagram-messages', name: 'Instagram Messages', folder: 'meta-channels', description: 'Meta Instagram Direct messaging inbox' },
  { slug: 'whatsapp-messages', name: 'WhatsApp Messages', folder: 'meta-channels', description: 'Meta WhatsApp Business API conversation thread' },

  // 7. Team & Organization
  { slug: 'developers', name: 'Developers Team', folder: 'team', description: 'Developer staff roster, accounts, and permission assignment' },
  { slug: 'roles', name: 'Roles & Permissions', folder: 'team', description: 'RBAC security roles, granular module permissions, and access policies' },
  { slug: 'payroll', name: 'Payroll & Salaries', folder: 'team', description: 'Developer payroll schedules, monthly salary batches, and slips' },
  { slug: 'my-salaries', name: 'My Salaries', folder: 'team', description: 'Personal salary vouchers, bonuses, and payment history' },
  { slug: 'careers', name: 'Careers & Applicants', folder: 'team', description: 'Job openings, candidate pipelines, and applicant CVs' },
  { slug: 'team', name: 'Team Directory', folder: 'team', description: 'Staff directory, departmental hierarchy, and team contacts' },

  // 8. Platform & Settings
  { slug: 'services', name: 'Services & Modules', folder: 'platform', description: 'Platform website services (ecommerce, restaurant, portfolio, org)' },
  { slug: 'spams', name: 'Spam Defense', folder: 'platform', description: 'Spam moderation rules, IP blocklists, and anti-fraud filters' },
  { slug: 'settings', name: 'System Settings', folder: 'platform', description: 'Platform brand configuration, SMTP, storage, and API secrets' },
  { slug: 'profile', name: 'My Profile', folder: 'platform', description: 'Personal developer account settings, 2FA, and password' },
];

// Role mapping matrix based on src/app/(developers)/developer/layout.jsx
export const ROLE_DEFINITIONS = [
  {
    slug: 'super-admin',
    name: 'Super Admin',
    description: 'Unrestricted master administrator with full privileges across all platform modules',
    is_system: true,
    modules: DEVELOPER_PANEL_MODULES.map((m) => m.slug),
  },
  {
    slug: 'admin',
    name: 'Administrator',
    description: 'Platform operational administrator with full management access',
    is_system: true,
    modules: [
      'overview', 'developers', 'roles', 'team', 'creators', 'users', 'websites',
      'blogs', 'themes', 'packages', 'purchases', 'payments', 'subscriptions', 'payroll', 'my-salaries',
      'live-chats', 'chats', 'contacts', 'support', 'projects', 'reports', 'reviews', 'spams',
      'facebook-messages', 'instagram-messages', 'whatsapp-messages',
      'leads', 'subscribers', 'services', 'profile', 'settings', 'faqs', 'updates', 'tasks', 'notices', 'tutorials', 'careers', 'policies'
    ],
  },
  {
    slug: 'manager',
    name: 'Manager',
    description: 'Business, creator accounts, and customer operations manager',
    is_system: true,
    modules: [
      'overview', 'creators', 'users', 'websites', 'packages',
      'purchases', 'payments', 'subscriptions', 'live-chats', 'chats', 'contacts', 'support', 'projects', 'my-salaries',
      'facebook-messages', 'instagram-messages', 'whatsapp-messages',
      'reports', 'reviews', 'leads', 'subscribers', 'services', 'profile', 'settings', 'faqs', 'updates', 'tasks', 'notices', 'tutorials', 'careers', 'policies'
    ],
  },
  {
    slug: 'developer',
    name: 'Developer',
    description: 'Platform software engineer and technical maintenance staff',
    is_system: true,
    modules: [
      'overview', 'websites', 'themes', 'packages',
      'services', 'spams', 'reports', 'blogs', 'support', 'projects', 'profile', 'settings', 'chats', 'tasks', 'notices', 'my-salaries', 'tutorials', 'faqs', 'updates', 'policies'
    ],
  },
  {
    slug: 'marketer',
    name: 'Marketer',
    description: 'Content marketer, SEO specialist, and campaigns coordinator',
    is_system: true,
    modules: [
      'overview', 'blogs', 'themes', 'leads',
      'packages', 'reviews', 'profile', 'settings', 'chats', 'tasks', 'notices', 'my-salaries', 'tutorials', 'faqs', 'updates', 'policies'
    ],
  },
  {
    slug: 'support',
    name: 'Support Agent',
    description: 'Customer helpdesk, live chat agent, and ticket resolver',
    is_system: true,
    modules: [
      'overview', 'live-chats', 'chats', 'contacts', 'support', 'reports',
      'facebook-messages', 'instagram-messages', 'whatsapp-messages',
      'reviews', 'users', 'creators', 'subscribers', 'profile', 'settings', 'tasks', 'notices', 'my-salaries', 'tutorials', 'faqs', 'updates', 'policies'
    ],
  },
];

async function seedDeveloperModules() {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed or update all developer panel permissions
    const permissionMap = new Map();

    for (const m of DEVELOPER_PANEL_MODULES) {
      // A. Base module slug (used by Sidebar and layout checks)
      const basePermRes = await client.query(
        `INSERT INTO permissions (name, slug, folder, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name, folder = EXCLUDED.folder, description = EXCLUDED.description, updated_at = NOW()
         RETURNING id, slug`,
        [m.name, m.slug, m.folder, m.description]
      );
      permissionMap.set(m.slug, basePermRes.rows[0].id);

      // B. View permission
      const viewPermRes = await client.query(
        `INSERT INTO permissions (name, slug, folder, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name, folder = EXCLUDED.folder, updated_at = NOW()
         RETURNING id, slug`,
        [`View ${m.name}`, `${m.slug}.view`, m.folder, `Can view ${m.name}`]
      );
      permissionMap.set(`${m.slug}.view`, viewPermRes.rows[0].id);

      // C. Manage permission
      const managePermRes = await client.query(
        `INSERT INTO permissions (name, slug, folder, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name, folder = EXCLUDED.folder, updated_at = NOW()
         RETURNING id, slug`,
        [`Manage ${m.name}`, `${m.slug}.manage`, m.folder, `Can create, edit, or delete in ${m.name}`]
      );
      permissionMap.set(`${m.slug}.manage`, managePermRes.rows[0].id);
    }

    // 2. Seed or update system roles
    const roleSummary = [];

    for (const r of ROLE_DEFINITIONS) {
      const roleRes = await client.query(
        `INSERT INTO roles (name, slug, description, is_system)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name, description = EXCLUDED.description, is_system = TRUE, updated_at = NOW()
         RETURNING id, slug, name`,
        [r.name, r.slug, r.description, r.is_system]
      );
      const roleId = roleRes.rows[0].id;

      // 3. Map permitted modules to this role in role_permissions
      let mappedCount = 0;
      for (const modSlug of r.modules) {
        const baseId = permissionMap.get(modSlug);
        const viewId = permissionMap.get(`${modSlug}.view`);
        const manageId = permissionMap.get(`${modSlug}.manage`);

        const idsToMap = [baseId, viewId, manageId].filter(Boolean);
        for (const pId of idsToMap) {
          await client.query(
            `INSERT INTO role_permissions (role_id, permission_id)
             VALUES ($1, $2)
             ON CONFLICT (role_id, permission_id) DO NOTHING`,
            [roleId, pId]
          );
          mappedCount++;
        }
      }

      roleSummary.push({
        roleId,
        slug: r.slug,
        name: r.name,
        modulesCount: r.modules.length,
        permissionsMapped: mappedCount,
      });
    }

    await client.query('COMMIT');

    return {
      success: true,
      message: 'Developer panel modules, permissions, and role mappings seeded successfully',
      modulesSeeded: DEVELOPER_PANEL_MODULES.length,
      totalPermissionsCreated: permissionMap.size,
      rolesConfigured: roleSummary.length,
      roles: roleSummary,
      modules: DEVELOPER_PANEL_MODULES.map((m) => ({
        slug: m.slug,
        name: m.name,
        folder: m.folder,
      })),
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    const data = await seedDeveloperModules();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Seed developer modules API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed developer modules',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return await GET();
}
