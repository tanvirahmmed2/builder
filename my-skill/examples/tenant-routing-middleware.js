/**
 * my-skill/examples/tenant-routing-middleware.js
 * 
 * Reference implementation of Next.js Edge Middleware for multi-tenant domain routing.
 * Rewrites requests from subdomains (e.g. acme.buildsaas.com) and custom domains (e.g. mybrand.com)
 * into internal dynamic routes: /(storefront)/[tenantSlug]/...
 */

import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes that are global
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. Static files (e.g. favicon.ico, sitemap.xml, robots.txt, images)
     */
    '/((?!api/saas|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};

export default async function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Define SaaS base domains that serve the marketing / core platform
  const rootDomains = ['localhost:3000', 'buildsaas.com', 'staging.buildsaas.com'];

  // 1. Check if the current request is for the core SaaS platform
  const isRootDomain = rootDomains.some(root => hostname === root);

  if (isRootDomain) {
    // Standard SaaS routes (landing, pricing, /panel, /superadmin, /login)
    return NextResponse.next();
  }

  // 2. Identify Tenant Identifier from Subdomain or Custom Domain
  let tenantSlug = null;

  const isSubdomain = rootDomains.some(root => hostname.endsWith(`.${root}`));
  if (isSubdomain) {
    // Example: acme.buildsaas.com -> slug: 'acme'
    tenantSlug = hostname.split('.')[0].toLowerCase();
  } else {
    // Custom Domain: Look up slug associated with custom domain
    // In production, this lookup is cached in Edge KV / Upstash Redis / Memory cache
    tenantSlug = hostname.replace(/\./g, '-'); 
  }

  // If no valid tenant identifier resolved, redirect to root SaaS
  if (!tenantSlug) {
    return NextResponse.redirect(new URL('https://buildsaas.com', req.url));
  }

  // 3. Inject Tenant Headers for Server Components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);
  requestHeaders.set('x-original-host', hostname);

  // 4. Rewrite URL to Internal Storefront Route
  const rewriteUrl = new URL(`/(storefront)/${tenantSlug}${url.pathname}${url.search}`, req.url);

  return NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}
