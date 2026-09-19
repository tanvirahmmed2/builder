import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET() {
  try {
    const res = await queryDb('SELECT id, title, description, slug, created_at FROM updates ORDER BY created_at DESC');
    return NextResponse.json({ success: true, updates: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
