/**
 * seed-tenant-template.mjs
 * 
 * Automatically provisions realistic starter data for a newly created tenant
 * based on its website type (portfolio, ecommerce, restaurant_pos, organization).
 * 
 * Usage:
 *   node my-skill/scripts/seed-tenant-template.mjs --tenantId="<uuid>" --type="restaurant_pos"
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/portfoliobuilder',
});

async function seedTenant(tenantId, siteType) {
  console.log(`🌱 Seeding starter template for tenant ${tenantId} (${siteType})...`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Seed Main Branch
    const branchRes = await client.query(
      `INSERT INTO tenant_branches (tenant_id, name, address, city, is_main_branch)
       VALUES ($1, 'Main Location', '100 Innovation Ave', 'San Francisco', true)
       RETURNING id`,
      [tenantId]
    );
    const branchId = branchRes.rows[0].id;

    // 2. Conditional Seeding based on site_type
    if (siteType === 'portfolio' || siteType === 'enterprise_all') {
      console.log('   🎨 Seeding Portfolio projects & services...');
      const catRes = await client.query(
        `INSERT INTO portfolio_categories (tenant_id, name, slug)
         VALUES ($1, 'Web Applications', 'web-apps')
         RETURNING id`,
        [tenantId]
      );
      const catId = catRes.rows[0].id;

      await client.query(
        `INSERT INTO portfolio_projects (tenant_id, category_id, title, slug, summary, content_html, is_featured, order_index)
         VALUES 
         ($1, $2, 'NextGen Fintech Dashboard', 'nextgen-fintech-dashboard', 'Real-time financial analytics portal with automated trading algorithms.', '<p>Built with Next.js, WebSockets, and Tailwind CSS.</p>', true, 1),
         ($1, $2, 'HyperCommerce Multi-Vendor App', 'hypercommerce-app', 'Scalable e-commerce platform processing over 100k daily orders.', '<p>Architected for ultra-low latency checkout.</p>', true, 2)`,
        [tenantId, catId]
      );

      await client.query(
        `INSERT INTO portfolio_services (tenant_id, title, description, price_starting, icon_name, order_index)
         VALUES 
         ($1, 'Full-Stack Web Development', 'End-to-end web application architecture and development.', 2500.00, 'Code', 1),
         ($1, 'Cloud Architecture & DevOps', 'High-availability infrastructure setup on AWS and Kubernetes.', 1800.00, 'Cloud', 2)`,
        [tenantId]
      );
    }

    if (siteType === 'ecommerce' || siteType === 'enterprise_all') {
      console.log('   🛍️ Seeding E-Commerce catalog & variants...');
      const catRes = await client.query(
        `INSERT INTO ecommerce_categories (tenant_id, name, slug)
         VALUES ($1, 'Apparel & Accessories', 'apparel')
         RETURNING id`,
        [tenantId]
      );
      const catId = catRes.rows[0].id;

      const prodRes = await client.query(
        `INSERT INTO ecommerce_products (tenant_id, category_id, title, slug, base_price, sku, has_variants)
         VALUES ($1, $2, 'Minimalist Organic Cotton Hoodie', 'minimalist-organic-hoodie', 65.00, 'HOODIE-01', true)
         RETURNING id`,
        [tenantId, catId]
      );
      const prodId = prodRes.rows[0].id;

      const varRes = await client.query(
        `INSERT INTO product_variants (tenant_id, product_id, title, sku, price, attributes)
         VALUES 
         ($1, $2, 'Black / L', 'HOODIE-BLK-L', 65.00, '{"color": "Black", "size": "L"}'::jsonb),
         ($1, $2, 'Heather Grey / M', 'HOODIE-GRY-M', 65.00, '{"color": "Grey", "size": "M"}'::jsonb)
         RETURNING id`,
        [tenantId, prodId]
      );

      // Seed inventory for branch
      for (const variant of varRes.rows) {
        await client.query(
          `INSERT INTO inventory_stock (tenant_id, variant_id, branch_id, quantity_on_hand, low_stock_threshold)
           VALUES ($1, $2, $3, 50, 10)`,
          [tenantId, variant.id, branchId]
        );
      }
    }

    if (siteType === 'restaurant_pos' || siteType === 'enterprise_all') {
      console.log('   🍔 Seeding Restaurant menu, tables & modifiers...');
      const catRes = await client.query(
        `INSERT INTO restaurant_categories (tenant_id, name, slug, order_index)
         VALUES ($1, 'Artisan Burgers', 'burgers', 1)
         RETURNING id`,
        [tenantId]
      );
      const catId = catRes.rows[0].id;

      const itemRes = await client.query(
        `INSERT INTO restaurant_menu_items (tenant_id, category_id, name, description, base_price, dietary_flags, prep_time_minutes)
         VALUES ($1, $2, 'Truffle Wagyu Burger', 'Brioche bun, aged cheddar, truffle aioli, caramelized onions.', 16.50, '["halal"]'::jsonb, 12)
         RETURNING id`,
        [tenantId, catId]
      );
      const itemId = itemRes.rows[0].id;

      const groupRes = await client.query(
        `INSERT INTO modifier_groups (tenant_id, menu_item_id, name, min_selection, max_selection, is_required)
         VALUES ($1, $2, 'Extra Toppings', 0, 3, false)
         RETURNING id`,
        [tenantId, itemId]
      );
      const groupId = groupRes.rows[0].id;

      await client.query(
        `INSERT INTO modifier_options (tenant_id, group_id, name, extra_price)
         VALUES 
         ($1, $2, 'Crispy Bacon', 2.50),
         ($1, $2, 'Double Swiss Cheese', 1.50),
         ($1, $2, 'Avocado Slices', 2.00)`,
        [tenantId, groupId]
      );

      // Seed Restaurant Tables
      await client.query(
        `INSERT INTO restaurant_tables (tenant_id, branch_id, table_number, zone_name, capacity)
         VALUES 
         ($1, $2, 'T-01', 'Indoor Dining', 2),
         ($1, $2, 'T-02', 'Indoor Dining', 4),
         ($1, $2, 'T-03', 'Patio Terrace', 6)`,
        [tenantId, branchId]
      );
    }

    if (siteType === 'organization' || siteType === 'enterprise_all') {
      console.log('   🏢 Seeding Organization structure & team members...');
      const deptRes = await client.query(
        `INSERT INTO org_departments (tenant_id, name, description)
         VALUES ($1, 'Product Engineering', 'Core platform development and DevOps.')
         RETURNING id`,
        [tenantId]
      );
      const deptId = deptRes.rows[0].id;

      await client.query(
        `INSERT INTO org_members (tenant_id, department_id, name, designation, email, order_index)
         VALUES 
         ($1, $2, 'Sarah Chen', 'VP of Engineering', 'sarah@example.com', 1),
         ($1, $2, 'Marcus Vance', 'Lead Full-Stack Architect', 'marcus@example.com', 2)`,
        [tenantId, deptId]
      );

      await client.query(
        `INSERT INTO org_jobs (tenant_id, department_id, title, slug, employment_type, location, salary_range, description_html)
         VALUES ($1, $2, 'Senior Next.js Engineer', 'senior-nextjs-engineer', 'full_time', 'Remote / Worldwide', '$120,000 - $160,000', '<p>Looking for a seasoned Next.js and PostgreSQL engineer to scale our platform.</p>')`,
        [tenantId, deptId]
      );
    }

    await client.query('COMMIT');
    console.log(`✅ Successfully seeded starter template for tenant ${tenantId}!`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to seed tenant:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Parse arguments
const args = process.argv.slice(2);
let tenantId = '00000000-0000-0000-0000-000000000001';
let siteType = 'restaurant_pos';

for (const arg of args) {
  if (arg.startsWith('--tenantId=')) tenantId = arg.split('=')[1];
  if (arg.startsWith('--type=')) siteType = arg.split('=')[1];
}

seedTenant(tenantId, siteType);
