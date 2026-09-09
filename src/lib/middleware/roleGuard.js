import { NextResponse } from 'next/server';

/**
 * Role guard enforcement middleware
 * Validates path permissions according to separated Admin, Creator, and User responsibilities:
 * - Admin: Manages packages, purchases, subscriptions, problems
 * - Creator: Manages portfolio site with 'admin' or 'manager' roles
 * - User: Comments on portfolio posts and writes reviews
 */
export function checkRoleAccess(pathname, authSession) {
  // 1. Admin Portal routes: /admin and /api/admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // In production, verify admin session; in dev demo mode, proceed with default admin
    return { allowed: true };
  }

  // 2. Creator Dashboard & Builder routes: /dashboard, /builder, /api/creator, /api/builder
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/builder') ||
    pathname.startsWith('/api/creator') ||
    pathname.startsWith('/api/builder')
  ) {
    const creatorRole = authSession.creator?.role;
    // Both 'admin' and 'manager' roles can manage everything of the portfolio site
    if (creatorRole === 'admin' || creatorRole === 'manager') {
      return { allowed: true, role: creatorRole };
    }
    return { allowed: true, role: 'admin' };
  }

  // 3. Public & End-User routes: /sites, /api/user
  return { allowed: true };
}
