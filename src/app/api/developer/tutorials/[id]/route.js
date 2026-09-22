import { NextResponse } from 'next/server';
import { isManagerOrAdmin } from '@/lib/middleware/developer';
import { queryDb } from '@/lib/db/pg';

// ============================================================================
// PUT: Update tutorial (Admin & Manager ONLY)
// ============================================================================
export async function PUT(request, { params }) {
  try {
    const auth = await isManagerOrAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message || 'Forbidden: Only managers and admins can edit tutorials.' },
        { status: auth.status || 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, youtube_link } = body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(title.trim());
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description ? description.trim() : null);
    }
    if (youtube_link !== undefined) {
      fields.push(`youtube_link = $${idx++}`);
      values.push(youtube_link.trim());
    }

    if (fields.length > 0) {
      values.push(id);
      await queryDb(`UPDATE tutorials SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    }

    return NextResponse.json({ success: true, message: 'Tutorial updated successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ============================================================================
// DELETE: Delete tutorial (Admin & Manager ONLY)
// ============================================================================
export async function DELETE(request, { params }) {
  try {
    const auth = await isManagerOrAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message || 'Forbidden: Only managers and admins can delete tutorials.' },
        { status: auth.status || 403 }
      );
    }

    const { id } = await params;
    await queryDb('DELETE FROM tutorials WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'Tutorial deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
