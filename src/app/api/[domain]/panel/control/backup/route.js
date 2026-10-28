import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const [
      branchesRes,
      categoriesRes,
      brandsRes,
      productsRes,
      suppliersRes,
      customersRes,
      salesRes,
      expensesRes
    ] = await Promise.all([
      queryDb('SELECT * FROM website_branches WHERE website_id = $1', [website.id]),
      queryDb('SELECT * FROM website_categories WHERE website_id = $1', [website.id]),
      queryDb('SELECT * FROM website_brands WHERE website_id = $1', [website.id]),
      queryDb('SELECT * FROM website_products WHERE website_id = $1', [website.id]),
      queryDb('SELECT * FROM website_suppliers WHERE website_id = $1', [website.id]),
      queryDb('SELECT * FROM website_customers WHERE website_id = $1', [website.id]),
      queryDb('SELECT * FROM website_sales WHERE website_id = $1', [website.id]),
      queryDb('SELECT * FROM website_expenses WHERE website_id = $1', [website.id]),
    ]);

    let dump = `-- ====================================================================\n`;
    dump += `-- BACKUP FOR STORE: ${website.name || website.subdomain} (Website ID: ${website.id})\n`;
    dump += `-- GENERATED AT: ${new Date().toISOString()}\n`;
    dump += `-- ====================================================================\n\n`;

    const tables = [
      { name: 'website_branches', rows: branchesRes.rows },
      { name: 'website_categories', rows: categoriesRes.rows },
      { name: 'website_brands', rows: brandsRes.rows },
      { name: 'website_products', rows: productsRes.rows },
      { name: 'website_suppliers', rows: suppliersRes.rows },
      { name: 'website_customers', rows: customersRes.rows },
      { name: 'website_sales', rows: salesRes.rows },
      { name: 'website_expenses', rows: expensesRes.rows },
    ];

    for (const t of tables) {
      dump += `-- Table: ${t.name} (${t.rows.length} records)\n`;
      if (t.rows.length > 0) {
        for (const row of t.rows) {
          const keys = Object.keys(row);
          const cols = keys.join(', ');
          const vals = keys.map(k => {
            const val = row[k];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number' || typeof val === 'boolean') return val;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          dump += `INSERT INTO ${t.name} (${cols}) VALUES (${vals});\n`;
        }
      }
      dump += `\n`;
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'DATABASE_BACKUP_DOWNLOADED',
      details: `Generated and downloaded database SQL backup`,
      req: request
    });

    return new Response(dump, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql; charset=utf-8',
        'Content-Disposition': `attachment; filename="pos_backup_${website.subdomain || website.id}_${Date.now()}.sql"`
      }
    });

  } catch (error) {
    console.error('Backup GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
