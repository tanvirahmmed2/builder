import { redirect } from 'next/navigation';
import { isDeveloper } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Websites Directory | ${SITE_NAME}`,
  description: `Manage multi-website portfolio containers, custom domains, and storage on ${SITE_NAME}.`,
};

export default async function WebsitesLayout({ children }) {
  const auth = await isDeveloper();
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}
