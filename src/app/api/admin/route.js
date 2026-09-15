import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { authenticateAdmin, clearAdminSessionCookie, hashPassword } from '@/lib/service/admin';
import { queryDb } from '@/lib/db/pg';
import { sendEmail } from '@/lib/db/mailer';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableParam = searchParams.get('table');

    if (tableParam) {
      const records = dbStore.getTableRecords(tableParam);
      return NextResponse.json({ success: true, table: tableParam, records });
    }

    // Return full bundle for all 20 tables and overview dashboard
    return NextResponse.json({
      success: true,
      admins: dbStore.getTableRecords('admin'),
      blogs: dbStore.getTableRecords('blogs'),
      blogs_image: dbStore.getTableRecords('blogs_image'),
      packages: dbStore.getTableRecords('packages'),
      feature: dbStore.getTableRecords('feature'),
      packages_feature: dbStore.getTableRecords('packages_feature'),
      package_image: dbStore.getTableRecords('package_image'),
      live_chats: dbStore.getTableRecords('live_chats'),
      live_chat_messages: dbStore.getTableRecords('live_chat_messages'),
      contacts: dbStore.getTableRecords('contacts'),
      support: dbStore.getTableRecords('support'),
      support_messages: dbStore.getTableRecords('support_messages'),
      support_images: dbStore.getTableRecords('support_images'),
      payment: dbStore.getTableRecords('payment'),
      subscription: dbStore.getTableRecords('subscription'),
      tenant: dbStore.getTableRecords('tenant'),
      reports: dbStore.getTableRecords('reports'),
      leads: dbStore.getTableRecords('leads'),
      subscribers: dbStore.getTableRecords('subscribers'),
      themes: dbStore.getTableRecords('themes'),
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
      const record = dbStore.addTableRecord(body.table, body.data);
      return NextResponse.json({ success: true, record });
    }
    if (action === 'delete_record') {
      const success = dbStore.deleteTableRecord(body.table, body.id);
      return NextResponse.json({ success });
    }
    if (action === 'update_record') {
      const record = dbStore.updateTableRecord(body.table, body.id, body.data);
      return NextResponse.json({ success: true, record });
    }

    // --- ADMIN TEAM ---
    if (action === 'create_admin' || action === 'add_admin') {
      const admin = dbStore.createAdmin(body.adminData || body.data);
      return NextResponse.json({ success: true, admin });
    }
    if (action === 'remove_admin') {
      const removed = dbStore.removeAdmin ? dbStore.removeAdmin(body.adminId) : dbStore.deleteTableRecord('admin', body.adminId);
      return NextResponse.json({ success: true, removed });
    }
    if (action === 'toggle_admin_status') {
      const admin = dbStore.toggleAdminStatus ? dbStore.toggleAdminStatus(body.adminId) : dbStore.updateTableRecord('admin', body.adminId, { isActive: !body.currentStatus });
      return NextResponse.json({ success: true, admin });
    }

    // --- PACKAGES & FEATURES ---
    if (action === 'create_package') {
      const pkg = dbStore.createPackage(body.packageData);
      return NextResponse.json({ success: true, package: pkg });
    }
    if (action === 'create_feature') {
      const feature = dbStore.createFeature(body.featureData);
      return NextResponse.json({ success: true, feature });
    }
    if (action === 'delete_feature') {
      const deleted = dbStore.deleteFeature(body.featureId);
      return NextResponse.json({ success: true, deleted });
    }

    // --- THEMES ---
    if (action === 'add_theme') {
      const theme = dbStore.addTheme(body.themeData);
      return NextResponse.json({ success: true, theme });
    }
    if (action === 'toggle_theme') {
      const theme = dbStore.toggleTheme(body.themeId);
      return NextResponse.json({ success: true, theme });
    }
    if (action === 'delete_theme') {
      const deleted = dbStore.deleteTheme(body.themeId);
      return NextResponse.json({ success: true, deleted });
    }

    // --- CONTACTS ---
    if (action === 'submit_contact') {
      const contact = dbStore.addContact(body.contactData);
      return NextResponse.json({ success: true, contact });
    }
    if (action === 'reply_contact') {
      const contact = dbStore.replyContact(body.contactId, body.adminReply);
      return NextResponse.json({ success: true, contact });
    }
    if (action === 'archive_contact') {
      const contact = dbStore.archiveContact(body.contactId);
      return NextResponse.json({ success: true, contact });
    }

    // --- USERS ---
    if (action === 'toggle_user_status') {
      const user = dbStore.toggleUserStatus(body.userId);
      return NextResponse.json({ success: true, user });
    }
    if (action === 'ban_user') {
      const user = dbStore.banUser(body.userId, body.isBanned);
      return NextResponse.json({ success: true, user });
    }
    if (action === 'delete_user') {
      const deleted = dbStore.deleteUser(body.userId);
      return NextResponse.json({ success: true, deleted });
    }

    // --- CREATORS ---
    if (action === 'update_creator_role') {
      const creator = dbStore.updateCreatorRole(body.creatorId, body.role);
      return NextResponse.json({ success: true, creator });
    }

    // --- REVIEWS ---
    if (action === 'moderate_review') {
      const review = dbStore.moderateReview(body.reviewId, body.status);
      return NextResponse.json({ success: true, review });
    }
    if (action === 'delete_review') {
      const deleted = dbStore.deleteReview(body.reviewId);
      return NextResponse.json({ success: true, deleted });
    }

    // --- SPAMS ---
    if (action === 'resolve_spam') {
      const spam = dbStore.resolveSpam(body.spamId);
      return NextResponse.json({ success: true, spam });
    }
    if (action === 'block_spam') {
      const spam = dbStore.blockSpam(body.spamId);
      return NextResponse.json({ success: true, spam });
    }
    if (action === 'delete_spam') {
      const deleted = dbStore.deleteSpam(body.spamId);
      return NextResponse.json({ success: true, deleted });
    }

    // --- REPORTS ---
    if (action === 'respond_report') {
      const rep = dbStore.respondToReport(body.reportId, {
        adminResponse: body.adminResponse,
        status: body.status || 'RESOLVED',
      });
      return NextResponse.json({ success: true, report: rep });
    }

    // --- RECOVER ADMIN ---
    if (action === 'recover_admin' || action === 'recover') {
      const email = body.email?.trim().toLowerCase();
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
      }

      const token = 'rec_' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // Check PostgreSQL database
      const dbAdminRes = await queryDb('SELECT * FROM admin WHERE LOWER(email) = $1 LIMIT 1', [email]);
      if (dbAdminRes.rows.length > 0) {
        await queryDb(
          `UPDATE admin 
           SET forget_token = $1, forget_token_expires_at = CURRENT_TIMESTAMP + INTERVAL '1 hour' 
           WHERE id = $2`,
          [token, dbAdminRes.rows[0].id]
        );
      }

      // Try sending recovery email with Brevo
      try {
        await sendEmail({
          to: email,
          subject: 'Super Admin Security Recovery Token',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
              <h2 style="color: #6366f1; margin-top: 0;">Admin Security Recovery</h2>
              <p>You requested an account recovery token for the Multi-Tenant SaaS Admin Portal.</p>
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
      const result = await authenticateAdmin(body.email, body.password, { ip, userAgent });
      return NextResponse.json({ success: true, admin: result.admin });
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
