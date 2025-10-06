import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Glowdle',
  description: 'Create and play custom Wordle games with any word length',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Glowdle'
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#10b981',
  interactiveWidget: 'resizes-content'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen text-white relative`}>
        {/* Simplified background - removed expensive animated gradients for performance */}
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          <AccessibilityProvider>
            {children}
          </AccessibilityProvider>
        </div>
      </body>
    </html>
  );
}
