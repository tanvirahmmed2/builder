import { redirect } from 'next/navigation';
import { isStaff } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Reviews Moderation | ${SITE_NAME}`,
  description: `Moderate verified reviews, testimonials, and ratings on ${SITE_NAME}.`,
};

export default async function ReviewsLayout({ children }) {
  const auth = await isStaff();
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}
