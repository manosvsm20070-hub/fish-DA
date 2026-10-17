import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dolphin Aquarium | Freshwater Fish & Custom Rimless Tanks Sothupakkam',
  description:
    'Freshwater livestock, fancy goldfish, betta fish, flowerhorns, monster fish, rimless aquarium tanks, pumps, filters, and fish medicines in Sothupakkam, Tamil Nadu.',
  keywords: [
    'aquarium shop',
    'freshwater fish',
    'Sothupakkam',
    'Tamil Nadu',
    'goldfish',
    'betta fish',
    'rimless tank',
    'aquarium equipment',
  ],
  openGraph: {
    title: 'Dolphin Aquarium — Freshwater Specialist',
    description: 'Freshwater livestock, custom rimless tanks & aquarium equipment in Sothupakkam, Tamil Nadu.',
    url: 'https://dolphinaquarium.com',
    siteName: 'Dolphin Aquarium',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Dolphin Aquarium Sothupakkam',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

import ThemeApplier from '@/components/ThemeApplier';
import { getSettings } from '@/lib/storage';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const primaryColor = settings.theme?.primaryColor || '#006572';
  const accentColor = settings.theme?.accentColor || '#cc4729';
  const darkMode = !!settings.theme?.darkMode;
  const isAnnouncementActive = !!(settings.customerInterface?.announcement?.enabled && settings.customerInterface?.announcement?.text);

  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${darkMode ? 'dark' : ''} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <style
          id="theme-css-vars"
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-primary: ${primaryColor};
                --color-primary-container: ${primaryColor};
                --color-tertiary-container: ${accentColor};
                --color-coral: ${accentColor};
              }
              html.dark {
                --color-surface: #0b1320;
                --color-surface-dim: #131d2e;
                --color-surface-bright: #172338;
                --color-surface-container-lowest: #0d1524;
                --color-surface-container-low: #131e31;
                --color-surface-container: #1b2840;
                --color-surface-container-high: #243450;
                --color-surface-container-highest: #2e4162;
                --color-on-surface: #f1f5f9;
                --color-on-surface-variant: #94a3b8;
              }
            `,
          }}
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
        <ThemeApplier primaryColor={primaryColor} accentColor={accentColor} darkMode={darkMode} />
        <CartProvider>
          <Header
            announcement={settings.customerInterface?.announcement}
            storeName={settings.customerInterface?.storeName}
            phoneDial={settings.customerInterface?.contact?.phoneDial}
            phoneDisplay={settings.customerInterface?.contact?.phoneDisplay}
            whatsappNumber={settings.customerInterface?.contact?.whatsappNumber}
          />
          <div className={`flex-1 flex flex-col ${isAnnouncementActive ? 'pt-28' : 'pt-20'} pb-20 lg:pb-12`}>
            {children}
          </div>
          <BottomNav />
          <FloatingWhatsApp whatsappNumber={settings.customerInterface?.contact?.whatsappNumber} />
        </CartProvider>
      </body>
    </html>
  );
}
