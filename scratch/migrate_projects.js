import { queryDb } from '../src/lib/db/pg.js';

async function main() {
  try {
    console.log('--- 1. Creating table: project ---');
    await queryDb(`
      CREATE TABLE IF NOT EXISTS project (
          id SERIAL PRIMARY KEY,
          project_number VARCHAR(100) UNIQUE NOT NULL,
          creator_id INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(100) NOT NULL DEFAULT 'CUSTOM_WEBSITE',
          budget_in_cents INTEGER NOT NULL DEFAULT 0,
          paid_amount_in_cents INTEGER NOT NULL DEFAULT 0,
          currency VARCHAR(10) NOT NULL DEFAULT 'USD',
          payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_QUOTE',
          working_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
          priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
          deadline TIMESTAMPTZ,
          assigned_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
          deliverable_url TEXT,
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table project created or verified.');

    console.log('\n--- 2. Creating indexes and trigger for project ---');
    await queryDb('CREATE INDEX IF NOT EXISTS idx_project_creator ON project (creator_id);');
    await queryDb('CREATE INDEX IF NOT EXISTS idx_project_status ON project (working_status, payment_status);');
    await queryDb('CREATE INDEX IF NOT EXISTS idx_project_assigned_dev ON project (assigned_developer_id);');

    await queryDb('DROP TRIGGER IF EXISTS trg_project_updated_at ON project;');
    await queryDb(`
      CREATE TRIGGER trg_project_updated_at
      BEFORE UPDATE ON project
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);
    console.log('Project indexes and trigger verified.');

    console.log('\n--- 3. Creating table: project_messages ---');
    await queryDb(`
      CREATE TABLE IF NOT EXISTS project_messages (
          id SERIAL PRIMARY KEY,
          project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
          sender_type VARCHAR(20) NOT NULL,
          sender_id INTEGER,
          sender_name VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await queryDb('CREATE INDEX IF NOT EXISTS idx_project_messages_proj ON project_messages (project_id, created_at ASC);');
    console.log('Table project_messages created.');

    console.log('\n--- 4. Creating table: project_images ---');
    await queryDb(`
      CREATE TABLE IF NOT EXISTS project_images (
          id SERIAL PRIMARY KEY,
          project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
          message_id INTEGER REFERENCES project_messages(id) ON DELETE SET NULL,
          image_url TEXT NOT NULL,
          file_name VARCHAR(255),
          file_size INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await queryDb('CREATE INDEX IF NOT EXISTS idx_project_images_proj ON project_images (project_id);');
    console.log('Table project_images created.');

    console.log('\n--- 5. Creating view: projects (alias to project) ---');
    await queryDb('CREATE OR REPLACE VIEW projects AS SELECT * FROM project;');
    console.log('View projects created.');

    console.log('\n--- 6. Registering permission: projects ---');
    const permRes = await queryDb(`
      INSERT INTO permissions (name, slug, folder, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name,
          folder = EXCLUDED.folder,
          description = EXCLUDED.description
      RETURNING id, name, slug;
    `, [
      'Custom Projects',
      'projects',
      'projects',
      'Manage creator custom projects, project quotes, working progress, and discussions'
    ]);
    const permId = permRes.rows[0].id;
    console.log('Permission registered, ID:', permId);

    console.log('\n--- 7. Granting permission to roles (admin, manager, developer) ---');
    const rolesRes = await queryDb("SELECT id, slug FROM roles WHERE slug IN ('admin', 'manager', 'developer');");
    for (const r of rolesRes.rows) {
      await queryDb(`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
      `, [r.id, permId]);
      console.log(`Granted 'projects' to role: ${r.slug} (ID: ${r.id})`);
    }

    console.log('\nAll project migrations and permissions successfully applied!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
