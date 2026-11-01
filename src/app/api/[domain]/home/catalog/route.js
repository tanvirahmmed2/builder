import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { resolveWebsiteFromRequest } from '@/lib/middleware/user';

export async function GET(req, { params }) {
  try {
    const { domain } = await params;
    const website = await resolveWebsiteFromRequest(req, domain);

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const websiteId = website.id;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || website.website_type || 'ecommerce';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const offset = (page - 1) * limit;
    const search = searchParams.get('q') || '';
    const categorySlug = searchParams.get('category') || '';

    // E-COMMERCE CATALOG
    if (type === 'ecommerce' || type === 'store') {
      let queryStr = `
        SELECT p.id, p.name, p.slug, p.base_price, p.compare_price, p.thumbnail_url,
               p.stock_quantity, p.is_featured, c.name AS category_name, c.slug AS category_slug,
               b.name AS brand_name
        FROM website_ecommerce_products p
        LEFT JOIN website_ecommerce_categories c ON p.category_id = c.id AND c.website_id = $1
        LEFT JOIN website_ecommerce_brands b ON p.brand_id = b.id AND b.website_id = $1
        WHERE p.website_id = $1 AND p.is_active = TRUE
      `;
      const queryParams = [websiteId];

      if (search) {
        queryParams.push(`%${search}%`);
        queryStr += ` AND (p.name ILIKE $${queryParams.length} OR p.description ILIKE $${queryParams.length})`;
      }
      if (categorySlug) {
        queryParams.push(categorySlug);
        queryStr += ` AND c.slug = $${queryParams.length}`;
      }

      queryStr += ` ORDER BY p.is_featured DESC, p.id DESC LIMIT ${limit} OFFSET ${offset}`;
      const productsRes = await queryDb(queryStr, queryParams);

      const [categoriesRes, brandsRes] = await Promise.all([
        queryDb('SELECT id, name, slug, image_url FROM website_ecommerce_categories WHERE website_id = $1 AND is_active = TRUE ORDER BY sort_order ASC', [websiteId]),
        queryDb('SELECT id, name, slug, logo_url FROM website_ecommerce_brands WHERE website_id = $1 AND is_active = TRUE', [websiteId])
      ]);

      return NextResponse.json({
        success: true,
        type: 'ecommerce',
        data: {
          items: productsRes.rows,
          categories: categoriesRes.rows,
          brands: brandsRes.rows,
          page,
          limit
        }
      });
    }

    // RESTAURANT MENU CATALOG
    if (type === 'restaurant' || type === 'food') {
      const [itemsRes, catsRes] = await Promise.all([
        queryDb(
          `SELECT i.id, i.name, i.slug, i.description, i.base_price, i.image_url, 
                  i.preparation_time_minutes, i.is_vegetarian, i.is_spicy, i.is_available,
                  c.name AS category_name, c.slug AS category_slug
           FROM website_restaurant_menu_items i
           LEFT JOIN website_restaurant_categories c ON i.category_id = c.id AND c.website_id = $1
           WHERE i.website_id = $1 AND i.is_available = TRUE
           ORDER BY c.sort_order ASC, i.id ASC`,
          [websiteId]
        ),
        queryDb('SELECT id, name, slug, image_url FROM website_restaurant_categories WHERE website_id = $1 AND is_active = TRUE ORDER BY sort_order ASC', [websiteId])
      ]);

      return NextResponse.json({
        success: true,
        type: 'restaurant',
        data: {
          items: itemsRes.rows,
          categories: catsRes.rows
        }
      });
    }

    // PORTFOLIO CATALOG
    if (type === 'portfolio') {
      const [projectsRes, servicesRes, skillsRes, experiencesRes] = await Promise.all([
        queryDb(
          `SELECT p.id, p.title, p.slug, p.summary, p.thumbnail_url, p.project_url, p.github_url, p.is_featured,
                  c.name AS category_name, c.slug AS category_slug
           FROM website_portfolio_projects p
           LEFT JOIN website_portfolio_categories c ON p.category_id = c.id AND c.website_id = $1
           WHERE p.website_id = $1
           ORDER BY p.is_featured DESC, p.id DESC`,
          [websiteId]
        ),
        queryDb('SELECT id, title, slug, summary, icon_url, starting_price FROM website_portfolio_services WHERE website_id = $1 AND is_active = TRUE', [websiteId]),
        queryDb('SELECT id, skill_name, proficiency_percentage, icon_url FROM website_portfolio_skills WHERE website_id = $1 ORDER BY sort_order ASC', [websiteId]),
        queryDb('SELECT id, company_name, designation, location, start_date, end_date, is_current, description FROM website_portfolio_work_experiences WHERE website_id = $1 ORDER BY start_date DESC', [websiteId])
      ]);

      return NextResponse.json({
        success: true,
        type: 'portfolio',
        data: {
          projects: projectsRes.rows,
          services: servicesRes.rows,
          skills: skillsRes.rows,
          experiences: experiencesRes.rows
        }
      });
    }

    // ORGANIZATION DIRECTORY CATALOG
    if (type === 'organization' || type === 'org') {
      const [deptRes, membersRes, jobsRes] = await Promise.all([
        queryDb('SELECT id, name, slug, description FROM website_org_departments WHERE website_id = $1 AND is_active = TRUE', [websiteId]),
        queryDb(
          `SELECT m.id, m.full_name, m.email, m.phone, m.avatar_url, m.bio,
                  d.name AS department_name, des.title AS designation_title
           FROM website_org_members m
           LEFT JOIN website_org_departments d ON m.department_id = d.id AND d.website_id = $1
           LEFT JOIN website_org_designations des ON m.designation_id = des.id AND des.website_id = $1
           WHERE m.website_id = $1 AND m.status = 'active'
           ORDER BY m.sort_order ASC, m.id ASC`,
          [websiteId]
        ),
        queryDb('SELECT id, title, slug, job_type, location, salary_range, description FROM website_org_jobs WHERE website_id = $1 AND status = \'open\' ORDER BY id DESC', [websiteId])
      ]);

      return NextResponse.json({
        success: true,
        type: 'organization',
        data: {
          departments: deptRes.rows,
          members: membersRes.rows,
          jobs: jobsRes.rows
        }
      });
    }

    return NextResponse.json({ success: true, type, data: { items: [] } });
  } catch (error) {
    console.error('Home catalog API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch catalog' }, { status: 500 });
  }
}

