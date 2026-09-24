import { queryDb } from '../src/lib/db/pg.js';

async function main() {
  try {
    console.log('Testing creators table operations...');
    
    // Test SELECT
    const selectRes = await queryDb('SELECT * FROM creators LIMIT 5;');
    console.log('SELECT succeeded. Rows count:', selectRes.rows.length);

    // Test UPDATE
    const updateRes = await queryDb(
      'UPDATE creators SET updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, updated_at;',
      [1]
    );
    console.log('UPDATE succeeded:', updateRes.rows[0]);

    // Test INSERT and ROLLBACK in a transaction
    await queryDb('BEGIN;');
    const insertRes = await queryDb(`
      INSERT INTO creators (name, email, password, phone, bio, is_active, is_verified)
      VALUES ($1, $2, $3, $4, $5, TRUE, FALSE)
      RETURNING id, name, email, phone, bio, is_active, is_verified, created_at;
    `, ['Test Creator', 'test_temp_check@test.com', 'password123', '+123456', 'Bio test']);
    console.log('INSERT succeeded, new creator ID:', insertRes.rows[0].id);
    await queryDb('ROLLBACK;');
    console.log('ROLLBACK succeeded. creators table is fully functional!');

  } catch (err) {
    console.error('Error in creators table operations:', err);
    await queryDb('ROLLBACK;').catch(() => {});
  } finally {
    process.exit(0);
  }
}

main();
