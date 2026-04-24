'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
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

  const features = [
    {
      title_zh: '35 题 · 15 分钟',
      title_en: '35 questions · 15 min',
      desc_zh: '结构化问卷覆盖六大企业维度，填完即得评分',
      desc_en: 'Structured questionnaire across six enterprise dimensions',
    },
    {
      title_zh: 'AI 深度分析',
      title_en: 'AI deep analysis',
      desc_zh: '每个分区独立 AI 顾问分析，结合 Phase 1 阶段定位',
      desc_en: 'Per-section AI consultant review, stage-aware insights',
    },
    {
      title_zh: '专业作战图',
      title_en: 'Strategic battle map',
      desc_zh: '复制扩张 / 融资准备 / 资本化推进，自动匹配',
      desc_en: 'Replication / Financing / Capitalization — auto matched',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ───────── Header ───────── */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Image
            src="/iifle-logo.png"
            alt="IIFLE"
            width={140}
            height={44}
            priority
            className="h-9 w-auto"
          />
        </div>
        <LangToggle />
      </header>

      {/* ───────── Hero ───────── */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 pt-6 pb-20 text-center overflow-hidden">
        {/* Decorative gold corner accents — tiny L-brackets echoing the PDF cover */}
        <div className="pointer-events-none absolute top-8 left-8 h-10 w-10 border-t-2 border-l-2 border-[var(--gold)] opacity-30 hidden sm:block" />
        <div className="pointer-events-none absolute top-8 right-8 h-10 w-10 border-t-2 border-r-2 border-[var(--gold)] opacity-30 hidden sm:block" />

        <div className="ornament-diamonds mb-6 opacity-80">
          <span className="rule" />
          <span className="diamond" />
          <span className="diamond" />
          <span className="diamond" />
          <span className="rule" />
        </div>

        <p className="eyebrow mb-4">
          {t('独角兽成长诊断', 'Unicorn Growth Diagnostic')}
        </p>

        <h1 className="font-display mb-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.08]">
          {t('找到企业做大做强的', 'Find the critical path')}
          <br className="hidden sm:block" />
          <span className="text-[var(--gold-dark)]">
            {t('关键路径', 'to enterprise growth')}
          </span>
        </h1>

        <p className="mb-10 max-w-xl text-base text-slate-500 sm:text-lg leading-relaxed">
          {t(
            '三分钟开始，十五分钟完成。AI 顾问将结合你的回答生成六大结构评分、阶段定位与下一步作战图。',
            'Start in 3 minutes, finish in 15. AI consultants deliver six-structure scores, stage positioning, and a next-step battle map grounded in your real answers.',
          )}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/diagnostic" className="btn-primary">
            {resumeId
              ? t('继续诊断 →', 'Continue Diagnostic →')
              : t('开始诊断 →', 'Start Diagnostic →')}
          </Link>
          {resumeId && (
            <Link
              href="/battlemap"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[var(--gold-dark)] bg-[var(--gold-soft)] border border-[var(--gold)]/30 transition-all duration-200 hover:bg-[var(--gold)]/15"
            >
              {t('战略作战图', 'Battle Map')}
            </Link>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-400">
          {t('不收费 · 可匿名 · 结果立即可见', 'Free · Anonymous · Instant results')}
        </p>
      </section>

      {/* ───────── Feature row ───────── */}
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="card-gold-accent p-6 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-2xl font-bold text-[var(--gold-dark)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  {t(f.title_zh, f.title_en)}
                </h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t(f.desc_zh, f.desc_en)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="mt-auto border-t border-slate-200/70 bg-white/40 backdrop-blur-sm py-6 text-center">
        <p className="text-xs text-slate-400 tracking-wider">
          &copy; {new Date().getFullYear()} IIFLE · International Institute of Financing &amp; Listing for Entrepreneurs
        </p>
      </footer>
    </div>
  );
}
