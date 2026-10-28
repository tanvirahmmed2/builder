import { SITE_NAME } from "@/lib/db/secret";
import "./globals.css";
import { ContextProvider } from "@/components/helper/Context";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";

export const metadata = {
  title: `${SITE_NAME} - Build Your Identity`,
  description: `Portfolio website builder ${SITE_NAME}`,
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className="w-full overflow-x-hidden h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ContextProvider>
            <main>{children}</main>
          </ContextProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
