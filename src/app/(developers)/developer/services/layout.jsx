import { redirect } from 'next/navigation';
import { hasModulePermission } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Services & Modules | ${SITE_NAME}`,
  description: `Manage platform services, modular architecture, and service themes on ${SITE_NAME}.`,
};

export default async function ServicesLayout({ children }) {
  const auth = await hasModulePermission(undefined, ['services', 'apps']);
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}

