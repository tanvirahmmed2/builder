import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { queryDb } from '@/lib/db/pg';
import { sendEmail } from '@/lib/db/mailer';
import { SITE_NAME } from '@/lib/db/secret';
import {
  authenticateCreator,
  getCreatorSession,
  clearCreatorSessionCookie,
  hashPassword,
} from '@/lib/middleware/creator';

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

    // Run parallel queries to gather complete creator dashboard data
    const [
      activeSubRes,
      allSubsRes,
      websitesRes,
      paymentsRes,
      packagesRes,
      ticketsRes,
      updatesRes,
      allCreatorsRes,
    ] = await Promise.all([
      // Active / latest subscription with package details
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
      // All websites created by this creator
      queryDb(
        `SELECT id, creator_id, name, subdomain, custom_domain, theme_config, 
                status, storage_used_mb, is_published, created_at, updated_at
         FROM websites
         WHERE creator_id = $1
         ORDER BY id DESC`,
        [creatorId]
      ),
      // Payment history
      queryDb(
        `SELECT pay.*, p.name AS package_name
         FROM payment pay
         LEFT JOIN packages p ON pay.package_id = p.id
         WHERE pay.creator_id = $1
         ORDER BY pay.id DESC`,
        [creatorId]
      ),
      // Available packages for purchase / upgrade
      queryDb(
        `SELECT * FROM packages WHERE is_active = TRUE ORDER BY price_in_cents ASC`
      ),
      // Support tickets submitted by this creator
      queryDb(
        `SELECT * FROM support WHERE creator_id = $1 OR requester_email = $2 ORDER BY id DESC LIMIT 50`,
        [creator.id, creator.email]
      ),
      // Platform updates & changelog
      queryDb(
        `SELECT * FROM updates ORDER BY created_at DESC LIMIT 10`
      ),
      // Minimal creators list for switcher
      queryDb(
        `SELECT id, name, email, avatar_url FROM creators ORDER BY id ASC`
      ),
    ]);

    const activeSub = activeSubRes.rows[0] || null;
    const websites = websitesRes.rows;
    const payments = paymentsRes.rows;
    const packages = packagesRes.rows;
    const tickets = ticketsRes.rows;
    const updates = updatesRes.rows;
    const subscriptions = allSubsRes.rows;
    const creators = allCreatorsRes.rows;

    // Calculate days remaining in active subscription
    let daysRemaining = 0;
    if (activeSub && activeSub.current_period_end) {
      const now = new Date();
      const end = new Date(activeSub.current_period_end);
      const diffTime = end.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Compute stats
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
      packages,
      tickets,
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

    // 1. Creator Registration (unverified, no package required, sends verification link)
    if (action === 'register') {
      const d = body.creatorData || body;
      if (!d.name || !d.email || !d.password) {
        return NextResponse.json({ success: false, error: 'Name, email, and password are required.' }, { status: 400 });
      }

      const cleanEmail = String(d.email).trim().toLowerCase();
      const existing = await queryDb('SELECT id FROM creators WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
      }

      const hashedPassword = await hashPassword(d.password);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const res = await queryDb(
        `INSERT INTO creators (name, email, password, phone, bio, avatar_url, is_active, is_verified, verification_code, verification_expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE, FALSE, $7, CURRENT_TIMESTAMP + INTERVAL '24 hours')
         RETURNING id, name, email, phone, bio, avatar_url, is_active, is_verified, created_at`,
        [
          d.name.trim(),
          cleanEmail,
          hashedPassword,
          d.phone ? d.phone.trim() : null,
          d.bio ? d.bio.trim() : 'New Platform Creator',
          d.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          verificationToken,
        ]
      );

      const newCreator = res.rows[0];

      // Build verification URL
      const origin =
        request.headers.get('origin') ||
        (request.headers.get('host')
          ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
          : '') ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';

      const verifyUrl = `${origin}/creator/verify?token=${verificationToken}&email=${encodeURIComponent(cleanEmail)}`;

      // Send Verification Email via Brevo
      try {
        await sendEmail({
          to: cleanEmail,
          subject: `Verify Your Creator Account - ${SITE_NAME}`,
          html: `
            <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; color: #1e293b;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Welcome to ${SITE_NAME}, ${newCreator.name}!</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for joining our creator platform. Please click the button below to verify your email address and activate your creator account:
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${verifyUrl}" style="background: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 10px; display: inline-block;">
                  Verify My Account →
                </a>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                Or copy and paste this verification URL into your browser:<br/>
                <a href="${verifyUrl}" style="color: #6366f1; word-break: break-all;">${verifyUrl}</a>
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                This link will expire in 24 hours. If you did not sign up for this account, please ignore this email.
              </p>
            </div>
          `,
          text: `Hello ${newCreator.name},\n\nPlease verify your ${SITE_NAME} creator account by visiting the link below:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
        });
      } catch (mailErr) {
        console.warn('Notice sending creator verification email via Brevo:', mailErr.message);
      }

      return NextResponse.json({
        success: true,
        message: 'Account registered successfully! A verification link has been sent to your email. Please verify before logging in.',
        creator: newCreator,
      });
    }

    // 2. Creator Account Email Verification
    if (action === 'verify') {
      const { token, email } = body;
      if (!token || !email) {
        return NextResponse.json(
          { success: false, error: 'Verification token and email are required.' },
          { status: 400 }
        );
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const res = await queryDb(
        `SELECT id, name, email, is_verified, verification_code, verification_expires_at 
         FROM creators WHERE LOWER(email) = $1 LIMIT 1`,
        [cleanEmail]
      );

      const creator = res.rows[0];
      if (!creator) {
        return NextResponse.json(
          { success: false, error: 'Creator account not found.' },
          { status: 404 }
        );
      }

      if (creator.is_verified === true) {
        return NextResponse.json({
          success: true,
          message: 'Your account is already verified! You can log in directly.',
          alreadyVerified: true,
        });
      }

      if (!creator.verification_code || creator.verification_code !== String(token).trim()) {
        return NextResponse.json(
          { success: false, error: 'Invalid or incorrect verification link. Please check your link or request a new one.' },
          { status: 400 }
        );
      }

      if (creator.verification_expires_at && new Date(creator.verification_expires_at) < new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: 'This verification link has expired. Please request a new verification link.',
            expired: true,
          },
          { status: 400 }
        );
      }

      await queryDb(
        `UPDATE creators 
         SET is_verified = TRUE, verification_code = NULL, verification_expires_at = NULL 
         WHERE id = $1`,
        [creator.id]
      );

      return NextResponse.json({
        success: true,
        message: 'Your creator account has been successfully verified! You can now log in.',
      });
    }

    // 3. Resend Verification Link
    if (action === 'resend_verification') {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const res = await queryDb(
        'SELECT id, name, email, is_active, is_verified FROM creators WHERE LOWER(email) = $1 LIMIT 1',
        [cleanEmail]
      );

      const creator = res.rows[0];
      if (!creator) {
        return NextResponse.json({ success: false, error: 'Creator account not found with this email.' }, { status: 404 });
      }

      if (creator.is_active === false) {
        return NextResponse.json({ success: false, error: 'This account has been deactivated.' }, { status: 403 });
      }

      if (creator.is_verified === true) {
        return NextResponse.json({
          success: true,
          message: 'This account is already verified! You can log in directly.',
          alreadyVerified: true,
        });
      }

      const newToken = crypto.randomBytes(32).toString('hex');
      await queryDb(
        `UPDATE creators 
         SET verification_code = $1, verification_expires_at = CURRENT_TIMESTAMP + INTERVAL '24 hours' 
         WHERE id = $2`,
        [newToken, creator.id]
      );

      const origin =
        request.headers.get('origin') ||
        (request.headers.get('host')
          ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
          : '') ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';

      const verifyUrl = `${origin}/creator/verify?token=${newToken}&email=${encodeURIComponent(cleanEmail)}`;

      try {
        await sendEmail({
          to: cleanEmail,
          subject: `New Verification Link - ${SITE_NAME}`,
          html: `
            <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; color: #1e293b;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Verify Your Creator Account</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Hello ${creator.name}, you requested a new verification link for your creator account on ${SITE_NAME}. Click the button below to complete activation:
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${verifyUrl}" style="background: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 10px; display: inline-block;">
                  Verify My Account →
                </a>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                Or copy and paste this verification URL into your browser:<br/>
                <a href="${verifyUrl}" style="color: #6366f1; word-break: break-all;">${verifyUrl}</a>
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                This link will expire in 24 hours.
              </p>
            </div>
          `,
          text: `Hello ${creator.name},\n\nPlease verify your account by visiting:\n${verifyUrl}\n\nExpires in 24 hours.`,
        });
      } catch (mailErr) {
        console.warn('Notice resending creator verification email via Brevo:', mailErr.message);
      }

      return NextResponse.json({
        success: true,
        message: 'A new verification link has been sent to your email.',
      });
    }

    // 4. Creator Login (only active & verified accounts can login; saves cookie)
    if (action === 'login') {
      const { email, password } = body;
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || 'Unknown';

      try {
        const result = await authenticateCreator(email, password, { ip, userAgent });
        return NextResponse.json({
          success: true,
          creator: result.creator,
          token: result.token,
          message: 'Logged in successfully.',
        });
      } catch (authErr) {
        return NextResponse.json(
          {
            success: false,
            error: authErr.message || 'Authentication failed.',
            unverified: Boolean(authErr.unverified),
            deactivated: Boolean(authErr.deactivated),
            email: authErr.email || undefined,
          },
          { status: authErr.status || 401 }
        );
      }
    }

    // 5. Creator Logout (clears session cookie)
    if (action === 'logout') {
      await clearCreatorSessionCookie();
      return NextResponse.json({ success: true, message: 'Logged out successfully.' });
    }

    // 6. Creator Me (current session check)
    if (action === 'me') {
      const current = await getCreatorSession(request);
      if (!current) {
        return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
      }
      return NextResponse.json({ success: true, creator: current });
    }

    // 7. Creator Account Recovery
    if (action === 'recover') {
      const token = 'rec_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const res = await queryDb(
        `UPDATE creators 
         SET recovery_token = $1, recovery_token_expires_at = CURRENT_TIMESTAMP + INTERVAL '1 hour'
         WHERE LOWER(email) = LOWER($2)
         RETURNING id, email`,
        [token, body.email]
      );
      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Creator not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, token, message: 'Recovery instructions generated.' });
    }

    // 4. Purchase Package Subscription & Process Payment
    if (action === 'purchase_subscription') {
      const creatorId = Number(body.creatorId);
      const packageId = Number(body.packageId);
      const paymentMethod = body.paymentMethod || 'CARD';

      if (!creatorId || !packageId) {
        return NextResponse.json({ success: false, error: 'Creator ID and Package ID are required.' }, { status: 400 });
      }

      const pkgRes = await queryDb('SELECT * FROM packages WHERE id = $1 LIMIT 1', [packageId]);
      const pkg = pkgRes.rows[0];
      if (!pkg) {
        return NextResponse.json({ success: false, error: 'Selected package does not exist.' }, { status: 404 });
      }

      // Determine duration interval: MONTHLY = 30 days, YEARLY = 365 days
      const isYearly = String(pkg.billing_interval).toUpperCase() === 'YEARLY';
      const durationInterval = isYearly ? "INTERVAL '365 days'" : "INTERVAL '30 days'";

      // Insert subscription record
      const subRes = await queryDb(
        `INSERT INTO subscription (creator_id, package_id, status, current_period_start, current_period_end)
         VALUES ($1, $2, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + ${durationInterval})
         RETURNING *`,
        [creatorId, packageId]
      );
      const subscription = subRes.rows[0];

      // Insert payment record
      const txnId = 'TXN_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const payRes = await queryDb(
        `INSERT INTO payment (creator_id, package_id, subscription_id, amount_in_cents, currency, payment_method, transaction_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'COMPLETED')
         RETURNING *`,
        [creatorId, packageId, subscription.id, pkg.price_in_cents, pkg.currency || 'USD', paymentMethod, txnId]
      );

      // Auto-provision initial website if requested or if creator has none
      let website = null;
      if (body.provisionWebsite !== false) {
        const existingWebsites = await queryDb('SELECT id FROM websites WHERE creator_id = $1 LIMIT 1', [creatorId]);
        if (existingWebsites.rows.length === 0) {
          const rawSubdomain = (body.subdomain || `portfolio-${creatorId}`).toLowerCase().replace(/[^a-z0-9-]/g, '');
          const wCreate = await queryDb(
            `INSERT INTO websites (creator_id, name, subdomain, custom_domain, status, storage_used_mb, is_published, theme_config)
             VALUES ($1, $2, $3, $4, 'ACTIVE', 15, TRUE, '{"primaryColor": "#6366f1", "fontFamily": "Inter", "accent": "#10b981", "mode": "dark"}'::jsonb)
             RETURNING *`,
            [
              creatorId,
              body.websiteName || 'My Portfolio Website',
              rawSubdomain,
              body.customDomain || null,
            ]
          );
          website = wCreate.rows[0];
        }
      }

      return NextResponse.json({
        success: true,
        subscription,
        payment: payRes.rows[0],
        website,
      });
    }

    // 5. Create Website (for creator who has purchased a package)
    if (action === 'create_website') {
      const creatorId = Number(body.creatorId);
      const name = (body.name || '').trim();
      let subdomain = (body.subdomain || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

      if (!creatorId || !name || !subdomain) {
        return NextResponse.json({ success: false, error: 'Creator ID, website name, and subdomain are required.' }, { status: 400 });
      }

      // Check active package & max portfolios quota
      const activeSub = await queryDb(
        `SELECT s.*, p.max_portfolios 
         FROM subscription s 
         JOIN packages p ON s.package_id = p.id 
         WHERE s.creator_id = $1 AND s.status = 'ACTIVE' AND s.current_period_end > CURRENT_TIMESTAMP
         ORDER BY s.id DESC LIMIT 1`,
        [creatorId]
      );
      if (activeSub.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'An active package subscription is required to create a new website. Please purchase a package first.',
        }, { status: 403 });
      }

      const maxLimit = activeSub.rows[0].max_portfolios || 1;
      const currentCountRes = await queryDb('SELECT COUNT(*)::int AS count FROM websites WHERE creator_id = $1', [creatorId]);
      const currentCount = currentCountRes.rows[0].count;

      if (currentCount >= maxLimit) {
        return NextResponse.json({
          success: false,
          error: `Your current package allows up to ${maxLimit} website(s). Please upgrade your package to create more websites.`,
        }, { status: 403 });
      }

      // Check subdomain uniqueness
      const subCheck = await queryDb('SELECT id FROM websites WHERE LOWER(subdomain) = LOWER($1) LIMIT 1', [subdomain]);
      if (subCheck.rows.length > 0) {
        subdomain = `${subdomain}-${Date.now().toString().slice(-4)}`;
      }

      const themeConfig = body.themeConfig || {
        primaryColor: '#6366f1',
        fontFamily: 'Inter',
        accent: '#10b981',
        mode: 'dark',
      };

      const res = await queryDb(
        `INSERT INTO websites (creator_id, name, subdomain, custom_domain, theme_config, status, storage_used_mb, is_published)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 12, TRUE)
         RETURNING *`,
        [
          creatorId,
          name,
          subdomain,
          body.customDomain || null,
          JSON.stringify(themeConfig),
        ]
      );
      return NextResponse.json({ success: true, website: res.rows[0] });
    }

    // 6. Update Website
    if (action === 'update_website') {
      const id = Number(body.id);
      const creatorId = Number(body.creatorId);

      if (!id || !creatorId) {
        return NextResponse.json({ success: false, error: 'Website ID and Creator ID are required.' }, { status: 400 });
      }

      const updates = [];
      const values = [];
      let idx = 1;

      if (body.name !== undefined) {
        updates.push(`name = $${idx++}`);
        values.push(body.name);
      }
      if (body.subdomain !== undefined) {
        const cleanSub = body.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
        updates.push(`subdomain = $${idx++}`);
        values.push(cleanSub);
      }
      if (body.custom_domain !== undefined) {
        updates.push(`custom_domain = $${idx++}`);
        values.push(body.custom_domain || null);
      }
      if (body.theme_config !== undefined) {
        updates.push(`theme_config = $${idx++}`);
        values.push(typeof body.theme_config === 'object' ? JSON.stringify(body.theme_config) : body.theme_config);
      }
      if (body.status !== undefined) {
        updates.push(`status = $${idx++}`);
        values.push(body.status);
      }
      if (body.is_published !== undefined) {
        updates.push(`is_published = $${idx++}`);
        values.push(Boolean(body.is_published));
      }

      if (updates.length === 0) {
        return NextResponse.json({ success: true });
      }

      values.push(id, creatorId);
      const res = await queryDb(
        `UPDATE websites SET ${updates.join(', ')} WHERE id = $${idx++} AND creator_id = $${idx++} RETURNING *`,
        values
      );

      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Website not found or unauthorized.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, website: res.rows[0] });
    }

    // 7. Delete Website
    if (action === 'delete_website') {
      const id = Number(body.id);
      const creatorId = Number(body.creatorId);
      if (!id || !creatorId) {
        return NextResponse.json({ success: false, error: 'Website ID and Creator ID required.' }, { status: 400 });
      }

      const res = await queryDb('DELETE FROM websites WHERE id = $1 AND creator_id = $2 RETURNING id', [id, creatorId]);
      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Website not found or unauthorized.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, id });
    }

    // 8. Update Creator Profile
    if (action === 'update_profile') {
      const creatorId = Number(body.creatorId);
      if (!creatorId) {
        return NextResponse.json({ success: false, error: 'Creator ID required.' }, { status: 400 });
      }

      const res = await queryDb(
        `UPDATE creators 
         SET name = COALESCE($1, name),
             phone = COALESCE($2, phone),
             bio = COALESCE($3, bio),
             avatar_url = COALESCE($4, avatar_url)
         WHERE id = $5
         RETURNING id, name, email, phone, bio, avatar_url, is_active, is_verified, two_factor_enabled, updated_at`,
        [body.name, body.phone, body.bio, body.avatar_url, creatorId]
      );
      return NextResponse.json({ success: true, creator: res.rows[0] });
    }

    // 9. Change Creator Password
    if (action === 'change_password') {
      const creatorId = Number(body.creatorId);
      const { currentPassword, newPassword } = body;

      if (!creatorId || !currentPassword || !newPassword) {
        return NextResponse.json({ success: false, error: 'All password fields are required.' }, { status: 400 });
      }

      const c = await queryDb('SELECT password FROM creators WHERE id = $1', [creatorId]);
      if (c.rows.length === 0 || c.rows[0].password !== currentPassword) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 401 });
      }

      await queryDb('UPDATE creators SET password = $1 WHERE id = $2', [newPassword, creatorId]);
      return NextResponse.json({ success: true, message: 'Password updated successfully.' });
    }

    // 10. Toggle 2FA
    if (action === 'toggle_2fa') {
      const creatorId = Number(body.creatorId);
      const enabled = Boolean(body.enabled);
      const res = await queryDb('UPDATE creators SET two_factor_enabled = $1 WHERE id = $2 RETURNING two_factor_enabled', [enabled, creatorId]);
      return NextResponse.json({ success: true, two_factor_enabled: res.rows[0]?.two_factor_enabled });
    }

    // 11. Create Support Ticket
    if (action === 'create_ticket') {
      const creatorId = Number(body.creatorId);
      const { subject, category, priority, message } = body;

      if (!creatorId || !subject || !message) {
        return NextResponse.json({ success: false, error: 'Subject and message are required.' }, { status: 400 });
      }

      const c = await queryDb('SELECT name, email FROM creators WHERE id = $1', [creatorId]);
      if (c.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Creator not found.' }, { status: 404 });
      }

      const creator = c.rows[0];
      const ticketNumber = 'TKT-' + Math.floor(100000 + Math.random() * 900000);

      const ticketRes = await queryDb(
        `INSERT INTO support (ticket_number, creator_id, requester_name, requester_email, subject, category, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN')
         RETURNING *`,
        [ticketNumber, creatorId, creator.name, creator.email, subject, category || 'TECHNICAL', priority || 'MEDIUM']
      );
      const ticket = ticketRes.rows[0];

      await queryDb(
        `INSERT INTO support_messages (support_id, sender_type, sender_id, sender_name, message)
         VALUES ($1, 'CREATOR', $2, $3, $4)`,
        [ticket.id, creatorId, creator.name, message]
      );

      return NextResponse.json({ success: true, ticket });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('Creator POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
