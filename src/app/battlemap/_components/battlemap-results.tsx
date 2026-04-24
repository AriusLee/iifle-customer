'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n';

interface Props {
  battleMap: any;
  diagnostic?: any;
  onUpdated: () => void | Promise<void>;
}

function scoreColor(s: number): string {
  if (s >= 80) return 'text-emerald-600';
  if (s >= 60) return 'text-yellow-600';
  if (s >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function barColor(s: number): string {
  if (s >= 80) return 'bg-emerald-500';
  if (s >= 60) return 'bg-yellow-500';
  if (s >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

const VARIANT_ACCENT: Record<string, { bar: string; soft: string; ink: string; label: string }> = {
  replication: {
    bar: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    soft: 'rgba(245, 158, 11, 0.08)',
    ink: '#b45309',
    label: 'amber',
  },
  financing: {
    bar: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    soft: 'rgba(59, 130, 246, 0.06)',
    ink: '#1e40af',
    label: 'blue',
  },
  capitalization: {
    bar: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
    soft: 'rgba(16, 185, 129, 0.06)',
    ink: '#065f46',
    label: 'emerald',
  },
};

export function BattleMapResults({ battleMap, diagnostic }: Props) {
  const { t } = useT();

  const variantKey: string = battleMap.variant || 'replication';
  const accent = VARIANT_ACCENT[variantKey] || VARIANT_ACCENT.replication;

  const priorities = battleMap.top_priorities || [];
  const doNotDo = battleMap.do_not_do || [];
  const timeline = battleMap.timeline || {};
  const modules = battleMap.battle_modules || [];
  const sectionAnalyses = battleMap.section_analyses || {};
  const analysesList = Object.entries(sectionAnalyses).filter(
    ([, v]: any) => v && (v.analysis_zh || v.analysis_en),
  );

  // Phase 1 recap — prefer live diagnostic, fall back to snapshot.
  const phase1 = diagnostic || null;
  const rawP1Scores = (phase1?.module_scores || battleMap.source_scores || {}) as Record<string, any>;
  const p1Modules = Object.entries(rawP1Scores)
    .filter(([k]) => k !== '_meta')
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([k, m]: [string, any]) => ({ ...m, key: k }));

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-6">
      {/* ── Headline (variant badge + stages) ── */}
      <div className="relative rounded-3xl border border-slate-200 bg-white p-8 overflow-hidden shadow-[var(--shadow-soft)]">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundImage: accent.bar }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(circle at 85% 15%, ${accent.soft} 0%, transparent 50%)` }}
        />

        <div className="relative">
          <p className="eyebrow mb-2">{t('为你匹配的作战图', 'Your matched battle map')}</p>
          <h2 className="font-display text-3xl font-bold mb-1" style={{ color: accent.ink }}>
            {t(battleMap.variant_name_zh || '—', battleMap.variant_name_en || '—')}
          </h2>
          <div className="flex items-center gap-2 flex-wrap text-sm mt-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-400">
              {t('阶段跃迁', 'Stage transition')}
            </span>
            <Badge variant="outline" className="text-xs px-2.5 py-0.5">
              {battleMap.current_stage || '—'}
            </Badge>
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <Badge
              className="text-xs px-2.5 py-0.5 border"
              style={{ background: 'var(--gold-soft)', color: 'var(--gold-dark)', borderColor: 'rgba(184,137,62,0.3)' }}
            >
              {battleMap.target_stage || '—'}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Phase 1 recap ── */}
      {p1Modules.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                style={{ backgroundImage: 'linear-gradient(135deg, #c89749 0%, #8f6a2c 100%)' }}
              >
                1
              </span>
              <div>
                <p className="eyebrow">{t('Phase 1', 'Phase 1')}</p>
                <h3 className="font-display text-base font-bold text-slate-900">
                  {t('诊断回顾', 'Diagnostic Recap')}
                </h3>
              </div>
            </div>
            <Link
              href="/diagnostic"
              className="cursor-pointer text-xs font-semibold text-[var(--gold-dark)] hover:text-[var(--gold)] transition-colors"
            >
              {t('查看完整分析 →', 'View full analysis →')}
            </Link>
          </div>

          {phase1 && (phase1.overall_score != null || phase1.enterprise_stage) && (
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-100">
              {phase1.overall_score != null && (
                <div>
                  <p className={`font-display text-3xl font-bold ${scoreColor(phase1.overall_score)}`}>
                    {phase1.overall_score}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                    {t('总分', 'Overall')}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                {phase1.overall_rating && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs w-fit">
                    {phase1.overall_rating}
                  </Badge>
                )}
                {phase1.enterprise_stage && (
                  <Badge
                    variant="outline"
                    className="text-xs w-fit"
                    style={{ borderColor: 'rgba(184,137,62,0.3)', color: 'var(--gold-dark)' }}
                  >
                    {phase1.enterprise_stage}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {p1Modules.map((m: any) => {
              const score = typeof m.score === 'number' ? m.score : Number(m.score) || 0;
              return (
                <div key={m.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-[11px] font-bold text-[var(--gold-dark)]">
                        {String(m.key).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {t(m.name_zh || `Module ${m.key}`, m.name_en || `Module ${m.key}`)}
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${scoreColor(score)}`}>{score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor(score)}`}
                      style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Top 3 priorities ── */}
      {priorities.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <p className="eyebrow mb-0.5">{t('核心重点', 'Core focus')}</p>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {t('三大升级重点', 'Top 3 Priorities')}
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {priorities.map((p: any) => (
              <div
                key={p.rank}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-gradient-to-br from-[var(--gold-soft)]/20 to-white p-4"
              >
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
                  style={{ backgroundImage: 'linear-gradient(135deg, #c89749 0%, #8f6a2c 100%)' }}
                >
                  {p.rank}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 mb-0.5">
                    {t(p.title_zh, p.title_en)}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t(p.action_zh, p.action_en)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Do-not-do ── */}
      {doNotDo.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <p className="eyebrow mb-0.5" style={{ color: '#b91c1c' }}>{t('暂缓动作', 'Avoid for now')}</p>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {t('当前不建议动作', 'Currently Not Recommended')}
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {doNotDo.map((d: any, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/50 p-4"
              >
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-0.5">
                    {t(d.title_zh, d.title_en)}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t(d.reason_zh, d.reason_en)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Signature modules ── */}
      {modules.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <p className="eyebrow mb-0.5">{t('作战模块', 'Signature Modules')}</p>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {t('四大作战模块', 'Four Signature Modules')}
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((m: any) => (
              <div
                key={m.code}
                className="rounded-xl border border-slate-200 p-4 bg-gradient-to-br from-[var(--gold-soft)]/15 to-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-display text-base font-bold text-[var(--gold-dark)]">
                    {m.code}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {t(m.title_zh, m.title_en)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t(m.action_zh, m.action_en)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Timeline ── */}
      {timeline['90d'] && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-5">
            <p className="eyebrow mb-0.5">{t('时间轴', 'Timeline')}</p>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {t('作战清单', 'Battle Plan')}
            </h3>
          </div>
          <div className="relative flex flex-col gap-6 pl-5">
            <div className="pointer-events-none absolute left-[7px] top-1 bottom-1 w-px bg-[var(--gold)]/30" />
            {(['90d', '180d', '12m'] as const).map((k) => {
              const label = k === '90d'
                ? t('未来 90 天', 'Next 90 days')
                : k === '180d'
                  ? t('未来 180 天', 'Next 180 days')
                  : t('未来 12 个月', 'Next 12 months');
              const items: string[] = timeline[k] || [];
              if (!items.length) return null;
              return (
                <div key={k} className="relative">
                  <div
                    className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ring-2 ring-[var(--gold)]"
                    style={{ backgroundImage: 'linear-gradient(135deg, #c89749 0%, #8f6a2c 100%)' }}
                  />
                  <p className="text-sm font-bold text-[var(--gold-dark)] mb-2">{label}</p>
                  <ul className="flex flex-col gap-1.5">
                    {items.map((item, i) => (
                      <li key={i} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                        <span className="text-[var(--gold)] mt-1.5">◆</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Per-section analyses recap ── */}
      {analysesList.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <p className="eyebrow mb-0.5">{t('AI 分析', 'AI Analyses')}</p>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {t('分区分析回顾', 'Section-by-Section Analyses')}
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {analysesList.map(([key, value]: any) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="font-display text-xs font-bold text-[var(--gold-dark)] mb-2 uppercase tracking-widest">
                  {t('分区', 'Section')} {String(key).toUpperCase()}
                </p>
                <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {t(value.analysis_zh || '', value.analysis_en || '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Advisor handoff ── */}
      <div className="relative rounded-2xl border border-slate-900/10 p-6 overflow-hidden shadow-[var(--shadow-lift)]"
        style={{ backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div className="pointer-events-none absolute top-0 right-0 w-40 h-40 opacity-10"
          style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }}
        />
        <div className="relative flex items-start gap-4">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
            style={{ backgroundImage: 'linear-gradient(135deg, #c89749 0%, #8f6a2c 100%)' }}
          >
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="eyebrow mb-1" style={{ color: 'var(--gold)' }}>
              {t('下一步', 'Next step')}
            </p>
            <p className="font-display text-base font-bold text-white mb-1.5">
              {t('完整 10 章作战方案由顾问生成', 'A full 10-chapter playbook, prepared by your advisor')}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t(
                '你已完成问卷并拿到分区分析与作战骨架。IIFLE 顾问将基于这些数据为你生成完整的 10 章专属作战方案，涵盖商业模式、组织与 KPI、股权治理、估值路径和 90/180/365 天动作清单，并与你一起复盘。',
                "You've completed the questionnaire and received section analyses + skeleton. An IIFLE advisor will build your full 10-chapter playbook — business model upgrade, org & KPIs, equity & governance, valuation path, and 90/180/365-day action list — and walk through next steps with you.",
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
