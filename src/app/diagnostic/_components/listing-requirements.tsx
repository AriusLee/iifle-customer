'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n';
import { pickTiersForStage, type ListingTier } from '@/lib/listing-requirements';

interface Props {
  enterpriseStage: string | null | undefined;
}

/**
 * Side-by-side reference panel showing Bursa Malaysia (SC) and US SEC
 * listing requirements for the tier most appropriate to the company's
 * detected enterprise stage. Reference info only — no pass/fail badges.
 */
export function ListingRequirements({ enterpriseStage }: Props) {
  const { t } = useT();
  const pair = pickTiersForStage(enterpriseStage);

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/40 to-white overflow-hidden">
      <CardContent className="pt-5 pb-5">
        {/* Header */}
        <div className="flex items-start gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 shrink-0">
            <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {t('上市要求对比 — 马来西亚 SC 与 美国 SEC', 'Listing Requirements — Bursa SC vs US SEC')}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              {t(pair.rationale_zh, pair.rationale_en)}
            </p>
          </div>
        </div>

        {/* Two-column comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TierColumn tier={pair.my} t={t} accent="emerald" />
          <TierColumn tier={pair.us} t={t} accent="blue" />
        </div>

        {/* Disclaimer */}
        <p className="mt-3 text-[10px] text-gray-400 leading-relaxed">
          {t(
            '* 以上条件为公开披露的上市规则参考摘要，实际申报需根据交易所最新规定及保荐机构意见为准。',
            '* The above is a reference summary of publicly disclosed listing rules. Actual eligibility requires the latest exchange rules and sponsor advisory.'
          )}
        </p>
      </CardContent>
    </Card>
  );
}

/* ── Single jurisdiction column ───────────────────────────────────────── */

function TierColumn({
  tier,
  t,
  accent,
}: {
  tier: ListingTier;
  t: (zh: string, en: string) => string;
  accent: 'emerald' | 'blue';
}) {
  const badgeColor =
    accent === 'emerald'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';
  const flag = tier.jurisdiction === 'MY' ? '🇲🇾' : '🇺🇸';

  return (
    <div className="rounded-xl border bg-white p-3.5">
      {/* Tier header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{flag}</span>
          <Badge className={`${badgeColor} text-[10px] font-bold border px-2 py-0.5`}>
            {tier.regulator}
          </Badge>
          <span className="text-[10px] text-gray-400">{t(tier.exchange_zh, tier.exchange_en)}</span>
        </div>
        <p className="text-sm font-bold text-gray-800">{t(tier.board_zh, tier.board_en)}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
          {t(tier.tagline_zh, tier.tagline_en)}
        </p>
      </div>

      {/* Criteria list */}
      <div className="flex flex-col gap-2">
        {tier.criteria.map((c) => (
          <div key={c.key} className="border-t pt-2 first:border-t-0 first:pt-0">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
              {t(c.label_zh, c.label_en)}
            </p>
            <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">
              {t(c.value_zh, c.value_en)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
