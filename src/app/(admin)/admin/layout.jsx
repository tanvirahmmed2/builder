import Navbar from '@/components/admin/Navbar';

export const metadata = {
  title: 'Platform Super Admin | PortfolioCraft SaaS',
  description: 'Manage SaaS packages, subscriptions, transactions, and user/creator support problems.',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
