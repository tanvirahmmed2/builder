import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorIdParam = searchParams.get('creatorId');

    let creator = null;
    if (creatorIdParam && !isNaN(Number(creatorIdParam))) {
      const cRes = await queryDb('SELECT * FROM creators WHERE id = $1 LIMIT 1', [Number(creatorIdParam)]);
      creator = cRes.rows[0] || null;
    } else {
      const cRes = await queryDb('SELECT * FROM creators ORDER BY id ASC LIMIT 1');
      creator = cRes.rows[0] || null;
    }

    let portfolio = null;
    if (creator) {
      const pRes = await queryDb('SELECT * FROM portfolios WHERE creator_id = $1 LIMIT 1', [creator.id]);
      portfolio = pRes.rows[0] || null;
    }
    if (!portfolio) {
      const pRes = await queryDb('SELECT * FROM portfolios ORDER BY id ASC LIMIT 1');
      portfolio = pRes.rows[0] || null;
    }

    const portfolioId = portfolio?.id;

    const [creatorsRes, packagesRes, blogsRes, apptsRes, expRes, reviewsRes] = await Promise.all([
      queryDb('SELECT id, name, email, role, phone, avatar_url FROM creators ORDER BY id ASC'),
      queryDb('SELECT * FROM packages WHERE is_active = TRUE ORDER BY id ASC'),
      portfolioId ? queryDb('SELECT * FROM portfolio_blogs WHERE portfolio_id = $1 ORDER BY id DESC', [portfolioId]) : { rows: [] },
      portfolioId ? queryDb('SELECT * FROM portfolio_appointments WHERE portfolio_id = $1 ORDER BY id DESC', [portfolioId]) : { rows: [] },
      portfolioId ? queryDb('SELECT * FROM portfolio_experiences WHERE portfolio_id = $1 ORDER BY id DESC', [portfolioId]) : { rows: [] },
      portfolioId ? queryDb('SELECT * FROM portfolio_reviews WHERE portfolio_id = $1 ORDER BY id DESC', [portfolioId]) : { rows: [] },
    ]);

    return NextResponse.json({
      success: true,
      creator,
      portfolio,
      creators: creatorsRes.rows,
      blogs: blogsRes.rows,
      appointments: apptsRes.rows,
      experiences: expRes.rows,
      reviews: reviewsRes.rows,
      packages: packagesRes.rows,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Creator Registration
    if (action === 'register') {
      const d = body.creatorData || body;
      const res = await queryDb(
        `INSERT INTO creators (name, email, password_hash, role, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, role, phone`,
        [d.name, d.email, d.password || '123', d.role || 'creator', d.phone || null]
      );
      return NextResponse.json({ success: true, creator: res.rows[0] });
    }

    // 2. Creator Account Recovery
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
      return NextResponse.json({ success: true, token, message: 'Recovery token generated.' });
    }

    // 3. Purchase Package & Create Subscription -> Auto Provision Tenant Portfolio
    if (action === 'purchase_subscription') {
      const creatorId = Number(body.creatorId) || 1;
      const packageId = Number(body.packageId) || 1;
      const paymentMethod = body.paymentMethod || 'CARD';

      const pkgRes = await queryDb('SELECT * FROM packages WHERE id = $1 LIMIT 1', [packageId]);
      const pkg = pkgRes.rows[0] || { price: 29 };

      const subRes = await queryDb(
        `INSERT INTO subscriptions (creator_id, package_id, status, current_period_start, current_period_end)
         VALUES ($1, $2, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')
         RETURNING *`,
        [creatorId, packageId]
      );

      const payRes = await queryDb(
        `INSERT INTO payments (subscription_id, creator_id, amount, currency, status, payment_method)
         VALUES ($1, $2, $3, 'USD', 'COMPLETED', $4)
         RETURNING *`,
        [subRes.rows[0].id, creatorId, pkg.price || 29, paymentMethod]
      );

      // Auto-provision portfolio if none exists
      let portfolio = null;
      const pCheck = await queryDb('SELECT * FROM portfolios WHERE creator_id = $1 LIMIT 1', [creatorId]);
      if (pCheck.rows.length > 0) {
        portfolio = pCheck.rows[0];
      } else {
        const pCreate = await queryDb(
          `INSERT INTO portfolios (creator_id, title, subdomain)
           VALUES ($1, 'My Portfolio', $2)
           RETURNING *`,
          [creatorId, 'portfolio-' + creatorId]
        );
        portfolio = pCreate.rows[0];
      }

      return NextResponse.json({
        success: true,
        subscription: subRes.rows[0],
        payment: payRes.rows[0],
        portfolio,
      });
    }

    // 4. Update Role between 'creator' and 'manager'
    if (action === 'update_role') {
      const res = await queryDb(
        'UPDATE creators SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
        [body.role || 'creator', Number(body.creatorId)]
      );
      return NextResponse.json({ success: true, creator: res.rows[0] });
    }

    // 5. Blog Module: Create post
    if (action === 'create_blog') {
      const d = body.blogData || {};
      const slug = (d.title || 'blog').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await queryDb(
        `INSERT INTO portfolio_blogs (portfolio_id, creator_id, title, slug, summary, content, cover_image, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          d.portfolioId || 1,
          d.creatorId || 1,
          d.title || 'Untitled',
          slug,
          d.summary || '',
          d.content || '',
          d.coverImage || null,
          d.isPublished !== false,
        ]
      );
      return NextResponse.json({ success: true, blog: res.rows[0] });
    }
    if (action === 'delete_blog') {
      const res = await queryDb('DELETE FROM portfolio_blogs WHERE id = $1 RETURNING *', [body.id]);
      return NextResponse.json({ success: true, removed: res.rows[0] });
    }

    // 6. Appointment Module: Update status
    if (action === 'update_appointment') {
      const res = await queryDb(
        'UPDATE portfolio_appointments SET status = $1 WHERE id = $2 RETURNING *',
        [body.status || 'CONFIRMED', body.id]
      );
      return NextResponse.json({ success: true, appointment: res.rows[0] });
    }

    // 7. Experience Module: Create experience
    if (action === 'create_experience') {
      const d = body.experienceData || {};
      const res = await queryDb(
        `INSERT INTO portfolio_experiences (portfolio_id, company, role, location, start_date, end_date, is_current, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          d.portfolioId || 1,
          d.company || 'Company',
          d.role || 'Role',
          d.location || '',
          d.startDate || null,
          d.endDate || null,
          Boolean(d.isCurrent),
          d.description || '',
        ]
      );
      return NextResponse.json({ success: true, experience: res.rows[0] });
    }
    if (action === 'delete_experience') {
      const res = await queryDb('DELETE FROM portfolio_experiences WHERE id = $1 RETURNING *', [body.id]);
      return NextResponse.json({ success: true, removed: res.rows[0] });
    }

    // 8. Reviews Module: Moderate review
    if (action === 'moderate_review') {
      const res = await queryDb(
        'UPDATE portfolio_reviews SET status = $1 WHERE id = $2 RETURNING *',
        [body.status || 'APPROVED', body.id]
      );
      return NextResponse.json({ success: true, review: res.rows[0] });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
