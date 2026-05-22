import type { Metadata, Viewport } from 'next';
import { Press_Start_2P, Tomorrow } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeScript } from '@/components/theme/ThemeScript';
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

export const viewport: Viewport = {
  themeColor: '#1a2f5c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontDisplay.variable} ${fontBody.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <div className="theme-desktop mx-auto min-h-dvh w-full">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
