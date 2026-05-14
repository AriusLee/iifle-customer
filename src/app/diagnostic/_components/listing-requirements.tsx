'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n';
import {
  pickHighlightFromQ33,
  pickTiersForStage,
  type Jurisdiction,
  type ListingTier,
} from '@/lib/listing-requirements';

interface Props {
  enterpriseStage: string | null | undefined;
  /** Optional founder Q33 answer — drives which column gets the ⭐ highlight. */
  q33Answer?: string | null;
}

/**
 * Side-by-side reference panel showing Bursa Malaysia (SC), HKEX (SFC), and
 * NASDAQ (SEC) listing requirements for the tier most appropriate to the
 * company's detected enterprise stage. When the founder picks a specific
 * IPO market in Q33, that column is highlighted with a ⭐ + gold ring.
 */
export function ListingRequirements({ enterpriseStage, q33Answer }: Props) {
  const { t } = useT();
  const tiers = pickTiersForStage(enterpriseStage);
  const highlight = pickHighlightFromQ33(q33Answer);

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
              {t('上市要求对比 — 马来西亚 · 香港 · 美国', 'Listing Requirements — MY · HK · US')}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              {t(tiers.rationale_zh, tiers.rationale_en)}
            </p>
            {highlight && (
              <p className="text-[11px] text-amber-700 font-medium mt-1.5 leading-relaxed">
                ⭐{' '}
                {t(
                  '已根据您选择的目标市场（Q33）高亮对应列。',
                  "Highlighting your preferred listing market from Q33."
                )}
              </p>
            )}
          </div>
        </div>

        {/* Three-column comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TierColumn tier={tiers.my} t={t} accent="emerald" highlighted={highlight === 'MY'} />
          <TierColumn tier={tiers.hk} t={t} accent="rose" highlighted={highlight === 'HK'} />
          <TierColumn tier={tiers.us} t={t} accent="blue" highlighted={highlight === 'US'} />
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

const FLAG: Record<Jurisdiction, string> = { MY: '🇲🇾', HK: '🇭🇰', US: '🇺🇸' };

function TierColumn({
  tier,
  t,
  accent,
  highlighted,
}: {
  tier: ListingTier;
  t: (zh: string, en: string) => string;
  accent: 'emerald' | 'rose' | 'blue';
  highlighted: boolean;
}) {
  const badgeColor =
    accent === 'emerald'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : accent === 'rose'
        ? 'bg-rose-100 text-rose-700 border-rose-200'
        : 'bg-blue-100 text-blue-700 border-blue-200';

  const containerClass = highlighted
    ? 'rounded-xl border-2 border-amber-400 bg-gradient-to-br from-amber-50/70 to-white p-3.5 ring-2 ring-amber-200 shadow-sm'
    : 'rounded-xl border bg-white p-3.5';

  return (
    <div className={containerClass}>
      {/* Tier header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          {highlighted && <span className="text-sm" aria-label="preferred market">⭐</span>}
          <span className="text-base">{FLAG[tier.jurisdiction]}</span>
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
