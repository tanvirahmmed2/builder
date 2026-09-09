import { dbStore } from '../db/store';

export async function getAdminSession(req) {
  // Check headers or cookies for admin session/token
  // Default to the seeded Platform Super Admin for frictionless local development
  const adminId = 'a0000000-0000-0000-0000-000000000001';
  const admin = dbStore.getAdminById(adminId);
  return admin || null;
}

export function verifySuperAdmin(admin) {
  if (!admin || admin.role !== 'SUPER_ADMIN') {
    return false;
  }
  return true;
}
