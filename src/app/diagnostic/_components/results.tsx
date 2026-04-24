'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { ListingRequirements } from './listing-requirements';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from 'recharts';

const RATING_LABEL: Record<string, string> = {
  Strong: '优秀', Medium: '中等', Developing: '发展中', Weak: '薄弱',
};

function scoreColor(s: number) {
  if (s >= 80) return 'text-emerald-600';
  if (s >= 60) return 'text-yellow-600';
  if (s >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function scoreBarColor(s: number) {
  if (s >= 80) return 'bg-emerald-500';
  if (s >= 60) return 'bg-yellow-500';
  if (s >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

interface Props {
  diagnosticId: string;
  data: any;
  onRestart: () => void;
}

export function Results({ diagnosticId, data, onRestart }: Props) {
  const { t } = useT();

  const score = data?.overall_score ?? 0;
  const rating = data?.overall_rating ?? '';
  const stage = data?.enterprise_stage ?? '';
  const raw = data?.module_scores ?? {};
  const findings = data?.key_findings ?? [];

  const modules = Object.entries(raw)
    .filter(([k]) => k !== '_meta')
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([k, m]: [string, any]) => ({ ...m, key: k }));

  const radarData = modules.map((m: any) => ({
    module: t(m.name_zh, m.name_en),
    score: m.score ?? 0,
    fullMark: 100,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-6">
      {/* ── Completion hero ── */}
      <div className="relative rounded-3xl border border-slate-200 bg-white p-8 text-center overflow-hidden shadow-[var(--shadow-soft)]">
        {/* Decorative gold pattern */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--gold-soft)]/40 via-white to-emerald-50/30" />
        <div className="pointer-events-none absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[var(--gold)]/40 rounded-tl-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[var(--gold)]/40 rounded-br-3xl" />

        <div className="relative">
          <div className="ornament-diamonds mb-4 opacity-70">
            <span className="rule" />
            <span className="diamond" />
            <span className="diamond" />
            <span className="diamond" />
            <span className="rule" />
          </div>

          <p className="eyebrow mb-2">{t('诊断完成', 'Diagnostic Complete')}</p>

          <h2 className="font-display text-2xl font-bold text-slate-900 mb-5">
            {t('你的六大结构评分已生成', 'Your six-structure diagnostic is ready')}
          </h2>

          <div className="flex items-center justify-center gap-6 mb-5">
            <div>
              <p className={`font-display text-6xl font-bold leading-none ${scoreColor(score)}`}>
                {score}
              </p>
              <p className="mt-2 text-[10px] tracking-widest uppercase text-slate-500">
                {t('综合评分', 'Overall Score')} / 100
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {rating && (
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm px-3 py-1">
                {rating}
              </Badge>
            )}
            {stage && (
              <Badge
                className="text-sm px-3 py-1 border"
                style={{ background: 'var(--gold-soft)', color: 'var(--gold-dark)', borderColor: 'rgba(184,137,62,0.3)' }}
              >
                {stage}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ── Radar ── */}
      {radarData.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <p className="eyebrow mb-0.5">{t('六大结构', 'Six Structures')}</p>
              <h3 className="font-display text-lg font-bold text-slate-900">
                {t('评分雷达图', 'Module Score Radar')}
              </h3>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="module" tick={{ fontSize: 12, fill: '#334155' }} />
                <Radar
                  dataKey="score"
                  stroke="var(--gold)"
                  fill="var(--gold)"
                  fillOpacity={0.22}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Module breakdown ── */}
      {modules.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-5">
            <p className="eyebrow mb-0.5">{t('模块明细', 'Module Breakdown')}</p>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {t('六大结构得分', 'Six-Structure Scores')}
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            {modules.map((m: any) => (
              <div key={m.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-xs font-bold text-[var(--gold-dark)]">
                      {String(m.key).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {t(m.name_zh, m.name_en)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.rating && (
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                        {t(RATING_LABEL[m.rating] || m.rating, m.rating)}
                      </span>
                    )}
                    <span className={`text-sm font-bold ${scoreColor(m.score)}`}>{m.score}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(m.score)}`}
                    style={{ width: `${m.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Findings ── */}
      {findings.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <p className="eyebrow mb-0.5">{t('关键发现', 'Key Findings')}</p>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {t('AI 顾问识别的重点', "What the AI consultant flagged")}
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {findings.map((f: any, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3.5"
              >
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                    f.severity === 'high'
                      ? 'bg-red-500'
                      : f.severity === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t(f.title_zh, f.title_en)}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {t(f.description_zh, f.description_en)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Listing requirements reference ── */}
      <ListingRequirements enterpriseStage={stage} />

      {/* ── Battle map CTA ── */}
      <div className="relative rounded-2xl border border-[var(--gold)]/25 bg-gradient-to-br from-[var(--gold-soft)]/50 via-white to-white p-6 overflow-hidden shadow-[var(--shadow-soft)]">
        <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-[var(--gold)]/30 rounded-tr-2xl" />
        <div className="relative flex items-start gap-4">
          <div
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold shrink-0 text-xs tracking-wider"
            style={{ backgroundImage: 'linear-gradient(135deg, #c89749 0%, #8f6a2c 100%)' }}
          >
            1.5
          </div>
          <div className="flex-1">
            <p className="eyebrow mb-1">{t('下一步', 'Next step')}</p>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-1.5">
              {t('继续生成战略作战图', 'Continue to the Strategic Battle Map')}
            </h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {t(
                '基于你的六大结构分数，AI 会从复制扩张、融资准备、资本化推进三类作战图中为你匹配最合适的一份。',
                'Based on your six-structure scores, AI matches you with the right battle map variant — Replication, Financing, or Capitalization.',
              )}
            </p>
            <Link href="/battlemap" className="btn-gold h-10 px-5">
              {t('开启作战图', 'Open Battle Map')} →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Restart ── */}
      <div className="flex justify-center pb-4">
        <Button
          variant="outline"
          onClick={onRestart}
          className="cursor-pointer h-10 px-6 rounded-xl text-slate-500 hover:text-slate-700"
        >
          {t('重新诊断', 'Start new diagnostic')}
        </Button>
      </div>
    </div>
  );
}
