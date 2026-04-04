import type { Metadata } from 'next';
import { Noto_Sans_SC } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const font = Noto_Sans_SC({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'IIFLE 独角兽诊断',
  description: '快速诊断，找到企业做大做强的关键路径',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${font.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
