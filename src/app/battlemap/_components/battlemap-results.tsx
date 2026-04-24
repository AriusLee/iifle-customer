'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const VARIANT_COLOR: Record<string, string> = {
  replication: 'bg-amber-100 text-amber-800 border-amber-200',
  financing: 'bg-blue-100 text-blue-800 border-blue-200',
  capitalization: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export function BattleMapResults({ battleMap, diagnostic, onUpdated }: Props) {
  const { t } = useT();

  const variantKey: string = battleMap.variant || 'replication';
  const priorities = battleMap.top_priorities || [];
  const doNotDo = battleMap.do_not_do || [];
  const timeline = battleMap.timeline || {};
  const modules = battleMap.battle_modules || [];
  const sectionAnalyses = battleMap.section_analyses || {};
  const analysesList = Object.entries(sectionAnalyses).filter(
    ([, v]: any) => v && (v.analysis_zh || v.analysis_en),
  );

  // Phase 1 recap — source_scores on the battle map is a snapshot of Phase 1
  // module_scores at classification time. Prefer the live diagnostic when
  // available (richer fields like enterprise_stage + overall_score), but fall
  // back to the snapshot if the diagnostic prop wasn't passed.
  const phase1 = diagnostic || null;
  const rawP1Scores = (phase1?.module_scores || battleMap.source_scores || {}) as Record<string, any>;
  const p1Modules = Object.entries(rawP1Scores)
    .filter(([k]) => k !== '_meta')
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([k, m]: [string, any]) => ({ ...m, key: k }));

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-5">
      {/* Headline */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
        <CardContent className="pt-6 pb-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            {t('为你匹配的作战图', 'Your matched battle map')}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h2 className="text-xl font-bold">
              {t(battleMap.variant_name_zh || '—', battleMap.variant_name_en || '—')}
            </h2>
            <Badge className={VARIANT_COLOR[variantKey]}>
              {t('战略作战图', 'Battle Map')}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="text-gray-500">{t('当前阶段', 'Current')}:</span>
            <Badge variant="outline">{battleMap.current_stage || '—'}</Badge>
            <span className="text-gray-400">→</span>
            <span className="text-gray-500">{t('目标阶段', 'Target')}:</span>
            <Badge className="bg-emerald-100 text-emerald-700">{battleMap.target_stage || '—'}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Phase 1 diagnostic recap — so the customer doesn't have to dig for it */}
      {p1Modules.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-[11px] font-bold text-white">1</span>
                {t('Phase 1 诊断回顾', 'Phase 1 Diagnostic Recap')}
              </CardTitle>
              <Link
                href="/diagnostic"
                className="cursor-pointer text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                {t('查看完整 Phase 1 分析 →', 'View full Phase 1 analysis →')}
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('作战图基于以下六大结构评分生成。', 'The battle map is built on top of these six-structure scores.')}
            </p>
          </CardHeader>
          <CardContent>
            {/* Overall + stage (if we have the live diagnostic) */}
            {phase1 && (phase1.overall_score != null || phase1.enterprise_stage) && (
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {phase1.overall_score != null && (
                  <div>
                    <p className={`text-2xl font-bold ${scoreColor(phase1.overall_score)}`}>
                      {phase1.overall_score}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{t('总分', 'Overall')}</p>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {phase1.overall_rating && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 w-fit">
                      {phase1.overall_rating}
                    </Badge>
                  )}
                  {phase1.enterprise_stage && (
                    <Badge variant="outline" className="text-xs px-2.5 py-0.5 w-fit">
                      {phase1.enterprise_stage}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Six module scores */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {p1Modules.map((m: any) => {
                const score = typeof m.score === 'number' ? m.score : Number(m.score) || 0;
                return (
                  <div key={m.key}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-gray-700">
                        {t(m.name_zh || `Module ${m.key}`, m.name_en || `Module ${m.key}`)}
                      </span>
                      <span className={`text-xs font-bold ${scoreColor(score)}`}>{score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200">
                      <div
                        className={`h-1.5 rounded-full transition-all ${barColor(score)}`}
                        style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 priorities */}
      {priorities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('三大升级重点', 'Top 3 Priorities')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {priorities.map((p: any) => (
              <div key={p.rank} className="flex items-start gap-3 rounded-lg border p-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shrink-0">
                  {p.rank}
                </span>
                <div>
                  <p className="text-sm font-semibold">{t(p.title_zh, p.title_en)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t(p.action_zh, p.action_en)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Do-not-do */}
      {doNotDo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('当前不建议动作', 'Currently Not Recommended')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {doNotDo.map((d: any, i: number) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/40 p-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{t(d.title_zh, d.title_en)}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{t(d.reason_zh, d.reason_en)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Signature modules */}
      {modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('四大作战模块', 'Four Signature Modules')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {modules.map((m: any) => (
              <div key={m.code} className="rounded-lg border p-3">
                <p className="text-xs font-bold text-emerald-700 mb-1">
                  {m.code}｜{t(m.title_zh, m.title_en)}
                </p>
                <p className="text-xs text-gray-600">{t(m.action_zh, m.action_en)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {timeline['90d'] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('时间轴作战清单', 'Timeline Battle Plan')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {(['90d', '180d', '12m'] as const).map((k) => {
              const label = k === '90d' ? t('未来 90 天', 'Next 90 days')
                : k === '180d' ? t('未来 180 天', 'Next 180 days')
                : t('未来 12 个月', 'Next 12 months');
              const items: string[] = timeline[k] || [];
              if (!items.length) return null;
              return (
                <div key={k}>
                  <p className="text-xs font-bold text-emerald-700 mb-1.5">{label}</p>
                  <ul className="ml-4 flex flex-col gap-1">
                    {items.map((item, i) => (
                      <li key={i} className="text-xs text-gray-700 leading-relaxed list-disc">{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Per-section AI analyses (recap of what customer saw while filling) */}
      {analysesList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('分区 AI 分析回顾', 'Section-by-Section Analyses')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {analysesList.map(([key, value]: any) => (
              <div key={key} className="rounded-lg border p-3">
                <p className="text-xs font-bold text-emerald-700 mb-1.5 uppercase">
                  {key}
                </p>
                <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {t(value.analysis_zh || '', value.analysis_en || '')}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Advisor finalization notice — replaces the customer-side "generate report" CTA */}
      <Card className="border-blue-200 bg-blue-50/40">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1 text-blue-900">
                {t('完整 10 章作战方案由顾问为你生成', 'The full 10-chapter playbook is prepared by your advisor')}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t(
                  '你已经完成作战图问卷并拿到分区分析和作战骨架。接下来，IIFLE 顾问会基于这些数据为你生成完整的 10 章专属作战方案（涵盖商业模式升级、组织与 KPI、股权治理、估值与融资路径、90/180/365 天动作清单等），并与你一起复盘下一步。',
                  'You\'ve completed the battle map questionnaire and have your section analyses + skeleton. An IIFLE advisor will now build your full 10-chapter playbook (business model upgrade, org & KPIs, equity & governance, valuation & financing path, 90/180/365-day action list) and walk through next steps with you.',
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
