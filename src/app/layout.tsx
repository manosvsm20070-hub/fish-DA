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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
        <CartProvider>
          <Header />
          <div className="flex-1 flex flex-col pt-20 pb-20 lg:pb-12">
            {children}
          </div>
          <BottomNav />
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}
