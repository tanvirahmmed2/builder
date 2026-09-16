import Navbar from '@/components/dashboard/Navbar';

export const metadata = {
  title: 'Creator & Manager Workspace | PortfolioCraft',
  description: 'Manage website portfolio modules, appointments, blog, experiences, and reviews.',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
