import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/middleware/developer';

export const metadata = {
  title: 'Admin Gateway | PortfolioCraft SaaS',
  description: 'Access portal for platform administrators.',
};

export default async function AdminAccessGatewayPage() {
  const session = await getAdminSession();

  if (session && session.isActive !== false) {
    redirect('/developer');
  } else {
    redirect('/developer-auth/login');
  }
}
