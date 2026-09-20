import { redirect } from 'next/navigation';
import { isManagerOrAdmin } from '@/lib/middleware/developer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Payment Transactions | ${SITE_NAME}`,
  description: `Manage payment processing logs, gateways, and financial transaction records on ${SITE_NAME}.`,
};

export default async function PaymentsLayout({ children }) {
  const auth = await isManagerOrAdmin();
  if (!auth || !auth.success) {
    redirect('/developer');
  }

  return <>{children}</>;
}
