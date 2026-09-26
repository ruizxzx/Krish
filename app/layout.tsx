import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Krish Sarkar — Creative Developer',
  description: 'Krish Sarkar — creative developer and engineer building high-end digital experiences.',
  metadataBase: new URL('https://krish.vercel.app'),
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
