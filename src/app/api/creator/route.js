import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { queryDb } from '@/lib/db/pg';
import { sendEmail } from '@/lib/db/mailer';
import { SITE_NAME } from '@/lib/db/secret';
import {
  authenticateCreator,
  getCreatorSession,
  clearCreatorSessionCookie,
  setCreatorSessionCookie,
  generateToken,
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

    // 1. Creator Registration (unverified, captures prospect lead, sends 6-digit verification code)
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
      // Generate 6-digit numeric verification code
      const verificationCode = crypto.randomInt(100000, 999999).toString();

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
          verificationCode,
        ]
      );

      const newCreator = res.rows[0];

      // Save required creator prospect data in leads table
      try {
        await queryDb(
          `INSERT INTO leads (name, email, phone, company, source, status, notes)
           VALUES ($1, $2, $3, $4, 'CREATOR_REGISTRATION', 'NEW', $5)`,
          [
            d.name.trim(),
            cleanEmail,
            d.phone ? d.phone.trim() : null,
            d.company ? d.company.trim() : 'Creator Studio',
            `Creator registered. Creator ID: ${newCreator.id}`,
          ]
        );
      } catch (leadErr) {
        console.warn('Notice inserting lead for new creator:', leadErr.message);
      }

      // Build verification URL for 1-click verification
      const origin =
        request.headers.get('origin') ||
        (request.headers.get('host')
          ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
          : '') ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';

      const verifyUrl = `${origin}/creator/verify?token=${verificationCode}&email=${encodeURIComponent(cleanEmail)}`;

      // Send Verification Email via Brevo
      try {
        await sendEmail({
          to: cleanEmail,
          subject: `Your Verification Code: ${verificationCode} - ${SITE_NAME}`,
          html: `
            <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; color: #1e293b;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Welcome to ${SITE_NAME}, ${newCreator.name}!</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for joining our creator platform. Use the 6-digit verification code below to activate your creator account:
              </p>
              <div style="background: #f8fafc; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5;">${verificationCode}</span>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${verifyUrl}" style="background: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 10px; display: inline-block;">
                  Or Click Here to Verify Instantly →
                </a>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                This code and link will expire in 24 hours. If you did not create an account, please ignore this email.
              </p>
            </div>
          `,
          text: `Hello ${newCreator.name},\n\nYour ${SITE_NAME} creator verification code is: ${verificationCode}\n\nOr verify directly at:\n${verifyUrl}\n\nExpires in 24 hours.`,
        });
      } catch (mailErr) {
        console.warn('Notice sending creator verification email via Brevo:', mailErr.message);
      }

      return NextResponse.json({
        success: true,
        message: 'Account registered successfully! A 6-digit verification code has been sent to your email.',
        creator: newCreator,
      });
    }

    // 2. Creator Account Email Verification (accepts 6-digit code or URL token)
    if (action === 'verify') {
      const { token, code, email } = body;
      const candidateCode = String(code || token || '').trim();

      if (!candidateCode || !email) {
        return NextResponse.json(
          { success: false, error: 'Verification code and email are required.' },
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

      if (!creator.verification_code || creator.verification_code.trim() !== candidateCode) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification code. Please double check the 6-digit code in your email.' },
          { status: 400 }
        );
      }

      if (creator.verification_expires_at && new Date(creator.verification_expires_at) < new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: 'This verification code has expired. Please request a new code.',
            expired: true,
          },
          { status: 400 }
        );
      }

      // Mark creator as verified
      await queryDb(
        `UPDATE creators 
         SET is_verified = TRUE, verification_code = NULL, verification_expires_at = NULL 
         WHERE id = $1`,
        [creator.id]
      );

      // Update corresponding lead status to QUALIFIED
      try {
        await queryDb(
          `UPDATE leads 
           SET status = 'QUALIFIED', notes = COALESCE(notes, '') || ' | Email verified' 
           WHERE LOWER(email) = $1`,
          [cleanEmail]
        );
      } catch (leadErr) {
        console.warn('Notice updating lead to QUALIFIED on verification:', leadErr.message);
      }

      // Generate session token and set HTTP-only cookie for immediate login
      const sessionToken = generateToken(
        { id: creator.id, email: cleanEmail, role: 'creator', type: 'creator' },
        '7d'
      );

      const resp = NextResponse.json({
        success: true,
        message: 'Your creator account has been successfully verified! You are now logged in.',
        creator: {
          id: creator.id,
          name: creator.name,
          email: creator.email,
          isVerified: true,
        },
        token: sessionToken,
      });

      await setCreatorSessionCookie(resp, sessionToken);
      return resp;
    }

    // 3. Resend Verification Link / Code
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

      // Generate fresh 6-digit code
      const newCode = crypto.randomInt(100000, 999999).toString();
      await queryDb(
        `UPDATE creators 
         SET verification_code = $1, verification_expires_at = CURRENT_TIMESTAMP + INTERVAL '24 hours' 
         WHERE id = $2`,
        [newCode, creator.id]
      );

      const origin =
        request.headers.get('origin') ||
        (request.headers.get('host')
          ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
          : '') ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';

      const verifyUrl = `${origin}/creator/verify?token=${newCode}&email=${encodeURIComponent(cleanEmail)}`;

      try {
        await sendEmail({
          to: cleanEmail,
          subject: `Your Verification Code: ${newCode} - ${SITE_NAME}`,
          html: `
            <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; color: #1e293b;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Verify Your Creator Account</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Hello ${creator.name}, you requested a new verification code for your ${SITE_NAME} creator account:
              </p>
              <div style="background: #f8fafc; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5;">${newCode}</span>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${verifyUrl}" style="background: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 10px; display: inline-block;">
                  Or Click Here to Verify Instantly →
                </a>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                This code will expire in 24 hours.
              </p>
            </div>
          `,
          text: `Hello ${creator.name},\n\nYour new verification code is: ${newCode}\n\nOr verify at:\n${verifyUrl}\n\nExpires in 24 hours.`,
        });
      } catch (mailErr) {
        console.warn('Notice resending creator verification email via Brevo:', mailErr.message);
      }

      return NextResponse.json({
        success: true,
        message: 'A new 6-digit verification code has been sent to your email.',
      });
    }

    // 4. Creator Login (supports 2FA OTP, checks active/verified, sets cookie)
    if (action === 'login') {
      const { email, password, twoFactorCode } = body;
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || 'Unknown';

      try {
        const result = await authenticateCreator(email, password, { ip, userAgent, twoFactorCode });
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
            twoFactorRequired: Boolean(authErr.twoFactorRequired),
            twoFactorInvalid: Boolean(authErr.twoFactorInvalid),
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

    // 7. Creator Account Recovery (sends 6-digit reset code via Brevo)
    if (action === 'recover') {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email address is required.' }, { status: 400 });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const recoveryCode = crypto.randomInt(100000, 999999).toString();

      const res = await queryDb(
        `UPDATE creators 
         SET recovery_token = $1, recovery_token_expires_at = CURRENT_TIMESTAMP + INTERVAL '1 hour'
         WHERE LOWER(email) = LOWER($2)
         RETURNING id, name, email`,
        [recoveryCode, cleanEmail]
      );

      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'No creator account found with this email address.' }, { status: 404 });
      }

      const creator = res.rows[0];

      // Send 6-digit Recovery Code via Brevo
      try {
        await sendEmail({
          to: cleanEmail,
          subject: `Your Password Reset Code: ${recoveryCode} - ${SITE_NAME}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Password Reset Code</h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                Hello ${creator.name}, you requested to reset your password on ${SITE_NAME}. Use the 6-digit code below to set your new password:
              </p>
              <div style="background: #f8fafc; border: 2px dashed #e11d48; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #e11d48;">${recoveryCode}</span>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                This code will expire in 1 hour. If you did not request a password reset, please ignore this email or update your credentials.
              </p>
            </div>
          `,
          text: `Hello ${creator.name},\n\nYour ${SITE_NAME} password reset code is: ${recoveryCode}\n\nIt expires in 1 hour.`,
        });
      } catch (mailErr) {
        console.warn('Notice sending creator password reset email via Brevo:', mailErr.message);
      }

      return NextResponse.json({
        success: true,
        message: 'A 6-digit password reset code has been sent to your email.',
      });
    }

    // 8. Creator Password Reset (validates 6-digit code and updates password hash)
    if (action === 'reset_password') {
      const { email, code, token, newPassword } = body;
      const recoveryCode = String(code || token || '').trim();

      if (!email || !recoveryCode || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Email, recovery code, and new password are required.' },
          { status: 400 }
        );
      }

      if (String(newPassword).length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const res = await queryDb(
        `SELECT id, name, email, recovery_token, recovery_token_expires_at 
         FROM creators WHERE LOWER(email) = $1 LIMIT 1`,
        [cleanEmail]
      );

      const creator = res.rows[0];
      if (!creator) {
        return NextResponse.json({ success: false, error: 'Creator account not found.' }, { status: 404 });
      }

      if (!creator.recovery_token || creator.recovery_token.trim() !== recoveryCode) {
        return NextResponse.json(
          { success: false, error: 'Invalid reset code. Please check the code received in your email.' },
          { status: 400 }
        );
      }

      if (creator.recovery_token_expires_at && new Date(creator.recovery_token_expires_at) < new Date()) {
        return NextResponse.json(
          { success: false, error: 'This reset code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Hash new password and clear recovery token
      const hashedPassword = await hashPassword(newPassword);
      await queryDb(
        `UPDATE creators 
         SET password = $1, recovery_token = NULL, recovery_token_expires_at = NULL 
         WHERE id = $2`,
        [hashedPassword, creator.id]
      );

      return NextResponse.json({
        success: true,
        message: 'Your password has been successfully reset. You can now log in with your new password.',
      });
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
          const rawSubdomain = (body.subdomain || `portfolio-${creatorId}`).toLowerCase().replace(/[^a-z0-9-]/g, '');
          if (!rawSubdomain || rawSubdomain.length < 3) {
            return NextResponse.json({ success: false, error: 'Subdomain is mandatory and must be at least 3 characters.' }, { status: 400 });
          }

          const existingSub = await queryDb('SELECT id FROM websites WHERE LOWER(subdomain) = $1 LIMIT 1', [rawSubdomain]);
          if (existingSub.rows.length > 0) {
            return NextResponse.json({ success: false, error: `Subdomain "${rawSubdomain}" is already claimed. Please choose another.` }, { status: 409 });
          }

          const themeConfig = {
            primaryColor: '#6366f1',
            fontFamily: 'Inter',
            accent: '#10b981',
            mode: 'dark',
          };

          const wCreate = await queryDb(
            `INSERT INTO websites (creator_id, name, subdomain, custom_domain, status, storage_used_mb, is_published, theme_config)
             VALUES ($1, $2, $3, $4, 'ACTIVE', 15, TRUE, $5)
             RETURNING *`,
            [
              creatorId,
              (body.websiteName || 'My Portfolio & Store').trim(),
              rawSubdomain,
              body.customDomain || null,
              JSON.stringify(themeConfig),
            ]
          );
          website = wCreate.rows[0];
          await seedWebsiteDefaults(website.id, website.name, themeConfig);
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
      const newWebsite = res.rows[0];
      await seedWebsiteDefaults(newWebsite.id, newWebsite.name, themeConfig);
      return NextResponse.json({ success: true, website: newWebsite });
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

async function seedWebsiteDefaults(websiteId, websiteName, themeConfig = {}) {
  try {
    const primaryColor = themeConfig.primaryColor || '#6366f1';
    const fontFamily = themeConfig.fontFamily || 'Inter';

    // 1. Settings
    await queryDb(`
      INSERT INTO website_settings (website_id, site_title, tagline, primary_color, font_family)
      VALUES ($1, $2, 'Portfolio & Showcase', $3, $4)
      ON CONFLICT (website_id) DO NOTHING
    `, [websiteId, websiteName || 'My Portfolio & Store', primaryColor, fontFamily]);

    // 2. Modules
    const defaultModules = [
      { name: 'Products & Store', slug: 'products', description: 'E-commerce products, digital downloads & inventory' },
      { name: 'Blog & Articles', slug: 'blogs', description: 'Articles, news and blog publishing' },
      { name: 'Appointment Booking', slug: 'appointments', description: 'Client booking and schedule management' },
      { name: 'Support Tickets', slug: 'support', description: 'Customer inquiry and support ticketing' },
      { name: 'Portfolio Gallery', slug: 'gallery', description: 'Media showcase and portfolio visual gallery' },
      { name: 'Experiences Timeline', slug: 'experiences', description: 'Work history, education and milestones' },
      { name: 'Services Offered', slug: 'services', description: 'Bespoke service packages and pricing' },
      { name: 'Client Testimonials', slug: 'testimonials', description: 'Customer reviews and endorsements' },
      { name: 'Contact Inquiries', slug: 'contact', description: 'Direct contact messaging and leads' },
    ];
    for (const m of defaultModules) {
      await queryDb(`
        INSERT INTO website_modules (website_id, name, slug, description, is_enabled)
        VALUES ($1, $2, $3, $4, TRUE)
        ON CONFLICT (website_id, slug) DO NOTHING
      `, [websiteId, m.name, m.slug, m.description]);
    }

    // 3. Roles
    const defaultRoles = [
      { name: 'Owner', slug: 'owner', description: 'Full owner access with all privileges', is_system: true },
      { name: 'Admin', slug: 'admin', description: 'Site administrator with full management rights', is_system: true },
      { name: 'Editor', slug: 'editor', description: 'Content editor for blogs, products & portfolio', is_system: false },
      { name: 'Support Specialist', slug: 'support-specialist', description: 'Support ticket and inquiry handler', is_system: false },
    ];
    for (const r of defaultRoles) {
      await queryDb(`
        INSERT INTO website_roles (website_id, name, slug, description, is_system)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (website_id, slug) DO NOTHING
      `, [websiteId, r.name, r.slug, r.description, r.is_system]);
    }

    // 4. Permissions
    const modRows = await queryDb('SELECT id, slug FROM website_modules WHERE website_id = $1', [websiteId]);
    const actions = ['view', 'create', 'edit', 'delete', 'manage'];
    for (const mod of modRows.rows) {
      for (const act of actions) {
        const pName = `${act.charAt(0).toUpperCase() + act.slice(1)} ${mod.slug}`;
        const pSlug = `${mod.slug}.${act}`;
        await queryDb(`
          INSERT INTO website_permissions (website_id, module_id, name, slug, action, is_custom)
          VALUES ($1, $2, $3, $4, $5, FALSE)
          ON CONFLICT (website_id, slug) DO NOTHING
        `, [websiteId, mod.id, pName, pSlug, act]);
      }
    }

    // 5. Grant Owner all permissions
    const ownerRole = await queryDb('SELECT id FROM website_roles WHERE website_id = $1 AND slug = $2', [websiteId, 'owner']);
    if (ownerRole.rows.length > 0) {
      const allPerms = await queryDb('SELECT id FROM website_permissions WHERE website_id = $1', [websiteId]);
      for (const p of allPerms.rows) {
        await queryDb(`
          INSERT INTO website_role_permissions (role_id, permission_id)
          VALUES ($1, $2)
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [ownerRole.rows[0].id, p.id]);
      }
    }

    // 6. Sample services, experiences, products
    await queryDb(`
      INSERT INTO website_services (website_id, title, slug, description, price_starting_at, features) VALUES
      ($1, 'Full-Stack Web Architecture', 'full-stack-architecture', 'Bespoke web applications built with Next.js & PostgreSQL.', 1499, '["Full-Stack Design", "Modern Database", "SEO Ready"]'::jsonb),
      ($1, 'UI/UX & Brand Design', 'ui-ux-design', 'Award-winning visual identities and interactive component systems.', 899, '["Design System", "Prototypes", "Responsive UI"]'::jsonb)
      ON CONFLICT (website_id, slug) DO NOTHING
    `, [websiteId]);

    await queryDb(`
      INSERT INTO website_products (website_id, name, slug, description, short_description, price_in_cents, status, is_featured, is_digital) VALUES
      ($1, 'Flagship Creator Digital Bundle', 'creator-bundle', 'Complete suite of digital assets, design kits, and templates.', 'Exclusive creator starter bundle.', 3900, 'ACTIVE', TRUE, TRUE)
      ON CONFLICT (website_id, slug) DO NOTHING
    `, [websiteId]);

    await queryDb(`
      INSERT INTO website_blogs (website_id, title, slug, excerpt, content, is_published) VALUES
      ($1, 'Welcome to Our New Website', 'welcome-to-our-new-website', 'We are delighted to launch our official website and showcase our latest works.', '<p>Welcome! Explore our services, portfolio, and digital offerings. Feel free to contact us or book a consultation anytime.</p>', TRUE)
      ON CONFLICT (website_id, slug) DO NOTHING
    `, [websiteId]);
  } catch (err) {
    console.error('Error seeding website defaults:', err);
  }
}

