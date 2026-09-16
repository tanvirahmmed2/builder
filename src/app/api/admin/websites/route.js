import { createAdminCrudHandler } from '@/lib/api/adminCrud';

const handler = createAdminCrudHandler('websites', {
  selectQuery: 'SELECT * FROM websites ORDER BY id DESC',
});

export const GET = handler.GET;
export const POST = handler.POST;
export const DELETE = handler.DELETE;
export const PUT = handler.PUT;
