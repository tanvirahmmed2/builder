import { redirect } from 'next/navigation';
import { isDeveloper } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Ecosystem Apps | ${SITE_NAME}`,
  description: `Manage third-party apps, plugins, and ecosystem integrations on ${SITE_NAME}.`,
};

export default async function AppsLayout({ children }) {
  const auth = await isDeveloper();
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}
