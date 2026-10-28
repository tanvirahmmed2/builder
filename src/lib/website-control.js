import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { resolveWebsiteFromRequest, getWebsiteUserSession } from '@/lib/middleware/user';

/**
 * Resolves the target website from the request context and params.
 * Strictly guarantees multi-website data scoping.
 */
export async function getControlWebsite(request, context) {
  try {
    const params = context?.params ? await context.params : {};
    const domain = params?.domain;
    const website = await resolveWebsiteFromRequest(request, domain);
    return website;
  } catch (err) {
    console.error('Error resolving control website context:', err);
    return null;
  }
}

/**
 * Standard helper to extract website and session in one call.
 */
export async function getControlAuth(request, context) {
  const website = await getControlWebsite(request, context);
  if (!website) {
    return { website: null, user: null, errorResponse: NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 }) };
  }

  const session = await getWebsiteUserSession(request, website.id);
  const user = session?.user || session || null;

  return { website, user, errorResponse: null };
}

/**
 * Records an activity or login entry in website_activity_logs.
 */
export async function logWebsiteActivity({ websiteId, userId = null, userName = null, branchId = null, type = 'activity', action, details = '', req = null }) {
  try {
    let ipAddress = '127.0.0.1';
    let userAgent = 'Unknown';

    if (req && req.headers) {
      ipAddress = (
        (typeof req.headers.get === 'function' ? req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') : null) ||
        req.headers['x-forwarded-for'] ||
        '127.0.0.1'
      ).split(',')[0].trim();

      userAgent = (
        (typeof req.headers.get === 'function' ? req.headers.get('user-agent') : null) ||
        req.headers['user-agent'] ||
        'Unknown'
      );
    }

    await queryDb(
      `INSERT INTO website_activity_logs (website_id, user_id, user_name, branch_id, type, action, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [websiteId, userId, userName, branchId, type, action, details, ipAddress, userAgent]
    );
  } catch (err) {
    console.error('Failed to log website activity:', err);
  }
}
