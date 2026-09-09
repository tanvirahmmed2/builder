import { dbStore } from '../db/store';

export async function getUserSession(req) {
  // Returns current active visitor/end-user session or fallback to Marcus Thorne / Elena Rostova
  const defaultUserId = '40000000-0000-0000-0000-000000000001';
  const user = dbStore.getUserById(defaultUserId);
  return user || null;
}

export function canCommentAndReview(user) {
  return !!user;
}
