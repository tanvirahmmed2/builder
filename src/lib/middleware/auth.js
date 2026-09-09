/**
 * Authentication extraction middleware
 * Reads authorization tokens or session cookies from request.
 */
export function extractAuthSession(request) {
  const cookies = request.cookies;
  const adminToken = cookies.get('admin_token')?.value;
  const creatorToken = cookies.get('creator_token')?.value;
  const creatorRole = cookies.get('creator_role')?.value || 'admin'; // 'admin' or 'manager'
  const userToken = cookies.get('user_token')?.value;

  return {
    admin: adminToken ? { id: adminToken, role: 'SUPER_ADMIN' } : null,
    creator: creatorToken ? { id: creatorToken, role: creatorRole } : { id: 'default-creator', role: creatorRole },
    user: userToken ? { id: userToken } : null,
  };
}
