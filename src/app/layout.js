
import { SITE_NAME } from "@/lib/db/secret";
import "./globals.css";

export const metadata = {
  title: `${SITE_NAME} - Build Your Identity`,
  description: `Portfolio wesite builder ${SITE_NAME}`,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`w-full overflow-x-hidden h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
