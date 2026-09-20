import { redirect } from 'next/navigation';
import { isStaff } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Issue Reports | ${SITE_NAME}`,
  description: `Investigate community reports, website abuse notices, and flags on ${SITE_NAME}.`,
};

export default async function ReportsLayout({ children }) {
  const auth = await isStaff();
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}
