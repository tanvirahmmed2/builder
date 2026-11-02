import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryDb, getDbPool } from '@/lib/db/pg';

/**
 * /api/seed/developer
 * 
 * Seeds platform system roles, permissions, and creates the primary Super Admin developer.
 */

const DEFAULT_ROLES = [
  { name: 'Super Admin', slug: 'super-admin', description: 'Platform super administrator with unrestricted access', is_system: true },
  { name: 'Administrator', slug: 'admin', description: 'Platform operational administrator', is_system: true },
  { name: 'Developer', slug: 'developer', description: 'Platform software engineer and technical staff', is_system: true },
  { name: 'Manager', slug: 'manager', description: 'Account, customer and business operations manager', is_system: true },
  { name: 'Support', slug: 'support', description: 'Client helpdesk and technical support agent', is_system: true },
];

const DEFAULT_PERMISSIONS = [
  { folder: 'dashboard', slug: 'dashboard.view', name: 'View Dashboard Analytics' },
  { folder: 'dashboard', slug: 'dashboard.manage', name: 'Manage Dashboard Widgets' },
  { folder: 'developers', slug: 'developers.view', name: 'View Developers Directory' },
  { folder: 'developers', slug: 'developers.manage', name: 'Manage Developers & Roles' },
  { folder: 'creators', slug: 'creators.view', name: 'View Registered Creators' },
  { folder: 'creators', slug: 'creators.manage', name: 'Manage Creators & Status' },
  { folder: 'websites', slug: 'websites.view', name: 'View All Websites' },
  { folder: 'websites', slug: 'websites.manage', name: 'Provision & Edit Websites' },
  { folder: 'services', slug: 'services.view', name: 'View Platform Services' },
  { folder: 'services', slug: 'services.manage', name: 'Manage Platform Services' },
  { folder: 'packages', slug: 'packages.view', name: 'View Pricing Packages' },
  { folder: 'packages', slug: 'packages.manage', name: 'Manage Pricing Packages' },
  { folder: 'reviews', slug: 'reviews.view', name: 'View Platform Reviews' },
  { folder: 'reviews', slug: 'reviews.manage', name: 'Moderate Platform Reviews' },
  { folder: 'faqs', slug: 'faqs.view', name: 'View Platform FAQs' },
  { folder: 'faqs', slug: 'faqs.manage', name: 'Manage Platform FAQs' },
  { folder: 'updates', slug: 'updates.view', name: 'View Changelog Updates' },
  { folder: 'updates', slug: 'updates.manage', name: 'Publish Changelog Updates' },
  { folder: 'reports', slug: 'reports.view', name: 'View Audit & System Reports' },
  { folder: 'reports', slug: 'reports.manage', name: 'Resolve Incident Reports' },
  { folder: 'support', slug: 'support.view', name: 'View Support Tickets' },
  { folder: 'support', slug: 'support.manage', name: 'Respond to Support Tickets' },
  { folder: 'payrolls', slug: 'payrolls.view', name: 'View Developer Payrolls' },
  { folder: 'payrolls', slug: 'payrolls.manage', name: 'Process Payroll Payments' },
  { folder: 'tasks', slug: 'tasks.view', name: 'View Internal Tasks' },
  { folder: 'tasks', slug: 'tasks.manage', name: 'Create & Assign Tasks' },
  { folder: 'notices', slug: 'notices.view', name: 'View Company Notices' },
  { folder: 'notices', slug: 'notices.manage', name: 'Broadcast Company Notices' },
  { folder: 'careers', slug: 'careers.view', name: 'View Job Postings' },
  { folder: 'careers', slug: 'careers.manage', name: 'Manage Job Openings & Applicants' },
  { folder: 'settings', slug: 'settings.view', name: 'View System Settings' },
  { folder: 'settings', slug: 'settings.manage', name: 'Modify System Settings' },
];

async function seedDeveloper(params = {}) {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed System Roles
    const roleMap = new Map();
    for (const r of DEFAULT_ROLES) {
      const res = await client.query(
        `INSERT INTO roles (name, slug, description, is_system)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE 
           SET name = EXCLUDED.name, description = EXCLUDED.description, is_system = TRUE
         RETURNING id, slug`,
        [r.name, r.slug, r.description, r.is_system]
      );
      roleMap.set(res.rows[0].slug, res.rows[0].id);
    }

    const superAdminRoleId = roleMap.get('super-admin');

    // 2. Seed Permissions
    const permIds = [];
    for (const p of DEFAULT_PERMISSIONS) {
      const res = await client.query(
        `INSERT INTO permissions (name, slug, folder, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE 
           SET name = EXCLUDED.name, folder = EXCLUDED.folder
         RETURNING id`,
        [p.name, p.slug, p.folder, p.name]
      );
      permIds.push(res.rows[0].id);
    }

    // 3. Map all permissions to Super Admin role
    for (const permId of permIds) {
      await client.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         VALUES ($1, $2)
         ON CONFLICT (role_id, permission_id) DO NOTHING`,
        [superAdminRoleId, permId]
      );
    }

    // 4. Extract credentials with clean defaults
    const name = (params.name ? String(params.name).trim() : '') || 'Tanvir Ahmmed';
    const email = (params.email ? String(params.email).trim().toLowerCase() : '') || 'tanvir004006@gmail.com';
    const plainPassword = params.password ? String(params.password) : 'admin123456';

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 5. Insert or Update Primary Developer
    const existingDev = await client.query(
      `SELECT id, email, name, role_id, is_active, is_verified FROM developers WHERE LOWER(email) = $1 LIMIT 1`,
      [email]
    );

    let devRecord;
    let isCreated = false;

    if (existingDev.rows.length > 0) {
      devRecord = existingDev.rows[0];
      // Update role and verify existing developer
      const updateRes = await client.query(
        `UPDATE developers 
         SET role_id = $1, is_active = TRUE, is_verified = TRUE, updated_at = NOW()
         WHERE id = $2
         RETURNING id, name, email, role_id, is_active, is_verified`,
        [superAdminRoleId, devRecord.id]
      );
      devRecord = updateRes.rows[0];
    } else {
      const insertRes = await client.query(
        `INSERT INTO developers (name, email, password, role_id, is_active, is_verified)
         VALUES ($1, $2, $3, $4, TRUE, TRUE)
         RETURNING id, name, email, role_id, is_active, is_verified`,
        [name, email, hashedPassword, superAdminRoleId]
      );
      devRecord = insertRes.rows[0];
      isCreated = true;
    }

    // 6. Ensure mapping in developer_roles
    await client.query(
      `INSERT INTO developer_roles (developer_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT (developer_id, role_id) DO NOTHING`,
      [devRecord.id, superAdminRoleId]
    );

    await client.query('COMMIT');

    return {
      success: true,
      message: isCreated
        ? 'First developer account created successfully with Super Admin privileges'
        : 'Developer account already exists. Super Admin role and verified status refreshed',
      isCreated,
      developer: {
        id: devRecord.id,
        name: devRecord.name,
        email: devRecord.email,
        role: 'super-admin',
        isActive: devRecord.is_active,
        isVerified: devRecord.is_verified,
      },
      credentials: {
        email: devRecord.email,
        password: isCreated ? plainPassword : '(unchanged from existing record)',
        loginUrl: '/developer-auth/login',
      },
      rolesSeeded: roleMap.size,
      permissionsSeeded: permIds.length,
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
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const password = searchParams.get('password');

    const result = await seedDeveloper({ name, email, password });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed developer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed developer account',
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

    const result = await seedDeveloper(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed developer POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed developer account',
      },
      { status: 500 }
    );
  }
}

