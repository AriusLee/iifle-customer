'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { BM_VARIANTS } from '@/lib/battlemap-questions';

interface Props {
  diagnosticId: string;
  onStarted: () => void | Promise<void>;
}

const VARIANT_ACCENT: Record<string, { bar: string; soft: string; text: string }> = {
  replication: {
    bar: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    soft: 'rgba(245, 158, 11, 0.1)',
    text: '#b45309',
  },
  financing: {
    bar: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    soft: 'rgba(59, 130, 246, 0.08)',
    text: '#1e40af',
  },
  capitalization: {
    bar: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
    soft: 'rgba(16, 185, 129, 0.08)',
    text: '#065f46',
  },
};

export function BattleMapIntro({ diagnosticId, onStarted }: Props) {
  const { t } = useT();
  const [creating, setCreating] = useState(false);

  async function handleStart() {
    setCreating(true);
    try {
      await api.battlemaps.createForDiagnostic(diagnosticId);
      await onStarted();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-6">
      {/* Hero */}
      <div className="relative rounded-3xl border border-slate-200 bg-white p-8 overflow-hidden shadow-[var(--shadow-soft)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--gold-soft)]/30 via-white to-white" />
        <div className="pointer-events-none absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[var(--gold)]/40 rounded-tl-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[var(--gold)]/40 rounded-br-3xl" />

        <div className="relative">
          <p className="eyebrow mb-3">{t('Phase 1.5 · 战略作战图', 'Phase 1.5 · Battle Map')}</p>
          <h2 className="font-display text-3xl font-bold text-slate-900 leading-tight mb-3">
            {t('下一阶段怎么打，', 'How to level up')}
            <br />
            <span className="text-[var(--gold-dark)]">
              {t('AI 为你量身定制', 'tailored for you by AI')}
            </span>
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 max-w-xl">
            {t(
              'Phase 1 告诉你"你在哪里、卡在哪里"。战略作战图进一步告诉你：下一阶段怎么打、用什么顺序打、90 天开始做什么。',
              'Phase 1 told you where you are and what\'s stuck. The battle map tells you how to level up — in what order, and what to start in 90 days.',
            )}
          </p>
        </div>
      </div>

      {/* Variant preview */}
      <div>
        <div className="flex items-baseline justify-between mb-3 px-1">
          <p className="eyebrow">{t('三种作战图 · 自动匹配', 'Three variants · auto-matched')}</p>
          <p className="text-[11px] text-slate-400">{t('AI 从中选择一份', 'AI picks one for you')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.values(BM_VARIANTS).map((v, i) => {
            const accent = VARIANT_ACCENT[v.key] || VARIANT_ACCENT.replication;
            return (
              <div
                key={v.key}
                className="relative rounded-2xl border border-slate-200 bg-white p-4 overflow-hidden shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundImage: accent.bar }}
                />
                <div className="pt-2">
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: accent.text }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <p className="text-sm font-bold text-slate-900 mb-1.5">
                    {t(v.name_zh, v.name_en)}
                  </p>
                  <p className="text-[11px] leading-snug text-slate-500">
                    {t(v.subtitle_zh, v.subtitle_en)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works + CTA */}
      <div className="card-gold-accent p-6">
        <p className="eyebrow mb-2">{t('如何工作', 'How it works')}</p>
        <div className="grid gap-3 sm:grid-cols-3 mb-5">
          {[
            { zh: '回答 35 道问题', en: '35 questions', hint: t('约 15 分钟', '~15 min') },
            { zh: 'AI 分区分析', en: 'Section-by-section AI analysis', hint: t('8 个分区', '8 sections') },
            { zh: '自动匹配作战图', en: 'Auto-matched battle map', hint: t('Phase 1 分数 + 意图', 'Phase 1 scores + intent') },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0 mt-0.5"
                style={{ backgroundImage: 'linear-gradient(135deg, #c89749 0%, #8f6a2c 100%)' }}
              >
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{t(step.zh, step.en)}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.hint}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {t('随时保存进度，可中途退出', 'Auto-saves · resume anytime')}
          </p>
          <button
            type="button"
            onClick={handleStart}
            disabled={creating}
            className="btn-primary h-11 px-6 text-base"
          >
            {creating ? t('正在创建…', 'Creating…') : t('开始作战图问卷 →', 'Start battle map →')}
          </button>
        </div>
      </div>
    </div>
  );
}
