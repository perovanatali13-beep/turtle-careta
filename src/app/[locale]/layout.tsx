import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminFloatButton from '@/components/AdminFloatButton';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Caretta Gazipaşa',
    template: '%s | Caretta Gazipaşa',
  },
  description: 'Защита морских черепах Caretta caretta на побережье Газипаши',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'ru' | 'tr' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <AdminFloatButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
