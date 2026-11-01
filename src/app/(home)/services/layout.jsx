import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Ecosystem Services & Website Solutions | ${SITE_NAME}`,
  description: `Explore turnkey website types, modular services, POS systems, e-commerce storefronts, and organization directories on ${SITE_NAME}.`,
};

export default function HomeServicesLayout({ children }) {
  return <>{children}</>;
}

