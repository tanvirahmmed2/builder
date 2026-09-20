import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Reset Password | ${SITE_NAME}`,
  description: `Recover your creator account access on ${SITE_NAME}.`,
};

export default function CreatorRecoveryLayout({ children }) {
  return <>{children}</>;
}
