import { redirect } from 'next/navigation';

export default function RedirectToContacts() {
  redirect('/admin/contacts');
}
