import { pool } from '../db/pg';

export async function getCreatorSession(req) {
  try {
    const { rows } = await pool.query('SELECT id, name, email, avatar_url, is_active FROM creators WHERE is_active = TRUE ORDER BY id ASC LIMIT 1');
    return rows[0] || null;
  } catch (_) {
    return null;
  }
}

export async function isWebsiteOwner(websiteId, creatorId) {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM websites WHERE id = $1 AND creator_id = $2 LIMIT 1',
      [websiteId, creatorId]
    );
    return rows.length > 0;
  } catch (_) {
    return false;
  }
}

export async function canManagePortfolio(websiteId, creatorId) {
  if (!creatorId) return false;
  return isWebsiteOwner(websiteId, creatorId);
}

export async function canManageTeamAndBilling(websiteId, creatorId) {
  if (!creatorId) return false;
  return isWebsiteOwner(websiteId, creatorId);
}
