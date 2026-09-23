import { NextResponse } from 'next/server';
import { authenticateStaff, isManagerOrAdmin } from '@/lib/middleware/developer';
import { queryDb } from '@/lib/db/pg';

// ============================================================================
// GET: List all tutorials in developer panel
// ============================================================================
export async function GET(request) {
  try {
    const auth = await authenticateStaff(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const res = await queryDb(`
      SELECT 
        t.*,
        d.name AS creator_name,
        d.email AS creator_email,
        COALESCE(dr.slug, 'developer') AS creator_role
      FROM tutorials t
      LEFT JOIN developers d ON t.created_by_developer_id = d.id
      LEFT JOIN roles dr ON d.role_id = dr.id
      ORDER BY t.created_at DESC
    `);

    const userRole = (auth.staff.role || '').toLowerCase();
    const canManage = userRole === 'admin' || userRole === 'manager';

    return NextResponse.json({
      success: true,
      tutorials: res.rows,
      canManage,
    });
  } catch (error) {
    console.error('Developer tutorials GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ============================================================================
// POST: Create tutorial (Admin & Manager ONLY)
// ============================================================================
export async function POST(request) {
  try {
    const auth = await isManagerOrAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message || 'Forbidden: Only managers and admins can create tutorials.' },
        { status: auth.status || 403 }
      );
    }

    const body = await request.json();
    const { title, description, youtube_link } = body;

    if (!title || !youtube_link) {
      return NextResponse.json(
        { success: false, error: 'Tutorial title and YouTube link are required.' },
        { status: 400 }
      );
    }

    const res = await queryDb(
      `INSERT INTO tutorials (title, description, youtube_link, created_by_developer_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title.trim(), description ? description.trim() : null, youtube_link.trim(), auth.staff.id]
    );

    return NextResponse.json({
      success: true,
      tutorial: res.rows[0],
      message: 'Tutorial created successfully.',
    });
  } catch (error) {
    console.error('Developer tutorial POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
