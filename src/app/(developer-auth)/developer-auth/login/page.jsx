import AdminLoginForm from '@/components/saas/developer-auth/AdminLoginForm';

export const metadata = {
  title: 'Super Admin Login | PortfolioCraft SaaS',
  description: 'Restricted administrative gateway for SaaS operators.',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <AdminLoginForm />
    </div>
  );
}
