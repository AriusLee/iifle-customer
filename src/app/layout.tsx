import type { Metadata } from 'next';
import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const fontSans = Noto_Sans_SC({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const fontSerif = Noto_Serif_SC({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
});

export const metadata: Metadata = {
  title: 'IIFLE · 独角兽诊断 | Unicorn Diagnostic',
  description: '快速诊断，找到企业做大做强的关键路径',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${fontSans.variable} ${fontSerif.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
