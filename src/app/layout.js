import { SITE_NAME } from "@/lib/db/secret";
import "./globals.css";
import { ContextProvider } from "@/components/helper/Context";

export const metadata = {
  title: `${SITE_NAME} - Build Your Identity`,
  description: `Portfolio website builder ${SITE_NAME}`,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="w-full overflow-x-hidden h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
        <ContextProvider>
          <main>{children}</main>
        </ContextProvider>
      </body>
    </html>
  );
}
