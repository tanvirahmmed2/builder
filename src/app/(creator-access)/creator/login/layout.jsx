import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Creator Sign In | ${SITE_NAME}`,
  description: `Sign in to access your portfolio builder dashboard and websites on ${SITE_NAME}.`,
};

export default function CreatorLoginLayout({ children }) {
  return <>{children}</>;
}
