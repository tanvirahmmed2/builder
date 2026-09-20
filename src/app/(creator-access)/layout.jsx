import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Creator Studio | ${SITE_NAME}`,
  description: `Creator portal and website builder on ${SITE_NAME}.`,
};

export default function CreatorAccessRootLayout({ children }) {
  return <>{children}</>;
}
