import { NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware for Multi-Tenant Routing
 * 
 * Routes incoming requests:
 * 1. Base SaaS domain (disibin.com, www.disibin.com, localhost) -> Main SaaS platform
 * 2. Subdomains (shop.disibin.com, shop.localhost) -> Rewrites to /[domain]
 * 3. Custom domains (myrestaurant.com, www.myrestaurant.com) -> Rewrites to /[domain]
 */

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /_next/static (static files)
     * 2. /_next/image (image optimization files)
     * 3. Static assets with extensions (.png, .jpg, .svg, .ico, etc.)
     * 4. /favicon.ico, /robots.txt, /sitemap.xml
     * 5. /api/saas (core platform APIs)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|api/saas|.*\\.(?:jpg|jpeg|gif|png|webp|svg|ico|css|js|woff|woff2|ttf|eot|map|json|txt|xml|pdf)$).*)',
  ],
};

function normalizeHost(rawHost) {
  if (!rawHost || typeof rawHost !== 'string') return '';
  let clean = rawHost.trim().toLowerCase();
  clean = clean.replace(/^https?:\/\//i, '');
  clean = clean.split('/')[0].split('?')[0];
  clean = clean.split(':')[0]; // strip port
  return clean.trim();
}

export default function middleware(req) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const search = url.search;

  // 1. Extract and normalize requester host
  const rawHost =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    '';
  const host = normalizeHost(rawHost);

  // 2. Normalize BASE_URL
  const rawBase = process.env.BASE_URL || 'disibin.com';
  const cleanBase = normalizeHost(rawBase) || 'disibin.com';
  const baseWithoutWww = cleanBase.replace(/^www\./, '');

  // 3. Determine if requester domain is the Base SaaS platform
  const isBaseDomain =
    !host ||
    host === cleanBase ||
    host === `www.${cleanBase}` ||
    host === baseWithoutWww ||
    host === `www.${baseWithoutWww}` ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1';

  // 4. If request is on the Base SaaS domain:
  if (isBaseDomain) {
    // Let standard SaaS routes (landing, /about, /creator, /developer, etc.) proceed naturally.
    // Direct path-based tenant preview (e.g. /shop/products) is routed naturally by Next.js App Router.
    const response = NextResponse.next();
    response.headers.set('x-saas-platform', 'true');
    return response;
  }

  // 5. Identify Tenant Identifier from Subdomain or Custom Domain
  let tenantSlug = null;
  let isCustom = false;

  // Check if it's a subdomain of the base domain (e.g., shop.disibin.com)
  if (host.endsWith(`.${baseWithoutWww}`)) {
    const sub = host.slice(0, -(baseWithoutWww.length + 1)).toLowerCase();
    if (sub && sub !== 'www') {
      tenantSlug = sub;
    }
  }
  // Check if it's a subdomain of localhost (e.g., shop.localhost)
  else if (host.endsWith('.localhost')) {
    const sub = host.slice(0, -'.localhost'.length).toLowerCase();
    if (sub && sub !== 'www') {
      tenantSlug = sub;
    }
  }

  // If not a recognized subdomain, treat as a custom domain
  if (!tenantSlug) {
    // If it was www.disibin.com, treat as base domain
    if (host === `www.${cleanBase}` || host === `www.${baseWithoutWww}`) {
      return NextResponse.next();
    }
    // Normalize custom domain by stripping leading www.
    tenantSlug = host.replace(/^www\./, '');
    isCustom = true;
  }

  // If unable to resolve any tenant identifier, pass to SaaS root
  if (!tenantSlug) {
    return NextResponse.next();
  }

  // 6. Security & Session Integrity:
  // If a user navigates to /creator or /developer on a tenant domain, redirect them
  // to the official SaaS domain so authentication cookies and sessions stay on the SaaS origin.
  if (pathname.startsWith('/creator') || pathname.startsWith('/developer')) {
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const redirectUrl = new URL(pathname + search, `${protocol}://${cleanBase}`);
    return NextResponse.redirect(redirectUrl);
  }

  // 7. Inject Tenant Context Headers for Server Components and API Routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-domain', tenantSlug);
  requestHeaders.set('x-tenant-slug', tenantSlug);
  requestHeaders.set('x-tenant-type', isCustom ? 'custom-domain' : 'subdomain');
  requestHeaders.set('x-original-host', host);

  // 8. Rewrite URL to Internal Dynamic Routes

  // Case A: API Routes
  if (pathname.startsWith('/api/')) {
    // If pathname already contains /api/${tenantSlug}/, do not rewrite again
    if (pathname.startsWith(`/api/${tenantSlug}/`) || pathname === `/api/${tenantSlug}`) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // Rewrite /api/... to /api/${tenantSlug}/...
    const apiPath = `/api/${tenantSlug}${pathname.slice(4)}`;
    const rewriteUrl = new URL(`${apiPath}${search}`, req.url);
    return NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
  }

  // Case B: Public Storefront / Staff Panel / Customer User Pages
  // If pathname already contains /${tenantSlug}, do not rewrite again
  if (pathname === `/${tenantSlug}` || pathname.startsWith(`/${tenantSlug}/`)) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Rewrite /path to /${tenantSlug}/path
  const targetPath = `/${tenantSlug}${pathname === '/' ? '' : pathname}`;
  const rewriteUrl = new URL(`${targetPath}${search}`, req.url);

  return NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
}

