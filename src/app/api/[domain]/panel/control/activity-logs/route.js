import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'activity';
    const branchId = searchParams.get('branch_id');
    const search = searchParams.get('search');

    let sql = `
      SELECT l.id, l.id AS log_id, l.website_id, l.user_id, l.user_name,
              l.branch_id, l.type, l.action, l.details, l.ip_address, l.user_agent, l.created_at,
              b.name AS branch_name
       FROM website_activity_logs l
       LEFT JOIN website_branches b ON b.id = l.branch_id
       WHERE l.website_id = $1
    `;
    const params = [website.id];
    let pIdx = 2;

    if (type && type !== 'all') {
      sql += ` AND l.type = $${pIdx}`;
      params.push(type.toLowerCase());
      pIdx++;
    }

    if (branchId && branchId !== 'all') {
      sql += ` AND l.branch_id = $${pIdx}`;
      params.push(Number(branchId));
      pIdx++;
    }

    if (search && search.trim()) {
      sql += ` AND (LOWER(COALESCE(l.user_name, '')) LIKE $${pIdx} OR LOWER(l.action) LIKE $${pIdx} OR LOWER(COALESCE(l.details, '')) LIKE $${pIdx})`;
      params.push(`%${search.trim().toLowerCase()}%`);
      pIdx++;
    }

    sql += ` ORDER BY l.id DESC LIMIT 100`;

    const res = await queryDb(sql, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Activity logs GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
