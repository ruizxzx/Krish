import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://krish-n6b65kizl-ruizxzxs-projects.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Krish Sarkar — Creative Developer',
  description: 'Krish Sarkar is a creative developer and engineer building digital products, interfaces and interactive 3D experiences.',
  keywords: ['Krish Sarkar', 'creative developer', 'frontend engineer', 'Three.js', 'GSAP', 'Next.js', 'portfolio'],
  authors: [{ name: 'Krish Sarkar' }],
  creator: 'Krish Sarkar',
  openGraph: {
    title: 'Krish Sarkar — Creative Developer',
    description: 'Digital products, motion systems and interactive experiences.',
    type: 'website',
    url: siteUrl,
    siteName: 'Krish Sarkar',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
