import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDbPool } from '@/lib/db/pg';

/**
 * /api/seed/tables
 * 
 * Applies the complete platform database schema:
 * 1. postgresql/schema.psql (56 platform tables)
 * 2. postgresql/website_tables.psql (339 website tenant tables)
 */
async function applyTables() {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    const cwd = process.cwd();
    const schemaFile = path.join(cwd, 'postgresql', 'schema.psql');
    const websiteFile = path.join(cwd, 'postgresql', 'website_tables.psql');

    if (!fs.existsSync(schemaFile)) {
      throw new Error(`schema.psql not found at ${schemaFile}`);
    }
    if (!fs.existsSync(websiteFile)) {
      throw new Error(`website_tables.psql not found at ${websiteFile}`);
    }

    // 1. Read files
    const schemaSql = fs.readFileSync(schemaFile, 'utf8');
    const websiteSql = fs.readFileSync(websiteFile, 'utf8');

    // 2. Apply platform schema (56 tables)
    await client.query(schemaSql);

    // 3. Apply website tenant schema (339 tables)
    await client.query(websiteSql);

    // 4. Query created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC;
    `);

    const allTables = res.rows.map((r) => r.table_name);
    const platformTables = allTables.filter((t) => !t.startsWith('website_'));
    const websiteTables = allTables.filter((t) => t.startsWith('website_'));

    return {
      success: true,
      message: 'All database tables created successfully',
      summary: {
        totalTables: allTables.length,
        platformTablesCount: platformTables.length,
        websiteTablesCount: websiteTables.length,
      },
      tables: {
        platform: platformTables,
        website: websiteTables,
      },
    };
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    const data = await applyTables();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Seed tables API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to apply database tables',
        hint: error.message?.includes('(ENOTFOUND) tenant/user')
          ? 'Supabase database project is paused. Unpause it in your Supabase dashboard or update .env credentials.'
          : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return await GET();
}

