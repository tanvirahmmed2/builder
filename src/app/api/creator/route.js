import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorIdParam = searchParams.get('creatorId');

    let creator = null;
    if (creatorIdParam && !isNaN(Number(creatorIdParam))) {
      const cRes = await queryDb(
        `SELECT id, name, email, phone, avatar_url, bio, is_active, is_verified, 
                two_factor_enabled, last_login_at, created_at, updated_at 
         FROM creators WHERE id = $1 LIMIT 1`,
        [Number(creatorIdParam)]
      );
      creator = cRes.rows[0] || null;
    } else {
      const cRes = await queryDb(
        `SELECT id, name, email, phone, avatar_url, bio, is_active, is_verified, 
                two_factor_enabled, last_login_at, created_at, updated_at 
         FROM creators ORDER BY id ASC LIMIT 1`
      );
      creator = cRes.rows[0] || null;
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
        `SELECT * FROM support WHERE requester_email = $1 ORDER BY id DESC LIMIT 10`,
        [creator.email]
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

    // 1. Creator Registration (NO ROLE)
    if (action === 'register') {
      const d = body.creatorData || body;
      if (!d.name || !d.email || !d.password) {
        return NextResponse.json({ success: false, error: 'Name, email, and password are required.' }, { status: 400 });
      }

      const existing = await queryDb('SELECT id FROM creators WHERE email = $1 LIMIT 1', [d.email]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
      }

      const res = await queryDb(
        `INSERT INTO creators (name, email, password, phone, bio, avatar_url, is_active, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE, FALSE)
         RETURNING id, name, email, phone, bio, avatar_url, created_at`,
        [
          d.name.trim(),
          d.email.trim().toLowerCase(),
          d.password,
          d.phone || null,
          d.bio || 'New Platform Creator',
          d.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        ]
      );
      return NextResponse.json({ success: true, creator: res.rows[0] });
    }

    // 2. Creator Login
    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email and password required.' }, { status: 400 });
      }

      const res = await queryDb(
        `SELECT id, name, email, password, phone, avatar_url, bio, is_active, is_verified, two_factor_enabled 
         FROM creators WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [email.trim()]
      );
      const user = res.rows[0];
      if (!user || user.password !== password) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

      // Update last login
      await queryDb('UPDATE creators SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

      const { password: _, ...safeUser } = user;
      return NextResponse.json({ success: true, creator: safeUser });
    }

    // 3. Creator Account Recovery
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
        `INSERT INTO support (ticket_number, requester_name, requester_email, subject, category, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
         RETURNING *`,
        [ticketNumber, creator.name, creator.email, subject, category || 'TECHNICAL', priority || 'MEDIUM']
      );
      const ticket = ticketRes.rows[0];

      await queryDb(
        `INSERT INTO support_messages (support_id, sender_type, sender_id, sender_name, message)
         VALUES ($1, 'USER', $2, $3, $4)`,
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
