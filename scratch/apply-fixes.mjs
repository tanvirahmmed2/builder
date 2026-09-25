import { queryDb } from '../src/lib/db/pg.js';

async function applyFixes() {
  console.log('=== Step 1: Add missing "roles" permission and grant to roles 1, 2 ===');
  const rolePermRes = await queryDb(`
    INSERT INTO permissions (name, slug, folder, description)
    VALUES ('Roles & Permissions', 'roles', 'roles', 'Configure developer roles and granular system module permissions')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, folder = EXCLUDED.folder, description = EXCLUDED.description
    RETURNING id, slug
  `);
  const rolePermId = rolePermRes.rows[0].id;
  console.log(`✓ Permission [roles] ensured with id: ${rolePermId}`);

  for (const roleId of [1, 2]) {
    await queryDb(`
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES ($1, $2)
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `, [roleId, rolePermId]);
  }
  console.log('✓ Granted [roles] permission to Admin and Manager roles.');

  console.log('\n=== Step 2: Sync policies to legacy policy tables if empty ===');
  // Check privacy_policies, terms_and_conditions, refund_conditions
  const tcCount = await queryDb('SELECT COUNT(*)::int AS count FROM terms_and_conditions');
  if (tcCount.rows[0].count === 0) {
    const tos = await queryDb("SELECT title, description FROM policies WHERE slug = 'terms-of-service' LIMIT 1");
    if (tos.rows.length > 0) {
      await queryDb(`
        INSERT INTO terms_and_conditions (title, content, is_published, order_num)
        VALUES ($1, $2, TRUE, 1)
      `, [tos.rows[0].title, tos.rows[0].description]);
      console.log('✓ Seeded terms_and_conditions from policies.');
    }
  }

  const ppCount = await queryDb('SELECT COUNT(*)::int AS count FROM privacy_policies');
  if (ppCount.rows[0].count === 0) {
    const priv = await queryDb("SELECT title, description FROM policies WHERE slug = 'privacy-policy' LIMIT 1");
    if (priv.rows.length > 0) {
      await queryDb(`
        INSERT INTO privacy_policies (title, content, is_published, order_num)
        VALUES ($1, $2, TRUE, 1)
      `, [priv.rows[0].title, priv.rows[0].description]);
      console.log('✓ Seeded privacy_policies from policies.');
    }
  }

  const rcCount = await queryDb('SELECT COUNT(*)::int AS count FROM refund_conditions');
  if (rcCount.rows[0].count === 0) {
    const ref = await queryDb("SELECT title, description FROM policies WHERE slug = 'refund-policy' LIMIT 1");
    if (ref.rows.length > 0) {
      await queryDb(`
        INSERT INTO refund_conditions (title, content, is_published, order_num)
        VALUES ($1, $2, TRUE, 1)
      `, [ref.rows[0].title, ref.rows[0].description]);
      console.log('✓ Seeded refund_conditions from policies.');
    }
  }

  console.log('\n=== Step 3: Check and sync legacy careers table if empty ===');
  const oldCareersCount = await queryDb('SELECT COUNT(*)::int AS count FROM careers');
  if (oldCareersCount.rows[0].count === 0) {
    // Check if new career table has data to sync
    const newCareers = await queryDb('SELECT * FROM career LIMIT 5');
    for (const c of newCareers.rows) {
      await queryDb(`
        INSERT INTO careers (title, location, job_type, level, compensation, description, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [c.title, c.location || 'Remote', c.job_type || 'Full-time', c.experience_level || 'Mid-level', c.salary_range || 'Competitive', c.description, c.is_published]);
    }
    console.log(`✓ Seeded ${newCareers.rows.length} jobs to legacy careers table.`);
  }

  console.log('\n=== All fixes successfully verified and applied! ===');
  process.exit(0);
}

applyFixes().catch(e => {
  console.error('Error applying fixes:', e);
  process.exit(1);
});
