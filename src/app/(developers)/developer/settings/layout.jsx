import { redirect } from 'next/navigation';
import { isStaff } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Developer Settings | ${SITE_NAME}`,
  description: `Configure platform preferences, API settings, and developer options on ${SITE_NAME}.`,
};

export default async function SettingsLayout({ children }) {
  const auth = await isStaff();
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}
