import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { isAdmin } from '@/lib/middleware/developer';

// Helper to convert table_name (e.g. 'website_products') to clean title (e.g. 'Products')
function formatTableToModuleTitle(tableName) {
  let clean = tableName;
  if (clean.startsWith('website_')) clean = clean.replace('website_', '');
  else if (clean.startsWith('tenant_')) clean = clean.replace('tenant_', '');

  // Special title overrides for pleasant readability
  const titleMap = {
    products: 'Products',
    orders: 'Orders & Payments',
    purchase: 'Orders & Purchases',
    purchase_payments: 'Purchase Payments',
    appointments: 'Appointments',
    blogs: 'Blog & Articles',
    contact: 'Contact Inquiries',
    services: 'Services',
    experiences: 'Experiences',
    gallery: 'Portfolio Gallery',
    offers: 'Offers & Discounts',
    support: 'Support Tickets',
    roles: 'Roles & Permissions',
    role_permissions: 'Role Permissions',
    users: 'Team & Users',
    user_roles: 'User Roles',
    settings: 'Settings & Domain',
    skills: 'Skills & Endorsements',
    testimonials: 'Testimonials & Reviews',
    categories: 'Content Categories',
    permissions: 'System Permissions',
    modules: 'Website Modules',
    apps: 'Ecosystem Apps',
    payrolls: 'Developer Payrolls',
    notices: 'Notices Board',
    tasks: 'Sprint Tasks',
    tutorials: 'Video Tutorials',
  };

  if (titleMap[clean]) return titleMap[clean];

  return clean
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function GET(request) {
  try {
    // Strictly Admin only
    const auth = await isAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message || 'Forbidden: Only Admin role can view database modules.' },
        { status: auth.status || 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'website'; // 'website', 'all', 'platform'
    const inspectTable = searchParams.get('table');

    // If inspecting a specific table's schema
    if (inspectTable) {
      const colRes = await queryDb(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position ASC`,
        [inspectTable]
      );
      return NextResponse.json({
        success: true,
        table_name: inspectTable,
        columns: colRes.rows,
      });
    }

    // Query database tables, column counts, and estimated row counts using SQL
    const tablesRes = await queryDb(
      `SELECT 
         t.table_name,
         COALESCE(col.column_count, 0)::int AS columns_count,
         COALESCE(GREATEST(0, pg_class.reltuples::bigint), 0)::int AS estimated_rows
       FROM information_schema.tables t
       LEFT JOIN (
         SELECT table_name, COUNT(*) AS column_count
         FROM information_schema.columns
         WHERE table_schema = 'public'
         GROUP BY table_name
       ) col ON col.table_name = t.table_name
       LEFT JOIN pg_class ON pg_class.relname = t.table_name
       WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
       ORDER BY t.table_name ASC`
    );

    const allTables = tablesRes.rows || [];

    // Map each database table into a module descriptor
    const modules = allTables.map((t) => {
      const isWebsiteModule = t.table_name.startsWith('website_');
      const isTenantModule = t.table_name.startsWith('tenant_');
      const isChildOrRelation =
        t.table_name.includes('_images') ||
        t.table_name.includes('_messages') ||
        t.table_name.includes('_permissions') ||
        t.table_name.includes('_roles') ||
        t.table_name.includes('_payments');

      let category = 'platform';
      if (isWebsiteModule) category = 'website';
      else if (isTenantModule) category = 'tenant';

      return {
        table_name: t.table_name,
        module_title: formatTableToModuleTitle(t.table_name),
        columns_count: t.columns_count,
        estimated_rows: t.estimated_rows,
        category,
        is_website_module: isWebsiteModule,
        is_child_table: isChildOrRelation,
        is_primary_module: isWebsiteModule && !isChildOrRelation && t.table_name !== 'website_modules',
      };
    });

    // Extract selectable modules for packages from website primary modules
    const selectableModules = modules
      .filter((m) => m.is_website_module && !m.is_child_table && m.table_name !== 'website_modules')
      .map((m) => m.module_title);

    // Apply query filter if requested
    let filteredModules = modules;
    if (filter === 'website') {
      filteredModules = modules.filter((m) => m.category === 'website');
    } else if (filter === 'tenant') {
      filteredModules = modules.filter((m) => m.category === 'tenant');
    } else if (filter === 'platform') {
      filteredModules = modules.filter((m) => m.category === 'platform');
    }

    return NextResponse.json({
      success: true,
      total_tables: allTables.length,
      filter,
      modules: filteredModules,
      available_modules: selectableModules,
    });
  } catch (error) {
    console.error('Error querying database modules:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
