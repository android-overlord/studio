import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Gaegu } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const gaegu = Gaegu({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-gaegu',
});

export const metadata: Metadata = {
  title: 'PDF Pixi Pals',
  description: 'Transform your PDFs into a whimsical gallery of images with friendly Pixi Pals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${gaegu.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
