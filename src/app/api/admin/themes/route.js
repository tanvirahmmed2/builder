import { createAdminCrudHandler } from '@/lib/api/adminCrud';

const handler = createAdminCrudHandler('themes', {
  selectQuery: 'SELECT * FROM themes ORDER BY id ASC',
});

export const GET = handler.GET;
export const POST = handler.POST;
export const DELETE = handler.DELETE;
export const PUT = handler.PUT;
