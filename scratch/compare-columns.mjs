import fs from 'fs';
import { queryDb } from '../src/lib/db/pg.js';

async function checkAllColumns() {
  const schemaSql = fs.readFileSync('./postgresql/schema.psql', 'utf8');

  // Let's get all tables and their columns from PostgreSQL
  const dbColsRes = await queryDb(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `);

  const dbColsByTable = {};
  for (const row of dbColsRes.rows) {
    if (!dbColsByTable[row.table_name]) dbColsByTable[row.table_name] = new Set();
    dbColsByTable[row.table_name].add(row.column_name);
  }

  // Find all CREATE INDEX IF NOT EXISTS ... ON table (column);
  const indexRegex = /CREATE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/gi;
  let match;
  const missingColumnsInIndices = [];

  while ((match = indexRegex.exec(schemaSql)) !== null) {
    const indexName = match[1];
    const tableName = match[2].toLowerCase();
    const colsStr = match[3];

    // colsStr might be: "creator_id", or "is_published, created_at DESC"
    const cols = colsStr.split(',').map(c => c.trim().split(/\s+/)[0].replace(/["']/g, '').toLowerCase());

    const tableCols = dbColsByTable[tableName];
    if (!tableCols) {
      console.log(`Table ${tableName} for index ${indexName} does not exist in DB!`);
      continue;
    }

    for (const col of cols) {
      // skip expressions
      if (col.includes('(') || col.includes(')')) continue;
      if (!tableCols.has(col)) {
        missingColumnsInIndices.push({
          indexName,
          tableName,
          missingColumn: col,
          availableColumns: [...tableCols]
        });
      }
    }
  }

  console.log('=== Missing columns in indexes ===');
  console.log(JSON.stringify(missingColumnsInIndices, null, 2));

  // Also check foreign keys and CREATE TABLE columns in schema.psql vs DB
  // Let's find CREATE TABLE <table_name> ( ... )
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
  const missingTableCols = [];

  while ((match = createTableRegex.exec(schemaSql)) !== null) {
    const tableName = match[1].toLowerCase();
    const body = match[2];
    const dbCols = dbColsByTable[tableName];
    if (!dbCols) continue;

    // Parse column names (first word of line that is not CONSTRAINT, PRIMARY, FOREIGN, UNIQUE, CHECK)
    const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));
    for (const line of lines) {
      const firstWord = line.split(/\s+/)[0].toLowerCase();
      if (['constraint', 'primary', 'foreign', 'unique', 'check'].includes(firstWord)) continue;
      if (/^[a-zA-Z0-9_]+$/.test(firstWord)) {
        if (!dbCols.has(firstWord)) {
          missingTableCols.push({
            tableName,
            missingColumn: firstWord,
            line
          });
        }
      }
    }
  }

  console.log('\n=== Missing columns defined in schema.psql but not in live DB table ===');
  console.log(JSON.stringify(missingTableCols, null, 2));

  process.exit(0);
}

checkAllColumns().catch(e => {
  console.error(e);
  process.exit(1);
});
