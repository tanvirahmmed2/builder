import { pool } from '../db/pg';

export async function getUserSession(req) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, avatar_url, is_active FROM users WHERE is_active = TRUE AND is_banned = FALSE ORDER BY id ASC LIMIT 1'
    );
    return rows[0] || null;
  } catch (_) {
    return null;
  }
}

export function canCommentAndReview(user) {
  return !!user;
}
