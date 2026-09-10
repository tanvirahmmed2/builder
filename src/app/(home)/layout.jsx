import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { SITE_NAME } from '@/lib/db/secret';

export const metadata = {
  title: `${SITE_NAME} - Build Your Identity`,
  description: `Portfolio wesite builder ${SITE_NAME}`,
};

export default function HomeLayout({ children }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
