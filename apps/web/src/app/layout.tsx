import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/navbar';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { Footer } from '@/components/layout/footer';
import { InstallPwa } from '@/components/shared/install-pwa';
import { PwaRegister } from '@/components/shared/pwa-register';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: { default: 'NEEDX — What do you need?', template: '%s · NEEDX' },
  description:
    'NEEDX is a need-first marketplace. Say what you need — buy, rent, borrow, hire, exchange, or donate — and NEEDX finds people and businesses nearby who can provide it.',
  applicationName: 'NEEDX',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'NEEDX' },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'NEEDX — What do you need?',
    description: 'A need-first marketplace: buy, rent, borrow, hire, exchange, or donate.',
    siteName: 'NEEDX',
    type: 'website',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#12141c' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <PwaRegister />
          <div className="flex min-h-dvh flex-col">
            <Navbar />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
          </div>
          <MobileBottomNav />
          <InstallPwa />
        </Providers>
      </body>
    </html>
  );
}
