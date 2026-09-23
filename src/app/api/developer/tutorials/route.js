import { NextResponse } from 'next/server';
import { hasModulePermission } from '@/lib/middleware/developer';
import { queryDb } from '@/lib/db/pg';

// ============================================================================
// GET: List all tutorials in developer panel
// ============================================================================
export async function GET(request) {
  try {
    const auth = await hasModulePermission(request, 'tutorials');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message || 'Unauthorized' }, { status: auth.status || 401 });
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

    const perms = Array.isArray(auth.staff.permissions) ? auth.staff.permissions : [];
    const canManage = perms.includes('tutorials');

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
// POST: Create tutorial
// ============================================================================
export async function POST(request) {
  try {
    const auth = await hasModulePermission(request, 'tutorials');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message || 'Forbidden: Permission tutorials required to create tutorials.' },
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
