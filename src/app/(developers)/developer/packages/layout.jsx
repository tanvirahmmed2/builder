import { redirect } from 'next/navigation';
import { isStaff } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Subscription Packages | ${SITE_NAME}`,
  description: `Manage pricing tiers, portfolio quotas, and billing plans on ${SITE_NAME}.`,
};

export default async function PackagesLayout({ children }) {
  const auth = await isStaff();
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}
