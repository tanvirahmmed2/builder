import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  try {
    const admins = dbStore.getAdmins();
    const packages = dbStore.getPackages();
    const features = dbStore.getFeatures();
    const subscriptions = dbStore.getSubscriptions();
    const payments = dbStore.getPayments();
    const reports = dbStore.getReports();
    const creators = dbStore.getCreators();
    const users = dbStore.getUsers();
    const reviews = dbStore.getAllReviews();
    const themes = dbStore.getThemes();
    const contacts = dbStore.getContacts();
    const spams = dbStore.getSpams();

    return NextResponse.json({
      success: true,
      admins,
      packages,
      features,
      subscriptions,
      payments,
      reports,
      creators,
      users,
      reviews,
      themes,
      contacts,
      spams,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // --- ADMIN TEAM ---
    if (action === 'create_admin' || action === 'add_admin') {
      const admin = dbStore.createAdmin(body.adminData);
      return NextResponse.json({ success: true, admin });
    }
    if (action === 'remove_admin') {
      const removed = dbStore.removeAdmin(body.adminId);
      return NextResponse.json({ success: true, removed });
    }
    if (action === 'toggle_admin_status') {
      const admin = dbStore.toggleAdminStatus(body.adminId);
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
    if (action === 'recover_admin') {
      const result = dbStore.recoverAdminPassword(body.email);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
