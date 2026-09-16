import { NextResponse } from 'next/server';
import { authenticateAdmin, clearAdminSessionCookie, hashPassword } from '@/lib/middleware/admin';
import { queryDb } from '@/lib/db/pg';
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

  const existing = await queryDb('SELECT id FROM admin WHERE LOWER(email) = $1 LIMIT 1', [email]);
  if (existing.rows.length > 0) {
    throw new Error('An admin with this email address already exists.');
  }

  const hashedPassword = await hashPassword(password);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const insertRes = await queryDb(
    `INSERT INTO admin (name, email, password, role, is_active, is_verified, verification_code, verification_expires_at)
     VALUES ($1, $2, $3, $4, $5, FALSE, $6, CURRENT_TIMESTAMP + INTERVAL '24 hours')
     RETURNING id, name, email, role, is_active, is_verified, created_at`,
    [name, email, hashedPassword, role, isActive, verificationCode]
  );

  const newAdmin = insertRes.rows[0];

  // Send verification code via Brevo mailer
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

const VALID_TABLES = new Set([
  'admin',
  'blogs',
  'blogs_image',
  'packages',
  'feature',
  'packages_feature',
  'package_image',
  'live_chats',
  'live_chat_messages',
  'contacts',
  'support',
  'support_messages',
  'support_images',
  'payment',
  'subscription',
  'websites',
  'reports',
  'leads',
  'subscribers',
  'themes',
  'users',
  'creators',
  'portfolios',
  'portfolio_sections',
  'portfolio_blogs',
  'portfolio_appointments',
  'portfolio_experiences',
  'portfolio_reviews',
]);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableParam = searchParams.get('table');

    if (tableParam) {
      if (!VALID_TABLES.has(tableParam)) {
        return NextResponse.json({ success: false, error: 'Invalid table name.' }, { status: 400 });
      }
      if (tableParam === 'admin') {
        const res = await queryDb('SELECT id, name, email, role, is_active, is_verified, last_login_at, created_at FROM admin ORDER BY id DESC');
        return NextResponse.json({ success: true, table: tableParam, records: res.rows });
      }
      const res = await queryDb(`SELECT * FROM "${tableParam}" ORDER BY id DESC`);
      return NextResponse.json({ success: true, table: tableParam, records: res.rows });
    }

    // Return full bundle for overview dashboard
    const [
      admins,
      blogs,
      blogs_image,
      packages,
      feature,
      packages_feature,
      package_image,
      live_chats,
      contacts,
      support,
      payment,
      subscription,
      websites,
      reports,
      leads,
      subscribers,
      themes,
    ] = await Promise.all([
      queryDb('SELECT id, name, email, role, is_active, is_verified, last_login_at, created_at FROM admin ORDER BY id ASC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM blogs ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM blogs_image ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM packages ORDER BY id ASC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM feature ORDER BY id ASC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM packages_feature ORDER BY id ASC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM package_image ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM live_chats ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM contacts ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM support ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM payment ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM subscription ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM websites ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM reports ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM leads ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM subscribers ORDER BY id DESC').then((r) => r.rows).catch(() => []),
      queryDb('SELECT * FROM themes ORDER BY id ASC').then((r) => r.rows).catch(() => []),
    ]);

    return NextResponse.json({
      success: true,
      admins,
      blogs,
      blogs_image,
      packages,
      feature,
      packages_feature,
      package_image,
      live_chats,
      contacts,
      support,
      payment,
      subscription,
      websites,
      reports,
      leads,
      subscribers,
      themes,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // --- GENERIC 20-TABLE ACTIONS ---
    if (action === 'create_record' || action === 'add_record') {
      const table = body.table;
      if (!VALID_TABLES.has(table)) {
        return NextResponse.json({ success: false, error: 'Invalid table.' }, { status: 400 });
      }
      const data = body.data || {};
      if (table === 'admin') {
        const record = await handleCreateAdmin(data);
        return NextResponse.json({ success: true, record });
      }
      const keys = Object.keys(data).filter((k) => k !== 'id');
      const values = keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k]));
      const placeholders = keys.map((_, i) => '$' + (i + 1));
      const res = await queryDb(
        `INSERT INTO "${table}" (${keys.map((k) => `"${k}"`).join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        values
      );
      return NextResponse.json({ success: true, record: res.rows[0] });
    }

    if (action === 'delete_record') {
      const table = body.table;
      if (!VALID_TABLES.has(table)) {
        return NextResponse.json({ success: false, error: 'Invalid table.' }, { status: 400 });
      }
      await queryDb(`DELETE FROM "${table}" WHERE id = $1`, [body.id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'update_record') {
      const table = body.table;
      if (!VALID_TABLES.has(table)) {
        return NextResponse.json({ success: false, error: 'Invalid table.' }, { status: 400 });
      }
      const data = body.data || {};
      const keys = Object.keys(data).filter((k) => k !== 'id');
      if (keys.length === 0) {
        return NextResponse.json({ success: true });
      }
      const values = keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k]));
      const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`);
      values.push(body.id);
      const res = await queryDb(
        `UPDATE "${table}" SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
      );
      return NextResponse.json({ success: true, record: res.rows[0] });
    }

    // --- ADMIN TEAM ---
    if (action === 'create_admin' || action === 'add_admin') {
      const d = body.adminData || body.data || {};
      const admin = await handleCreateAdmin(d);
      return NextResponse.json({
        success: true,
        admin,
        message: 'Admin account created successfully. Verification code sent via email.',
      });
    }

    if (action === 'verify_admin' || action === 'verify_code') {
      const email = body.email?.trim().toLowerCase();
      const code = body.code?.toString().trim();

      if (!email || !code) {
        return NextResponse.json(
          { success: false, error: 'Email and verification code are required.' },
          { status: 400 }
        );
      }

      const adminRes = await queryDb(
        `SELECT id, email, is_verified, verification_code, verification_expires_at 
         FROM admin 
         WHERE LOWER(email) = $1 LIMIT 1`,
        [email]
      );

      if (adminRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Admin account not found.' }, { status: 404 });
      }

      const admin = adminRes.rows[0];

      if (admin.is_verified) {
        return NextResponse.json({
          success: true,
          message: 'Account is already verified. You can log in.',
        });
      }

      if (!admin.verification_code || admin.verification_code !== code) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification code.' },
          { status: 400 }
        );
      }

      if (admin.verification_expires_at && new Date(admin.verification_expires_at) < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      await queryDb(
        `UPDATE admin 
         SET is_verified = TRUE, verification_code = NULL, verification_expires_at = NULL 
         WHERE id = $1`,
        [admin.id]
      );

      return NextResponse.json({
        success: true,
        message: 'Admin account verified successfully! You can now log in.',
      });
    }

    if (action === 'resend_verification_code' || action === 'resend_code') {
      const email = body.email?.trim().toLowerCase();
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
      }

      const adminRes = await queryDb(
        `SELECT id, name, is_verified FROM admin WHERE LOWER(email) = $1 LIMIT 1`,
        [email]
      );

      if (adminRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Admin account not found.' }, { status: 404 });
      }

      const admin = adminRes.rows[0];
      if (admin.is_verified) {
        return NextResponse.json({ success: false, error: 'Account is already verified.' }, { status: 400 });
      }

      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      await queryDb(
        `UPDATE admin 
         SET verification_code = $1, verification_expires_at = CURRENT_TIMESTAMP + INTERVAL '24 hours' 
         WHERE id = $2`,
        [newCode, admin.id]
      );

      try {
        await sendEmail({
          to: email,
          subject: `Admin Verification Code - ${SITE_NAME}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #0f172a; color: #f8fafc; border-radius: 20px; border: 1px solid #1e293b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #6366f1; font-size: 24px; margin: 0 0 8px 0;">${SITE_NAME} Admin Portal</h1>
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">Security Verification Code</p>
              </div>
              <div style="background: #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #334155;">
                <p style="margin-top: 0; color: #cbd5e1; font-size: 14px;">Hello <strong>${admin.name}</strong>,</p>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">Here is your new 6-digit verification code to activate your administrator account:</p>
                <div style="text-align: center; padding: 18px; margin: 20px 0; background: #0b0f19; border-radius: 10px; border: 1px dashed #6366f1;">
                  <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">${newCode}</span>
                </div>
                <p style="margin-bottom: 0; font-size: 12px; color: #64748b; text-align: center;">This code will expire in 24 hours.</p>
              </div>
            </div>
          `,
          text: `Hello ${admin.name},\n\nYour new admin verification code is: ${newCode}\n\nThis code expires in 24 hours.`,
        });
      } catch (mailErr) {
        console.warn('Brevo email notice:', mailErr.message);
      }

      return NextResponse.json({ success: true, message: 'A new verification code has been dispatched to your email.' });
    }

    if (action === 'remove_admin') {
      const res = await queryDb('DELETE FROM admin WHERE id = $1 RETURNING id', [body.adminId]);
      return NextResponse.json({ success: true, removed: res.rows[0] });
    }

    if (action === 'toggle_admin_status') {
      const res = await queryDb(
        'UPDATE admin SET is_active = NOT is_active WHERE id = $1 RETURNING id, name, email, is_active',
        [body.adminId]
      );
      return NextResponse.json({ success: true, admin: res.rows[0] });
    }

    // --- PACKAGES & FEATURES ---
    if (action === 'create_package') {
      const d = body.packageData || {};
      const res = await queryDb(
        `INSERT INTO packages (name, price, currency, billing_interval, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [d.name || 'New Package', d.price || 0, d.currency || 'USD', d.billingInterval || 'MONTHLY', d.description || '']
      );
      return NextResponse.json({ success: true, package: res.rows[0] });
    }

    if (action === 'create_feature') {
      const d = body.featureData || {};
      const res = await queryDb(
        `INSERT INTO feature (name, description, category)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [d.name || 'New Feature', d.description || '', d.category || 'General']
      );
      return NextResponse.json({ success: true, feature: res.rows[0] });
    }

    if (action === 'delete_feature') {
      const res = await queryDb('DELETE FROM feature WHERE id = $1 RETURNING id', [body.featureId]);
      return NextResponse.json({ success: true, deleted: res.rows[0] });
    }

    // --- THEMES ---
    if (action === 'add_theme') {
      const d = body.themeData || {};
      const res = await queryDb(
        `INSERT INTO themes (name, slug, preview_image, description)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [d.name || 'New Theme', (d.name || 'theme').toLowerCase().replace(/\s+/g, '-'), d.previewImage || null, d.description || '']
      );
      return NextResponse.json({ success: true, theme: res.rows[0] });
    }

    if (action === 'toggle_theme') {
      const res = await queryDb('UPDATE themes SET is_active = NOT is_active WHERE id = $1 RETURNING *', [body.themeId]);
      return NextResponse.json({ success: true, theme: res.rows[0] });
    }

    if (action === 'delete_theme') {
      const res = await queryDb('DELETE FROM themes WHERE id = $1 RETURNING id', [body.themeId]);
      return NextResponse.json({ success: true, deleted: res.rows[0] });
    }

    // --- CONTACTS ---
    if (action === 'submit_contact') {
      const d = body.contactData || {};
      const res = await queryDb(
        `INSERT INTO contacts (name, email, subject, message)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [d.name, d.email, d.subject || 'General Inquiry', d.message]
      );
      return NextResponse.json({ success: true, contact: res.rows[0] });
    }

    if (action === 'reply_contact') {
      const res = await queryDb(
        `UPDATE contacts SET admin_reply = $1, status = 'RESOLVED' WHERE id = $2 RETURNING *`,
        [body.adminReply, body.contactId]
      );
      return NextResponse.json({ success: true, contact: res.rows[0] });
    }

    if (action === 'archive_contact') {
      const res = await queryDb(
        `UPDATE contacts SET status = 'ARCHIVED' WHERE id = $1 RETURNING *`,
        [body.contactId]
      );
      return NextResponse.json({ success: true, contact: res.rows[0] });
    }

    // --- USERS ---
    if (action === 'toggle_user_status') {
      const res = await queryDb('UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING *', [body.userId]);
      return NextResponse.json({ success: true, user: res.rows[0] });
    }

    if (action === 'ban_user') {
      const res = await queryDb('UPDATE users SET is_banned = $1 WHERE id = $2 RETURNING *', [Boolean(body.isBanned), body.userId]);
      return NextResponse.json({ success: true, user: res.rows[0] });
    }

    if (action === 'delete_user') {
      const res = await queryDb('DELETE FROM users WHERE id = $1 RETURNING id', [body.userId]);
      return NextResponse.json({ success: true, deleted: res.rows[0] });
    }

    // --- CREATORS ---
    if (action === 'update_creator_role') {
      const res = await queryDb('UPDATE creators SET role = $1 WHERE id = $2 RETURNING *', [body.role, body.creatorId]);
      return NextResponse.json({ success: true, creator: res.rows[0] });
    }

    // --- REVIEWS ---
    if (action === 'moderate_review') {
      const res = await queryDb('UPDATE portfolio_reviews SET status = $1 WHERE id = $2 RETURNING *', [body.status, body.reviewId]);
      return NextResponse.json({ success: true, review: res.rows[0] });
    }

    if (action === 'delete_review') {
      const res = await queryDb('DELETE FROM portfolio_reviews WHERE id = $1 RETURNING id', [body.reviewId]);
      return NextResponse.json({ success: true, deleted: res.rows[0] });
    }

    // --- REPORTS ---
    if (action === 'respond_report') {
      const res = await queryDb(
        `UPDATE reports SET admin_response = $1, status = $2 WHERE id = $3 RETURNING *`,
        [body.adminResponse, body.status || 'RESOLVED', body.reportId]
      );
      return NextResponse.json({ success: true, report: res.rows[0] });
    }

    // --- RECOVER ADMIN ---
    if (action === 'recover_admin' || action === 'recover') {
      const email = body.email?.trim().toLowerCase();
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
      }

      const token = 'rec_' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const dbAdminRes = await queryDb('SELECT * FROM admin WHERE LOWER(email) = $1 LIMIT 1', [email]);
      if (dbAdminRes.rows.length > 0) {
        await queryDb(
          `UPDATE admin 
           SET forget_token = $1, forget_token_expires_at = CURRENT_TIMESTAMP + INTERVAL '1 hour' 
           WHERE id = $2`,
          [token, dbAdminRes.rows[0].id]
        );
      }

      try {
        await sendEmail({
          to: email,
          subject: 'Super Admin Security Recovery Token',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
              <h2 style="color: #6366f1; margin-top: 0;">Admin Security Recovery</h2>
              <p>You requested an account recovery token for the Multi-Website SaaS Admin Portal.</p>
              <div style="padding: 14px; background: #1e293b; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #38bdf8;">${token}</span>
              </div>
              <p style="font-size: 13px; color: #94a3b8;">This token expires in 60 minutes. If you did not request this, please disregard this email.</p>
            </div>
          `,
          text: `Your admin security recovery token is: ${token}. It expires in 60 minutes.`,
        });
      } catch (mailErr) {
        console.warn('Brevo email sending notice:', mailErr.message);
      }

      return NextResponse.json({
        success: true,
        token,
        message: 'Recovery instructions sent successfully.',
      });
    }

    // --- RESET ADMIN PASSWORD ---
    if (action === 'reset_password') {
      const email = body.email?.trim().toLowerCase();
      const token = body.token?.trim();
      const newPassword = body.newPassword;

      if (!email || !token || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Email, token, and new password are required' },
          { status: 400 }
        );
      }

      const adminRes = await queryDb(
        `SELECT * FROM admin 
         WHERE LOWER(email) = $1 AND forget_token = $2 AND forget_token_expires_at > CURRENT_TIMESTAMP 
         LIMIT 1`,
        [email, token]
      );

      if (adminRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired recovery token.' },
          { status: 400 }
        );
      }

      await queryDb(
        `UPDATE admin 
         SET password = $1, forget_token = NULL, forget_token_expires_at = NULL 
         WHERE id = $2`,
        [newPassword, adminRes.rows[0].id]
      );

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      });
    }

    // --- ADMIN LOGIN ---
    if (action === 'login') {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      try {
        const result = await authenticateAdmin(body.email, body.password, { ip, userAgent });
        return NextResponse.json({ success: true, admin: result.admin, token: result.token });
      } catch (authErr) {
        return NextResponse.json(
          {
            success: false,
            error: authErr.message,
            unverified: Boolean(authErr.unverified),
            email: authErr.email || undefined,
          },
          { status: authErr.unverified ? 403 : 401 }
        );
      }
    }

    // --- ADMIN LOGOUT ---
    if (action === 'logout') {
      await clearAdminSessionCookie();
      return NextResponse.json({ success: true, message: 'Logged out successfully' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
