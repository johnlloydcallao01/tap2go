import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AdminLayoutWrapper from '@/components/layout/AdminLayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tap2Go Admin Dashboard',
  description: 'Administrative dashboard for Tap2Go transportation management system',
  keywords: 'admin, dashboard, transportation, management, tap2go',
  authors: [{ name: 'Tap2Go Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminLayoutWrapper>
          {children}
        </AdminLayoutWrapper>
      </body>
    </html>
  );
}
