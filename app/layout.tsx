import type { Metadata, Viewport } from 'next';
import { Press_Start_2P, Tomorrow } from 'next/font/google';
import './globals.css';

const fontDisplay = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const fontBody = Tomorrow({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'EnTripreneurship Vol. 02',
  description: 'BINUS Entrepreneurship Center — Participant PWA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EnTrip',
  },
};

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: '#4ADE80',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <body className="font-body antialiased">
        <div className="mx-auto min-h-dvh max-w-[480px] bg-bg-primary">{children}</div>
      </body>
    </html>
  );
}
