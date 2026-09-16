import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `Platform Admin Center | ${SITE_NAME}`,
  description: 'Multi-website management portal for platform staff and administrators.',
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
