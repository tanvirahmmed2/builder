import { NextResponse } from 'next/server';

/**
 * Multi-tenant resolver middleware
 * Extracts subdomain or custom domain from Host header or query param.
 * Injects `x-tenant-subdomain` and rewrites to appropriate portfolio route if needed.
 */
export function resolveTenant(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Extract query override (e.g. ?subdomain=alex-design) or header
  const querySubdomain = url.searchParams.get('subdomain');
  
  // Exclude primary app domains and local development hostnames
  const appDomains = ['localhost:3000', '127.0.0.1:3000', 'saasplatform.com'];
  const isAppHost = appDomains.some((d) => hostname.includes(d));

  let tenantSubdomain = null;

  if (querySubdomain) {
    tenantSubdomain = querySubdomain;
  } else if (!isAppHost && hostname) {
    // e.g., alex-design.saasplatform.com or alex-design.localhost:3000
    const parts = hostname.split('.');
    if (parts.length > (hostname.includes('localhost') ? 1 : 2)) {
      tenantSubdomain = parts[0];
    }
  }

  // Clone headers and attach tenant context
  const requestHeaders = new Headers(request.headers);
  if (tenantSubdomain) {
    requestHeaders.set('x-tenant-subdomain', tenantSubdomain);
  }

  return { tenantSubdomain, requestHeaders };
}
