// app/layout.tsx — root layout with Geist Sans + global metadata
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://aura-jonad.com'),
  title: {
    default: 'AuraJonad — AI Automation Systems',
    template: '%s | AuraJonad',
  },
  description: 'AI automation systems, prompt vaults, and done-for-you builds. Everything we sell, we run in our own company first.',
  keywords: ['AI automation', 'n8n workflows', 'business automation', 'prompt vault', 'chatbot', 'done for you automation'],
  authors: [{ name: 'AuraJonad' }],
  creator: 'AuraJonad',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aura-jonad.com',
    siteName: 'AuraJonad',
    title: 'AuraJonad — AI Automation Systems',
    description: 'Automate the boring. Scale the genius.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuraJonad — AI Automation Systems',
    description: 'Automate the boring. Scale the genius.',
  },
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased bg-[#0A0A0B] text-[#F5F7FA]">
        {children}
      </body>
    </html>
  );
}
