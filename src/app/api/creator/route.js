import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getCreatorSession } from '@/lib/middleware/creator';

// Table-specific action handlers
import { handleAuthAction } from './auth/route';
import { handleWebsitesAction } from './websites/route';
import { handlePaymentsAction } from './payments/route';
import { handlePurchasesAction } from './purchases/route';
import { handleSubscriptionsAction } from './subscriptions/route';
import { handleProfileAction } from './profile/route';
import { handleSupportAction } from './support/route';

/**
 * Main Creator Dashboard API Router
 * Aggregates dashboard data on GET and dispatches table actions on POST.
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorIdParam = searchParams.get('creatorId');

    const sessionCreator = await getCreatorSession(request);
    if (!sessionCreator) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Valid creator session required',
      }, { status: 401 });
    }

    let creator = sessionCreator;
    if (creatorIdParam && !isNaN(Number(creatorIdParam))) {
      if (Number(creatorIdParam) !== sessionCreator.id) {
        return NextResponse.json({
          success: false,
          error: 'Forbidden: Access to another creator profile is restricted',
        }, { status: 403 });
      }
    }

    if (!creator) {
      return NextResponse.json({
        success: false,
        error: 'Creator not found',
        creator: null,
        packages: [],
      }, { status: 404 });
    }

    const creatorId = creator.id;

    // Run parallel queries across all relevant tables
    const [
      activeSubRes,
      allSubsRes,
      websitesRes,
      paymentsRes,
      purchasesRes,
      packagesRes,
      ticketsRes,
      updatesRes,
      allCreatorsRes,
    ] = await Promise.all([
      // Active subscription
      queryDb(
        `SELECT s.*, 
                p.name AS package_name, 
                p.slug AS package_slug, 
                p.description AS package_description, 
                p.price_in_cents, 
                p.currency, 
                p.billing_interval, 
                p.max_portfolios
         FROM subscription s
         JOIN packages p ON s.package_id = p.id
         WHERE s.creator_id = $1 AND s.status = 'ACTIVE'
         ORDER BY s.id DESC LIMIT 1`,
        [creatorId]
      ),
      // All historical subscriptions
      queryDb(
        `SELECT s.*, 
                p.name AS package_name, 
                p.price_in_cents, 
                p.billing_interval
         FROM subscription s
         JOIN packages p ON s.package_id = p.id
         WHERE s.creator_id = $1
         ORDER BY s.id DESC`,
        [creatorId]
      ),
      // Websites with settings
      queryDb(
        `SELECT w.*, 
                ws.site_title, ws.tagline, ws.contact_email, ws.contact_phone, 
                ws.primary_color, ws.secondary_color, ws.font_family, ws.currency AS setting_currency,
                ws.social_links, ws.seo_config
         FROM websites w
         LEFT JOIN website_settings ws ON w.id = ws.website_id
         WHERE w.creator_id = $1
         ORDER BY w.id DESC`,
        [creatorId]
      ),
      // Payment history
      queryDb(
        `SELECT pay.*, 
                p.name AS package_name, 
                p.slug AS package_slug, 
                p.billing_interval, 
                s.status AS subscription_status
         FROM payment pay
         LEFT JOIN packages p ON pay.package_id = p.id
         LEFT JOIN subscription s ON pay.subscription_id = s.id
         WHERE pay.creator_id = $1
         ORDER BY pay.id DESC`,
        [creatorId]
      ).catch((err) => {
        console.error('Error fetching payments:', err);
        return { rows: [] };
      }),
      // Purchases history
      queryDb(
        `SELECT pu.*, 
                p.name AS package_name, 
                p.slug AS package_slug, 
                pay.status AS payment_status, 
                pay.transaction_id
         FROM purchases pu
         LEFT JOIN packages p ON pu.package_id = p.id
         LEFT JOIN payments pay ON pay.purchase_id = pu.id
         WHERE pu.user_id = $1
         ORDER BY pu.id DESC`,
        [creatorId]
      ).catch(() => ({ rows: [] })),
      // Available active packages
      queryDb(
        `SELECT * FROM packages WHERE is_active = TRUE ORDER BY price_in_cents ASC`
      ),
      // Support tickets
      queryDb(
        `SELECT * FROM support WHERE creator_id = $1 OR requester_email = $2 ORDER BY id DESC LIMIT 50`,
        [creator.id, creator.email]
      ),
      // Platform updates
      queryDb(
        `SELECT * FROM updates ORDER BY created_at DESC LIMIT 10`
      ),
      // Creators list for switcher
      queryDb(
        `SELECT id, name, email FROM creators ORDER BY id ASC`
      ),
      // Custom projects
      queryDb(
        `SELECT * FROM project WHERE creator_id = $1 ORDER BY id DESC LIMIT 50`,
        [creatorId]
      ).catch((err) => {
        console.error('Error fetching creator projects:', err);
        return { rows: [] };
      }),
    ]);

    const activeSub = activeSubRes.rows[0] || null;
    const websites = websitesRes.rows;
    const payments = paymentsRes.rows;
    const purchases = purchasesRes?.rows || [];
    const packages = packagesRes.rows;
    const tickets = ticketsRes.rows;
    const updates = updatesRes.rows;
    const subscriptions = allSubsRes.rows;
    const creators = allCreatorsRes.rows;
    const projects = projectsRes.rows;

    // Calculate days remaining
    let daysRemaining = 0;
    if (activeSub && activeSub.current_period_end) {
      const now = new Date();
      const end = new Date(activeSub.current_period_end);
      const diffTime = end.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Stats
    const totalSpentCents = payments.reduce((acc, p) => acc + (p.status === 'COMPLETED' ? Number(p.amount_in_cents || 0) : 0), 0);
    const totalStorageMb = websites.reduce((acc, w) => acc + Number(w.storage_used_mb || 0), 0);

    return NextResponse.json({
      success: true,
      creator,
      activeSubscription: activeSub,
      subscription: activeSub,
      subscriptions,
      websites,
      payments,
      purchases,
      packages,
      tickets,
      projects,
      updates,
      creators,
      stats: {
        totalWebsites: websites.length,
        maxWebsites: activeSub?.max_portfolios || 0,
        daysRemaining,
        totalSpentCents,
        totalStorageMb,
        hasActivePackage: Boolean(activeSub && activeSub.status === 'ACTIVE' && daysRemaining > 0),
      },
    });
  } catch (error) {
    console.error('Creator GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Auth Actions (creators table)
    const authActions = ['register', 'verify', 'resend_verification', 'login', 'logout', 'me', 'recover', 'reset_password'];
    if (authActions.includes(action)) {
      return await handleAuthAction(body, request);
    }

    // Get session creator for authenticated actions
    const sessionCreator = await getCreatorSession(request);

    // 2. Website Actions (websites table)
    const websiteActions = ['create_website', 'setup_website', 'update_website', 'delete_website'];
    if (websiteActions.includes(action)) {
      return await handleWebsitesAction(body, sessionCreator, request);
    }

    // 3. Purchase Actions (purchases table)
    const purchaseActions = ['create_order', 'update_status'];
    if (purchaseActions.includes(action)) {
      return await handlePurchasesAction(body, sessionCreator);
    }

    // 4. Payment Actions (payment table)
    const paymentActions = ['pay_invoice', 'pay'];
    if (paymentActions.includes(action)) {
      return await handlePaymentsAction(body, sessionCreator, request);
    }

    // 5. Subscription Actions (subscription table)
    const subscriptionActions = ['purchase_subscription', 'cancel'];
    if (subscriptionActions.includes(action)) {
      return await handleSubscriptionsAction(body, sessionCreator);
    }

    // 6. Profile & Security Actions (creators table)
    const profileActions = ['update_profile', 'change_password', 'toggle_2fa'];
    if (profileActions.includes(action)) {
      return await handleProfileAction(body, sessionCreator);
    }

    // 7. Support Actions (support & support_messages tables)
    const supportActions = ['create_ticket', 'add_message'];
    if (supportActions.includes(action)) {
      return await handleSupportAction(body, sessionCreator);
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('Creator POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
