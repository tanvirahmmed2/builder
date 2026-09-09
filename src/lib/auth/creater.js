import { dbStore } from '../db/store';

export async function getCreatorSession(req) {
  // Can resolve creator from cookie/header or default to Alex Vance (Creator Admin)
  const defaultCreatorId = 'c0000000-0000-0000-0000-000000000001';
  const creator = dbStore.getCreatorById(defaultCreatorId);
  return creator || null;
}

export function getCreatorPortfolioRole(portfolioId, creatorId) {
  const memberships = dbStore.getPortfolioCreators(portfolioId);
  const userMembership = memberships.find((m) => m.creatorId === creatorId);
  return userMembership ? userMembership.role : null; // 'admin' | 'manager' | null
}

export function canManagePortfolio(portfolioId, creatorId) {
  const role = getCreatorPortfolioRole(portfolioId, creatorId);
  return role === 'admin' || role === 'manager';
}

export function canManageTeamAndBilling(portfolioId, creatorId) {
  const role = getCreatorPortfolioRole(portfolioId, creatorId);
  return role === 'admin';
}
