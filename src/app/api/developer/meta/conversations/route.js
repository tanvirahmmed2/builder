import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/pg';
import { isSupport, isManagerOrAdmin } from '@/lib/middleware/developer';

const ALLOWED_PLATFORMS = ['facebook', 'instagram', 'whatsapp'];
const ALLOWED_STATUSES = ['OPEN', 'RESOLVED', 'SPAM'];

/**
 * GET /api/developer/meta/conversations?platform=facebook|instagram|whatsapp&search=&status=
 * Guarded by isSupport (admin, manager, support)
 */
export async function GET(request) {
  try {
    const auth = await isSupport(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const rawPlatform = (searchParams.get('platform') || 'facebook').toLowerCase().trim();
    const platform = ALLOWED_PLATFORMS.includes(rawPlatform) ? rawPlatform : 'facebook';

    const rawStatus = (searchParams.get('status') || 'ALL').toUpperCase().trim();
    const status = ALLOWED_STATUSES.includes(rawStatus) ? rawStatus : 'ALL';

    const rawSearch = (searchParams.get('search') || '').trim().slice(0, 100);

    const conditions = ['platform = $1'];
    const values = [platform];
    let paramIdx = 2;

    if (status !== 'ALL') {
      conditions.push(`status = $${paramIdx}`);
      values.push(status);
      paramIdx++;
    }

    if (rawSearch) {
      // Escape SQL like wildcards
      const escaped = rawSearch.replace(/[%_]/g, '\\$&');
      conditions.push(
        `(recipient_name ILIKE $${paramIdx} OR recipient_id ILIKE $${paramIdx} OR last_message ILIKE $${paramIdx} OR recipient_phone ILIKE $${paramIdx})`
      );
      values.push(`%${escaped}%`);
      paramIdx++;
    }

    const query = `
      SELECT id, platform, external_conversation_id, recipient_id, recipient_name, 
             recipient_phone, recipient_avatar, last_message, last_message_at,
             status, unread_count, created_at, updated_at
      FROM meta_conversations
      WHERE ${conditions.join(' AND ')}
      ORDER BY updated_at DESC
      LIMIT 100
    `;

    const { rows } = await pool.query(query, values);
    return NextResponse.json({ success: true, records: rows, total: rows.length });
  } catch (error) {
    console.error('Failed to fetch Meta conversations:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to retrieve conversations' }, { status: 500 });
  }
}

/**
 * PATCH /api/developer/meta/conversations
 * Guarded by isSupport (admin, manager, support)
 */
export async function PATCH(request) {
  try {
    const auth = await isSupport(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const { id, status, markAsRead } = body;

    const convId = parseInt(id, 10);
    if (isNaN(convId) || convId <= 0) {
      return NextResponse.json({ success: false, error: 'Valid integer conversation ID is required' }, { status: 400 });
    }

    const updates = [];
    const values = [];
    let paramIdx = 1;

    if (status) {
      const cleanStatus = String(status).toUpperCase().trim();
      if (!ALLOWED_STATUSES.includes(cleanStatus)) {
        return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 });
      }
      updates.push(`status = $${paramIdx}`);
      values.push(cleanStatus);
      paramIdx++;
    }

    if (markAsRead === true) {
      updates.push(`unread_count = 0`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid update fields provided' }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(convId);

    const query = `
      UPDATE meta_conversations
      SET ${updates.join(', ')}
      WHERE id = $${paramIdx}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, record: rows[0] });
  } catch (error) {
    console.error('Failed to update Meta conversation:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to update conversation' }, { status: 500 });
  }
}

/**
 * DELETE /api/developer/meta/conversations?id=
 * Strictly restricted to Admin and Manager roles to prevent unauthorized data destruction
 */
export async function DELETE(request) {
  try {
    const auth = await isManagerOrAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: 'Access denied: Deleting conversations requires Admin or Manager role' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const convId = parseInt(id, 10);
    if (isNaN(convId) || convId <= 0) {
      return NextResponse.json({ success: false, error: 'Valid integer conversation ID is required' }, { status: 400 });
    }

    const deleteRes = await pool.query('DELETE FROM meta_conversations WHERE id = $1 RETURNING id', [convId]);
    if (deleteRes.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Failed to delete Meta conversation:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to delete conversation' }, { status: 500 });
  }
}
