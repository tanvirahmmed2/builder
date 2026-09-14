import { redirect } from 'next/navigation';

export default function RedirectToSubscriptions() {
  redirect('/admin/subscriptions');
}
