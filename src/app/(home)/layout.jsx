import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

export const metadata = {
  title: 'PortfolioCraft | Multi-Tenant Drag & Drop Portfolio Builder SaaS',
  description: 'Next-gen SaaS portfolio builder featuring separated Admin, Creator (Admin/Manager), and User tiers.',
};

export default function HomeLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
