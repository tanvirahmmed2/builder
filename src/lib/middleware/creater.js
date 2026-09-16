import { pool } from '../db/pg';

export async function getCreatorSession(req) {
  try {
    const { rows } = await pool.query('SELECT * FROM creators ORDER BY id ASC LIMIT 1');
    return rows[0] || null;
  } catch (_) {
    return null;
  }
}

export async function getCreatorPortfolioRole(portfolioId, creatorId) {
  try {
    const { rows } = await pool.query(
      'SELECT role FROM creators WHERE id = $1 LIMIT 1',
      [creatorId]
    );
    return rows[0]?.role || null;
  } catch (_) {
    return null;
  }
}

export async function canManagePortfolio(portfolioId, creatorId) {
  const role = await getCreatorPortfolioRole(portfolioId, creatorId);
  return role === 'creator' || role === 'manager' || role === 'admin';
}

export async function canManageTeamAndBilling(portfolioId, creatorId) {
  const role = await getCreatorPortfolioRole(portfolioId, creatorId);
  return role === 'creator' || role === 'admin';
}
