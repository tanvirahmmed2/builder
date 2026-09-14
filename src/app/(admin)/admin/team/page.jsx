import { redirect } from 'next/navigation';

export default function RedirectToAdmins() {
  redirect('/admin/admins');
}
