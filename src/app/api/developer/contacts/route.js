import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { authenticateStaff, isManagerOrAdmin } from '@/lib/middleware/developer';

// GET ALL CONTACTS (Staff access)
export async function GET(request) {
  try {
    const auth = await authenticateStaff(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message || 'Unauthorized' }, { status: 401 });
    }

    const res = await queryDb(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.subject,
        c.message,
        c.status,
        c.reply,
        c.replied_by_developer_id,
        c.created_at,
        c.updated_at,
        d.name AS replied_by_name,
        d.email AS replied_by_email,
        d.role AS replied_by_role
      FROM contacts c
      LEFT JOIN developers d ON c.replied_by_developer_id = d.id
      ORDER BY c.id DESC
    `).catch(() => ({ rows: [] }));

    return NextResponse.json({ 
      success: true, 
      table: 'contacts', 
      records: res.rows,
      currentUserRole: auth.staff?.role || 'staff'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE CONTACT (Staff manual creation)
export async function POST(request) {
  try {
    const auth = await authenticateStaff(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = body.data || body;
    const name = data.name?.trim();
    const email = data.email?.trim()?.toLowerCase();
    const subject = data.subject?.trim() || 'General Inquiry';
    const message = data.message?.trim();
    const status = data.status || 'NEW';
    const reply = data.reply || data.admin_reply || null;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO contacts (name, email, subject, message, status, reply, replied_by_developer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email, subject, message, status, reply, reply ? auth.staff.id : null]
    );

    return NextResponse.json({ success: true, record: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// UPDATE CONTACT (Staff update)
export async function PUT(request) {
  try {
    const auth = await authenticateStaff(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const id = body.id || body.data?.id;
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    const data = body.data || body;
    const name = data.name?.trim();
    const email = data.email?.trim();
    const subject = data.subject?.trim();
    const message = data.message?.trim();
    const status = data.status;
    const reply = data.reply !== undefined ? data.reply : data.admin_reply;

    const res = await queryDb(
      `UPDATE contacts 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           subject = COALESCE($3, subject),
           message = COALESCE($4, message),
           status = COALESCE($5, status),
           reply = COALESCE($6, reply),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name || null, email || null, subject || null, message || null, status || null, reply || null, id]
    );

    return NextResponse.json({ success: true, record: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE CONTACT (Admin and Manager only)
export async function DELETE(request) {
  try {
    const auth = await isManagerOrAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Access denied: Only administrators and managers have permission to delete contact inquiries.' 
        }, 
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const deleteRes = await queryDb('DELETE FROM contacts WHERE id = $1 RETURNING id', [id]);
    if (deleteRes.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Contact inquiry not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Contact inquiry deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

