import { NextResponse } from 'next/server';
import { authenticateStaff, isManagerOrAdmin } from '@/lib/middleware/developer';
import { queryDb } from '@/lib/db/pg';

// ============================================================================
// GET: List all notices (All developers)
// ============================================================================
export async function GET(request) {
  try {
    const auth = await authenticateStaff(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const noticesRes = await queryDb(`
      SELECT 
        n.*,
        d.name AS creator_name,
        d.email AS creator_email,
        d.role AS creator_role
      FROM notices n
      LEFT JOIN developers d ON n.created_by_developer_id = d.id
      ORDER BY n.is_pinned DESC, n.created_at DESC
    `);

    const userRole = (auth.staff.role || '').toLowerCase();
    const canManage = userRole === 'admin' || userRole === 'manager';

    return NextResponse.json({
      success: true,
      notices: noticesRes.rows,
      canManage,
    });
  } catch (error) {
    console.error('Notices GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ============================================================================
// POST: Create notice (Manager or Admin ONLY)
// ============================================================================
export async function POST(request) {
  try {
    const auth = await isManagerOrAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message || 'Forbidden: Only managers and admins can create notices.' },
        { status: auth.status || 403 }
      );
    }

    const body = await request.json();
    const { title, content, priority = 'NORMAL', category = 'GENERAL', is_pinned = false, target_role = 'ALL', expires_at } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Notice title and content are required.' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO notices (title, content, priority, category, is_pinned, target_role, created_by_developer_id, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title.trim(),
        content.trim(),
        priority,
        category,
        Boolean(is_pinned),
        target_role || 'ALL',
        auth.staff.id,
        expires_at ? new Date(expires_at) : null,
      ]
    );

    return NextResponse.json({
      success: true,
      notice: res.rows[0],
      message: 'Notice posted successfully.',
    });
  } catch (error) {
    console.error('Notices POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
