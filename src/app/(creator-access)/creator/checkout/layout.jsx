import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Checkout & Select Plan | ${SITE_NAME}`,
  description: `Choose your portfolio creator package and launch your custom website on ${SITE_NAME}.`,
};

export default function CheckoutLayout({ children }) {
  return <>{children}</>;
}
