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

    const [faqsRes, categoriesRes] = await Promise.all([
      queryDb(
        `SELECT f.id, f.category_id, f.question, f.answer, f.sort_order,
                c.name AS category_name
         FROM website_faqs f
         LEFT JOIN website_faq_categories c ON f.category_id = c.id AND c.website_id = $1
         WHERE f.website_id = $1 AND f.is_published = TRUE
         ORDER BY f.sort_order ASC, f.id ASC`,
        [websiteId]
      ),
      queryDb('SELECT id, name, slug FROM website_faq_categories WHERE website_id = $1 AND is_active = TRUE ORDER BY sort_order ASC', [websiteId])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        faqs: faqsRes.rows,
        categories: categoriesRes.rows
      }
    });
  } catch (error) {
    console.error('Home FAQs API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

