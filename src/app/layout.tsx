import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tic Tac Toe Online',
  description: 'Play Tic Tac Toe online with friends',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} main-fallback`}>
        <main className="min-h-screen flex flex-col items-center justify-center p-4 main-fallback">
          {children}
        </main>
      </body>
    </html>
  );
}