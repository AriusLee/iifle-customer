'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      {/* Completion banner */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
        <CardContent className="pt-6 pb-5 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 mb-3">
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold mb-1">{t('诊断完成', 'Diagnostic Complete')}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {t('以下是您企业六大结构的诊断评分，帮助您了解企业当前的优势与不足。', 'Below are your enterprise diagnostic scores across six structural dimensions.')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <div>
              <p className={`text-5xl font-bold ${scoreColor(score)}`}>{score}</p>
              <p className="text-xs text-gray-400 mt-1">{t('总分', 'Overall')}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            {rating && <Badge className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1">{rating}</Badge>}
            {stage && <Badge className="bg-gray-100 text-gray-700 text-sm px-3 py-1">{stage}</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Radar */}
      {radarData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('模块评分雷达图', 'Module Score Radar')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="#d1d5db" />
                  <PolarAngleAxis dataKey="module" tick={{ fontSize: 12, fill: '#374151' }} />
                  <Radar dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Module breakdown */}
      {modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('模块得分明细', 'Module Breakdown')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {modules.map((m: any) => (
              <div key={m.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{t(m.name_zh, m.name_en)}</span>
                  <span className={`text-sm font-bold ${scoreColor(m.score)}`}>{m.score}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${m.score}%` }} />
                </div>
                {m.rating && <span className="text-xs text-gray-400">{t(RATING_LABEL[m.rating] || m.rating, m.rating)}</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Findings */}
      {findings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('关键发现', 'Key Findings')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {findings.map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${f.severity === 'high' ? 'bg-red-500' : f.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <div>
                  <p className="text-sm font-medium">{t(f.title_zh, f.title_en)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t(f.description_zh, f.description_en)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Listing requirements reference */}
      <ListingRequirements enterpriseStage={stage} />

      {/* CTA */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="pt-5 pb-4 text-center">
          <p className="text-sm font-semibold text-blue-800 mb-1">
            {t('想要获取完整诊断报告？', 'Want a full diagnostic report?')}
          </p>
          <p className="text-xs text-gray-500 mb-1">
            {t('我们的顾问团队将根据您的诊断结果，为您生成一份详细的独角兽成长报告，包含定制化的行动建议。', 'Our advisory team will generate a detailed Unicorn Growth Report with customized action recommendations based on your results.')}
          </p>
        </CardContent>
      </Card>

      {/* Restart */}
      <div className="flex justify-center pb-6">
        <Button variant="outline" onClick={onRestart} className="cursor-pointer h-11 px-6 rounded-xl">
          {t('重新诊断', 'Start New Diagnostic')}
        </Button>
      </div>
    </div>
  );
}
