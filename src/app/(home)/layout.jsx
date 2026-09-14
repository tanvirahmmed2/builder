import Navbar from '@/components/home/bar/Navbar';
import Footer from '@/components/home/bar/Footer';
import LiveChatPopup from '@/components/home/LiveChatPopup';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `${SITE_NAME} - Build Your Identity`,
  description: `Portfolio wesite builder ${SITE_NAME}`,
};

export default function HomeLayout({ children }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 relative">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <LiveChatPopup />
    </div>
  );
}
