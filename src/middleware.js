import { runMiddleware } from './lib/middleware';

export function middleware(request) {
  return runMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files, images, favicon
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
