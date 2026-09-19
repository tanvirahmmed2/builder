import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { hashPassword, isAdmin } from '@/lib/middleware/developer';
import { sendEmail } from '@/lib/db/mailer';
import { SITE_NAME } from '@/lib/db/secret';

async function handleCreateAdmin(d) {
  const name = d.name?.trim();
  const email = d.email?.trim().toLowerCase();
  const password = d.password?.trim();
  const role = d.role || 'support';
  const isActive = d.isActive !== undefined ? Boolean(d.isActive) : (d.is_active !== undefined ? Boolean(d.is_active) : true);

  if (!name || !email || !password) {
    throw new Error('Full Name, Email Address, and Password are required.');
  }

  const existing = await queryDb('SELECT id FROM developers WHERE LOWER(email) = $1 LIMIT 1', [email]);
  if (existing.rows.length > 0) {
    throw new Error('A developer with this email address already exists.');
  }

  const hashedPassword = await hashPassword(password);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const insertRes = await queryDb(
    `INSERT INTO developers (name, email, password, role, is_active, is_verified, verification_code, verification_expires_at)
     VALUES ($1, $2, $3, $4, $5, FALSE, $6, CURRENT_TIMESTAMP + INTERVAL '24 hours')
     RETURNING id, name, email, role, is_active, is_verified, created_at`,
    [name, email, hashedPassword, role, isActive, verificationCode]
  );

  const newAdmin = insertRes.rows[0];

  try {
    await sendEmail({
      to: email,
      subject: `Admin Account Verification Code - ${SITE_NAME}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #0f172a; color: #f8fafc; border-radius: 20px; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #6366f1; font-size: 24px; margin: 0 0 8px 0;">${SITE_NAME} Admin Portal</h1>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Administrative Account Verification</p>
          </div>
          <div style="background: #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #334155;">
            <p style="margin-top: 0; color: #cbd5e1; font-size: 14px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">An administrator account has been created for you. To activate your account and access the admin portal, please verify your email address using the 6-digit security code below:</p>
            <div style="text-align: center; padding: 18px; margin: 20px 0; background: #0b0f19; border-radius: 10px; border: 1px dashed #6366f1;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">${verificationCode}</span>
            </div>
            <p style="margin-bottom: 0; font-size: 12px; color: #64748b; text-align: center;">This code will expire in 24 hours. Keep this confidential.</p>
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">If you did not expect this invitation, please contact security immediately.</p>
        </div>
      `,
      text: `Hello ${name},\n\nYour admin account verification code is: ${verificationCode}\n\nThis code expires in 24 hours.\n\nPlease enter this code to activate your account on ${SITE_NAME}.`,
    });
  } catch (mailErr) {
    console.warn('Brevo email sending notice during admin creation:', mailErr.message);
  }

  return newAdmin;
}

export async function GET() {
  try {
    const res = await queryDb('SELECT id, name, email, role, is_active, is_verified, last_login_at, created_at FROM developers ORDER BY id DESC');
    return NextResponse.json({ success: true, table: 'developers', records: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function checkLastActiveAdminGuard(targetId, willDeactivateOrDelete = true) {
  if (!willDeactivateOrDelete) return null;

  const adminRes = await queryDb('SELECT id, role, is_active FROM developers WHERE id = $1 LIMIT 1', [targetId]);
  if (adminRes.rows.length === 0) {
    return { error: 'Administrator not found.', status: 404 };
  }

  const admin = adminRes.rows[0];
  const role = (admin.role || '').toLowerCase();

  if (role === 'admin' && admin.is_active) {
    const countRes = await queryDb(
      "SELECT COUNT(*) as count FROM developers WHERE LOWER(role) = 'admin' AND is_active = TRUE"
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

const ALLOWED_ROLES = new Set(['admin', 'manager', 'support', 'developer', 'marketer']);

export async function POST(request) {
  try {
    const authCheck = await isAdmin(request);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.message || 'Forbidden: Only admin roles can update admin accounts or create administrators.' },
        { status: authCheck.status || 403 }
      );
    }

    const body = await request.json();
    const { action } = body;
    // POST is strictly for creating developer/admin account
    const newAdmin = await handleCreateAdmin(body.data || body.adminData || body);

    return NextResponse.json({
      success: true,
      admin: newAdmin,
      record: newAdmin,
      message: 'Admin account created successfully. Verification code sent via email.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const authCheck = await isAdmin(request);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.message || 'Forbidden: Only admin roles can update admin accounts.' },
        { status: authCheck.status || 403 }
      );
    }

    const body = await request.json();
    const targetId = body.id || body.adminId;
    if (!targetId) {
      return NextResponse.json({ success: false, error: 'Target admin ID is required.' }, { status: 400 });
    }

    const action = body.action;

    if (action === 'change_role' || body.role) {
      const rawRole = body.role || body.newRole;
      const cleanRole = (rawRole || '').toLowerCase().trim();

      if (!ALLOWED_ROLES.has(cleanRole)) {
        return NextResponse.json(
          { success: false, error: `Invalid role "${rawRole}". Allowed roles: admin, manager, support, developer, marketer.` },
          { status: 400 }
        );
      }

      if (cleanRole !== 'admin') {
        const guard = await checkLastActiveAdminGuard(targetId, true);
        if (guard) {
          return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
        }
      }

      const res = await queryDb(
        'UPDATE developers SET role = $1 WHERE id = $2 RETURNING id, name, email, role, is_active, is_verified, created_at',
        [cleanRole, targetId]
      );
      return NextResponse.json({ success: true, record: res.rows[0], message: `Role updated to ${cleanRole}.` });
    }

    if (action === 'toggle_status' || body.is_active !== undefined) {
      let nextActive = body.is_active;
      if (nextActive === undefined) {
        const currentRes = await queryDb('SELECT is_active FROM developers WHERE id = $1 LIMIT 1', [targetId]);
        if (currentRes.rows.length === 0) {
          return NextResponse.json({ success: false, error: 'Developer not found.' }, { status: 404 });
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
        'UPDATE developers SET is_active = $1 WHERE id = $2 RETURNING id, name, email, role, is_active, is_verified, created_at',
        [Boolean(nextActive), targetId]
      );
      return NextResponse.json({ success: true, record: res.rows[0], message: `Status updated to ${nextActive ? 'Active' : 'Inactive'}.` });
    }

    // Generic Update
    const data = { ...(body.data || body) };
    delete data.id;
    delete data.adminId;
    delete data.action;

    if (data.role) {
      const cleanRole = data.role.toLowerCase().trim();
      if (!ALLOWED_ROLES.has(cleanRole)) {
        return NextResponse.json({ success: false, error: `Invalid role "${data.role}".` }, { status: 400 });
      }
      data.role = cleanRole;
    }

    if (data.password && data.password.trim()) {
      data.password = await hashPassword(data.password.trim());
    } else {
      delete data.password;
    }

    const keys = Object.keys(data);
    if (keys.length === 0) return NextResponse.json({ success: true });

    const values = keys.map((k) => data[k]);
    const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`);
    values.push(targetId);

    const res = await queryDb(
      `UPDATE developers SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING id, name, email, role, is_active, is_verified, created_at`,
      values
    );
    return NextResponse.json({ success: true, record: res.rows[0], message: 'Developer account updated successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const authCheck = await isAdmin(request);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.message || 'Forbidden: Only admin roles can delete admin accounts.' },
        { status: authCheck.status || 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id || body.adminId;
    }
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const guard = await checkLastActiveAdminGuard(id, true);
    if (guard) {
      return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
    }

    await queryDb('DELETE FROM developers WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Developer account deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
