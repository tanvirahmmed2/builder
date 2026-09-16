import { createAdminCrudHandler } from '@/lib/api/adminCrud';

const handler = createAdminCrudHandler('payment', {
  selectQuery: 'SELECT * FROM payment ORDER BY id DESC',
});

export const GET = handler.GET;
export const POST = handler.POST;
export const DELETE = handler.DELETE;
export const PUT = handler.PUT;
