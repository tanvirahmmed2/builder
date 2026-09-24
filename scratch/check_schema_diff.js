import { queryDb } from '../src/lib/db/pg.js';
import fs from 'fs';

async function main() {
  try {
    const schemaSql = fs.readFileSync('postgresql/schema.psql', 'utf8');
    
    // Parse each CREATE TABLE
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\n\);/gi;
    let match;
    const diffs = [];

    while ((match = tableRegex.exec(schemaSql)) !== null) {
      const tableName = match[1].toLowerCase();
      const body = match[2];
      
      // Parse columns (lines that don't start with CONSTRAINT, PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE, etc.)
      const lines = body.split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('--') && !l.startsWith('CONSTRAINT') && !l.startsWith('PRIMARY KEY') && !l.startsWith('FOREIGN KEY') && !l.startsWith('UNIQUE') && !l.startsWith('CHECK'));
      
      const schemaCols = lines.map(l => {
        const colMatch = l.match(/^([a-zA-Z0-9_]+)/);
        return colMatch ? colMatch[1].toLowerCase() : null;
      }).filter(Boolean);

      // Fetch actual columns from DB
      const dbColsRes = await queryDb(
        "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = 'public';",
        [tableName]
      );
      const dbCols = new Set(dbColsRes.rows.map(r => r.column_name.toLowerCase()));

      const missingInDb = schemaCols.filter(c => !dbCols.has(c));
      const extraInDb = [...dbCols].filter(c => !schemaCols.includes(c));

      if (missingInDb.length > 0 || extraInDb.length > 0) {
        diffs.push({
          tableName,
          missingInDb,
          extraInDb
        });
      }
    }

    console.log('Column differences between schema.psql and database:');
    for (const d of diffs) {
      console.log(`\nTable: ${d.tableName}`);
      if (d.missingInDb.length > 0) console.log('  Missing in DB:', d.missingInDb);
      if (d.extraInDb.length > 0) console.log('  Extra in DB:', d.extraInDb);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

main();
