import { redirect } from 'next/navigation';
import { isMarketer } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Leads Pipeline | ${SITE_NAME}`,
  description: `Manage prospective leads, marketing conversions, and prospective creators on ${SITE_NAME}.`,
};

export default async function LeadsLayout({ children }) {
  const auth = await isMarketer();
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}
