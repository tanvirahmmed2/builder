import fs from 'fs';
import { queryDb } from '../src/lib/db/pg.js';

async function testStatements() {
  const schemaSql = fs.readFileSync('./postgresql/schema.psql', 'utf8');
  
  // Split into statements
  // We can split on semicolon followed by newline
  const statements = schemaSql
    .split(/;\s*[\r\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Total statements: ${statements.length}`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await queryDb(stmt);
    } catch (err) {
      console.error(`\nFAILED STATEMENT #${i + 1}:`);
      console.error(stmt);
      console.error('ERROR:', err.message);
      process.exit(1);
    }
  }

  console.log('✓ All statements in schema.psql passed!');
  process.exit(0);
}

testStatements().catch(e => {
  console.error(e);
  process.exit(1);
});
