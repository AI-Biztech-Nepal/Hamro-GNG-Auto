import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StickyBottomBar } from '@/components/layout/StickyBottomBar';
import { Toaster } from '@/components/ui/toaster';
import { TransitionProvider } from '@/components/layout/TransitionProvider';
import { FirebaseClientProvider } from '@/firebase';
import { CONTACT_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'G&G AUTO Enterprises - Best Second Hand Bikes in Kathmandu',
  description: 'G&G AUTO provides reliable, inspected, and fairly priced second-hand two-wheelers in Kathmandu, Nepal.',
  icons: {
    icon: [
      { url: CONTACT_INFO.logoUrl },
      { url: CONTACT_INFO.logoUrl, rel: 'shortcut icon' },
    ],
    apple: [
      { url: CONTACT_INFO.logoUrl },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://picsum.photos" />
        
        {/* Instant Asset Delivery: Preload branding visuals with high fetch priority */}
        <link rel="preload" as="image" href={CONTACT_INFO.logoUrl} fetchPriority="high" />
        <link rel="preload" as="image" href={CONTACT_INFO.heroUrl} fetchPriority="high" />
      </head>
      <body className="font-body antialiased min-h-screen">
        <FirebaseClientProvider>
          <Navbar />
          <TransitionProvider>
            <main className="flex-grow pb-16 md:pb-0">
              {children}
            </main>
          </TransitionProvider>
          <Footer />
          <StickyBottomBar />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
