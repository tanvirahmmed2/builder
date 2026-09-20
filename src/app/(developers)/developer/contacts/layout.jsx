import { redirect } from 'next/navigation';
import { isSupport } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Contact Submissions | ${SITE_NAME}`,
  description: `Supervise public contact inquiries and client messages on ${SITE_NAME}.`,
};

export default async function ContactsLayout({ children }) {
  const auth = await isSupport();
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}
