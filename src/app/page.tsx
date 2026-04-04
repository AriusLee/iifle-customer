'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { LangToggle } from './diagnostic/_components/lang-toggle';

export default function HomePage() {
  const { t } = useT();
  const [resumeId, setResumeId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.get()) return;
    api.diagnostics.list().then((list) => {
      if (list?.length) setResumeId(list[0].id);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-3 border-b">
        <span className="text-lg font-bold text-emerald-600">IIFLE</span>
        <LangToggle />
      </header>

      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {t('独角兽企业结构诊断', 'Unicorn Growth Diagnostic')}
        </h1>
        <p className="mb-8 max-w-xl text-lg text-gray-500">
          {t('快速诊断，找到企业做大做强的关键路径', 'Find the critical path for enterprise growth')}
        </p>
        <Link href="/diagnostic">
          <Button className="cursor-pointer h-12 px-8 text-base font-semibold bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl">
            {resumeId ? t('继续诊断', 'Continue Diagnostic') : t('开始诊断', 'Start Diagnostic')}
          </Button>
        </Link>
      </section>

      <footer className="border-t py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} IIFLE
      </footer>
    </div>
  );
}
