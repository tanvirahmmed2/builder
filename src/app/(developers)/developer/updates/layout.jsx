import { redirect } from 'next/navigation';
import { isManagerOrAdmin } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Product Updates & Releases | ${SITE_NAME}`,
  description: `Publish and manage changelogs, feature drops, and system release announcements on ${SITE_NAME}.`,
};

export default async function UpdatesLayout({ children }) {
  const auth = await isManagerOrAdmin();
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}
