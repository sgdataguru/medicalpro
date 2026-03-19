import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import './globals.css';

import SideNavBar from './_components/SideNavBar';
import TopAppBar from './_components/TopAppBar';

const manrope = Manrope({
  variable: '--font-headline',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Farrer Park Hospital | Clinical Analytics OS',
  description: 'Hospital data analytics platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${manrope.variable} ${inter.variable} font-sans antialiased bg-surface`}
      >
        <div className="flex min-h-screen">
          <SideNavBar />
          <div className="flex flex-1 flex-col ml-64">
            <TopAppBar />
            <main className="flex-1 overflow-auto p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
