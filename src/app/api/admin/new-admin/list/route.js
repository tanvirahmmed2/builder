import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

async function checkLastActiveAdminGuard(targetId, willDeactivateOrDelete = true) {
  if (!willDeactivateOrDelete) return null;

  const adminRes = await queryDb('SELECT id, role, is_active FROM admin WHERE id = $1 LIMIT 1', [targetId]);
  if (adminRes.rows.length === 0) {
    return { error: 'Administrator not found.', status: 404 };
  }

  const admin = adminRes.rows[0];
  const role = (admin.role || '').toLowerCase();

  // If this account has the 'admin' role and is active, ensure another active 'admin' exists
  if (role === 'admin' && admin.is_active) {
    const countRes = await queryDb(
      "SELECT COUNT(*) as count FROM admin WHERE LOWER(role) = 'admin' AND is_active = TRUE"
    );
    const activeAdminCount = parseInt(countRes.rows[0].count, 10);
    if (activeAdminCount <= 1) {
      return {
        error: 'Operation rejected: At least one active Super Admin account must remain in the platform.',
        status: 400,
      };
    }
  }

  return null;
}

export async function GET() {
  try {
    const res = await queryDb(
      'SELECT id, name, email, role, is_active, is_verified, last_login_at, created_at FROM admin ORDER BY id DESC'
    );
    return NextResponse.json({ success: true, table: 'admin', records: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, id, is_active } = body;
    const targetId = id || body.adminId;

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'Admin ID is required.' }, { status: 400 });
    }

    // --- TOGGLE / UPDATE ACTIVE STATUS ---
    if (action === 'toggle_status' || action === 'update_status') {
      // Determine what the new status will be
      let nextActive = is_active;
      if (nextActive === undefined) {
        const currentRes = await queryDb('SELECT is_active FROM admin WHERE id = $1 LIMIT 1', [targetId]);
        if (currentRes.rows.length === 0) {
          return NextResponse.json({ success: false, error: 'Admin not found.' }, { status: 404 });
        }
        nextActive = !currentRes.rows[0].is_active;
      }

      // If turning inactive, check guard
      if (nextActive === false) {
        const guard = await checkLastActiveAdminGuard(targetId, true);
        if (guard) {
          return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
        }
      }

      const res = await queryDb(
        'UPDATE admin SET is_active = $1 WHERE id = $2 RETURNING id, name, email, role, is_active, is_verified, created_at',
        [Boolean(nextActive), targetId]
      );
      return NextResponse.json({ success: true, record: res.rows[0], message: `Status updated to ${nextActive ? 'Active' : 'Inactive'}.` });
    }

    // --- DELETE ADMIN ---
    if (action === 'delete_record' || action === 'delete') {
      const guard = await checkLastActiveAdminGuard(targetId, true);
      if (guard) {
        return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
      }

      await queryDb('DELETE FROM admin WHERE id = $1', [targetId]);
      return NextResponse.json({ success: true, message: 'Admin account deleted successfully.' });
    }

    // --- GENERIC UPDATE RECORD ---
    if (action === 'update_record' || action === 'update') {
      const data = body.data || {};
      if (data.is_active === false || data.isActive === false) {
        const guard = await checkLastActiveAdminGuard(targetId, true);
        if (guard) {
          return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
        }
      }

      const keys = Object.keys(data).filter((k) => k !== 'id' && k !== 'password');
      if (keys.length === 0) return NextResponse.json({ success: true });
      const values = keys.map((k) => data[k]);
      const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`);
      values.push(targetId);
      const res = await queryDb(
        `UPDATE admin SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING id, name, email, role, is_active, is_verified, created_at`,
        values
      );
      return NextResponse.json({ success: true, record: res.rows[0] });
    }

    return NextResponse.json({ success: false, error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, is_active } = body;
    const targetId = id || body.adminId;

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'Admin ID is required.' }, { status: 400 });
    }

    let nextActive = is_active;
    if (nextActive === undefined) {
      const currentRes = await queryDb('SELECT is_active FROM admin WHERE id = $1 LIMIT 1', [targetId]);
      if (currentRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Admin not found.' }, { status: 404 });
      }
      nextActive = !currentRes.rows[0].is_active;
    }

    if (nextActive === false) {
      const guard = await checkLastActiveAdminGuard(targetId, true);
      if (guard) {
        return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
      }
    }

    const res = await queryDb(
      'UPDATE admin SET is_active = $1 WHERE id = $2 RETURNING id, name, email, role, is_active, is_verified, created_at',
      [Boolean(nextActive), targetId]
    );
    return NextResponse.json({ success: true, record: res.rows[0], message: `Status updated to ${nextActive ? 'Active' : 'Inactive'}.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id || body.adminId;
    }
    if (!id) {
      return NextResponse.json({ success: false, error: 'Admin ID is required.' }, { status: 400 });
    }

    const guard = await checkLastActiveAdminGuard(id, true);
    if (guard) {
      return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
    }

    await queryDb('DELETE FROM admin WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Admin account deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
