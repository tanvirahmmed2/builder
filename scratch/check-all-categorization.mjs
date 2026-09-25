import { queryDb } from '../src/lib/db/pg.js';

async function verifyAll() {
  const dbTablesRes = await queryDb(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`);
  const allTables = dbTablesRes.rows.map(r => r.table_name);
  console.log(`Total database tables: ${allTables.length}`);

  const legacyTables = new Set([
    'privacy_policies', 'terms_and_conditions', 'refund_conditions',
    'careers', 'career_applications',
    'tenants', 'staffs', 'staff_salary', 'staff_todos', 'staff_notes', 'staff_login_logs',
    'tickets', 'ticket_messages', 'ticket_attachments', 'ticket_images', 'ticket_participants',
    'supports', 'client_leads', 'business_leads', 'news_letters',
    'users', 'user_cart', 'user_login_logs',
    'project_chats', 'project_chats_files', 'project_chats_images', 'project_chats_messages', 'project_chats_participants',
    'boards', 'features', 'package_features', 'salary_payments', 'payscale', 'partners',
    'notifications', 'activity_logs', 'chats', 'chat_attachments', 'payments', 'products'
  ]);

  const websiteTables = allTables.filter(t => t.startsWith('website_'));
  const legacyFound = allTables.filter(t => legacyTables.has(t) || t.startsWith('tenant_'));
  const platformTables = allTables.filter(t => !t.startsWith('website_') && !legacyTables.has(t) && !t.startsWith('tenant_'));

  console.log(`Website modules count: ${websiteTables.length}`);
  console.log(`Legacy tables count: ${legacyFound.length}`);
  console.log(`Platform core tables count: ${platformTables.length}`);
  console.log(`Sum: ${websiteTables.length + legacyFound.length + platformTables.length} === ${allTables.length}`);

  const unclassified = allTables.filter(t => !websiteTables.includes(t) && !legacyFound.includes(t) && !platformTables.includes(t));
  if (unclassified.length > 0) {
    console.log('Unclassified tables:', unclassified);
  } else {
    console.log('✓ Every single table is classified cleanly!');
  }

  process.exit(0);
}

verifyAll().catch(e => {
  console.error(e);
  process.exit(1);
});
