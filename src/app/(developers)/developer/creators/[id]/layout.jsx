import { redirect } from 'next/navigation';
import { isSupport } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Creator Full Details | ${SITE_NAME}`,
  description: `Comprehensive portfolio creator details, subscription history, hosted websites, and audit logs.`,
};

export default async function CreatorDetailsLayout({ children }) {
  const auth = await isSupport();
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}
