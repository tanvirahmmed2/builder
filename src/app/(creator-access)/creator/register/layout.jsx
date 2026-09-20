import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Register as Creator | ${SITE_NAME}`,
  description: `Create your creator account and build professional portfolio websites with ${SITE_NAME}.`,
};

export default function CreatorRegisterLayout({ children }) {
  return <>{children}</>;
}
