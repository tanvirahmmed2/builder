import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/middleware/developer';

export default async function RedirectToAdmins() {
  const auth = await isAdmin();
  if (!auth || !auth.success) {
    redirect('/developer');
  }
  redirect('/developer/developers');
}
