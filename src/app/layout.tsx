import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppLayout } from '@/components/Layout/AppLayout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Artemis - AI-Powered Knowledge Management',
  description: 'Organize and explore your knowledge with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
