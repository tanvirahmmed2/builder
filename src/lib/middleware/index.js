import { NextResponse } from 'next/server';
import { resolveTenant } from './tenant';
import { extractAuthSession } from './auth';
import { checkRoleAccess } from './roleGuard';

/**
 * Composite middleware pipeline
 */
export function runMiddleware(request) {
  const { pathname } = request.nextUrl;

  // Skip static assets and internal next requests
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/trpc') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. Resolve Multi-Tenant headers
  const { tenantSubdomain, requestHeaders } = resolveTenant(request);

  // 2. Extract Auth Sessions
  const authSession = extractAuthSession(request);

  // 3. Evaluate Role Guards
  const access = checkRoleAccess(pathname, authSession);
  if (!access.allowed) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Forward request with injected tenant headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
