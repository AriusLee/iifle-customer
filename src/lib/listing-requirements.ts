/**
 * Listing requirements reference data — Bursa Malaysia (SC) + US (SEC).
 *
 * Auto-selects an appropriate tier per jurisdiction based on the company's
 * detected enterprise stage from the diagnostic. The mapping pairs:
 *
 *   概念萌芽期 / 初创探索期 / 模式验证期  →  ACE Market   +  NASDAQ Capital Market
 *   规模扩张期                            →  Main Market  +  NASDAQ Global Market
 *   资本进阶期                            →  Main Market  +  NASDAQ Global Select
 *
 * Numbers are based on publicly available listing rules from Bursa Malaysia
 * Listing Requirements and Nasdaq Listing Rule 5000 series. They are
 * presented as reference benchmarks — actual eligibility requires formal
 * advisory review.
 */

export interface Criterion {
  key: string;
  label_zh: string;
  label_en: string;
  value_zh: string;
  value_en: string;
}

export interface ListingTier {
  code: string;
  jurisdiction: 'MY' | 'US';
  regulator: 'SC' | 'SEC';
  exchange_zh: string;
  exchange_en: string;
  board_zh: string;
  board_en: string;
  tagline_zh: string;
  tagline_en: string;
  criteria: Criterion[];
}

// ── Bursa Malaysia ────────────────────────────────────────────────────────────

const ACE_MARKET: ListingTier = {
  code: 'BURSA_ACE',
  jurisdiction: 'MY',
  regulator: 'SC',
  exchange_zh: '马来西亚证券交易所',
  exchange_en: 'Bursa Malaysia',
  board_zh: 'ACE 创业板',
  board_en: 'ACE Market',
  tagline_zh: '面向具备成长潜力的中小企业，无强制盈利门槛，以保荐人制度为核心。',
  tagline_en: 'For high-growth SMEs. No mandatory profit threshold; sponsor-driven admission.',
  criteria: [
    {
      key: 'profit',
      label_zh: '盈利要求',
      label_en: 'Profit Requirement',
      value_zh: '无强制要求',
      value_en: 'None mandated',
    },
    {
      key: 'revenue',
      label_zh: '营收要求',
      label_en: 'Revenue Requirement',
      value_zh: '无强制要求',
      value_en: 'None mandated',
    },
    {
      key: 'history',
      label_zh: '经营年限',
      label_en: 'Operating History',
      value_zh: '无强制要求',
      value_en: 'Not strictly required',
    },
    {
      key: 'sponsor',
      label_zh: '保荐人',
      label_en: 'Sponsor',
      value_zh: '必须委任授权保荐人，上市后至少 3 年',
      value_en: 'Authorised Sponsor required, minimum 3 years post-listing',
    },
    {
      key: 'public_spread',
      label_zh: '公众持股',
      label_en: 'Public Spread',
      value_zh: '≥ 25% 已发行股本',
      value_en: '≥ 25% of issued share capital',
    },
    {
      key: 'shareholders',
      label_zh: '公众股东人数',
      label_en: 'Public Shareholders',
      value_zh: '≥ 200 名（每人持股 ≥ 100 股）',
      value_en: '≥ 200 holders (≥ 100 shares each)',
    },
    {
      key: 'governance',
      label_zh: '董事会治理',
      label_en: 'Board Governance',
      value_zh: '≥ 1/3 独立董事，须设审计委员会',
      value_en: '≥ 1/3 independent directors; audit committee required',
    },
  ],
};

const MAIN_MARKET: ListingTier = {
  code: 'BURSA_MAIN',
  jurisdiction: 'MY',
  regulator: 'SC',
  exchange_zh: '马来西亚证券交易所',
  exchange_en: 'Bursa Malaysia',
  board_zh: '主板（盈利测试）',
  board_en: 'Main Market (Profit Test)',
  tagline_zh: '面向已实现稳定盈利的成熟企业，盈利、规模、治理三方面均有明确门槛。',
  tagline_en: 'For mature, profitable companies. Hard thresholds on earnings, size, and governance.',
  criteria: [
    {
      key: 'profit',
      label_zh: '盈利要求',
      label_en: 'Profit Requirement',
      value_zh: '过去 3–5 年累计税后净利 ≥ RM 20M，最近一年税后净利 ≥ RM 6M',
      value_en: 'Aggregate PAT ≥ RM 20M over 3–5 yrs; latest year PAT ≥ RM 6M',
    },
    {
      key: 'profit_continuity',
      label_zh: '盈利连续性',
      label_en: 'Profit Continuity',
      value_zh: '连续 3–5 年不间断盈利',
      value_en: '3–5 consecutive years of uninterrupted profit',
    },
    {
      key: 'history',
      label_zh: '经营年限',
      label_en: 'Operating History',
      value_zh: '同一管理层下经营 ≥ 3–5 年',
      value_en: '≥ 3–5 yrs under same management',
    },
    {
      key: 'public_spread',
      label_zh: '公众持股',
      label_en: 'Public Spread',
      value_zh: '≥ 25% 已发行股本',
      value_en: '≥ 25% of issued share capital',
    },
    {
      key: 'shareholders',
      label_zh: '公众股东人数',
      label_en: 'Public Shareholders',
      value_zh: '≥ 1,000 名',
      value_en: '≥ 1,000 holders',
    },
    {
      key: 'governance',
      label_zh: '董事会治理',
      label_en: 'Board Governance',
      value_zh: '≥ 1/3 独立董事，须设审计、提名、薪酬委员会',
      value_en: '≥ 1/3 independent directors; audit, nomination, remuneration committees',
    },
    {
      key: 'reporting',
      label_zh: '财务披露',
      label_en: 'Financial Reporting',
      value_zh: '上市前 3 年经审计财务报表（MFRS / IFRS）',
      value_en: '3 yrs of audited financial statements (MFRS / IFRS) prior to listing',
    },
  ],
};

// ── United States — NASDAQ tiers ──────────────────────────────────────────────

const NASDAQ_CAPITAL: ListingTier = {
  code: 'NASDAQ_CAPITAL',
  jurisdiction: 'US',
  regulator: 'SEC',
  exchange_zh: '美国 NASDAQ 交易所',
  exchange_en: 'NASDAQ',
  board_zh: 'NASDAQ Capital Market（入门板）',
  board_en: 'NASDAQ Capital Market',
  tagline_zh: '美国 NASDAQ 三层结构中门槛最低的入门板，适合早期阶段的企业。',
  tagline_en: 'Entry tier of NASDAQ\u2019s three-tier structure. Suited to earlier-stage companies.',
  criteria: [
    {
      key: 'profit',
      label_zh: '盈利要求（任选一项标准）',
      label_en: 'Profit Requirement (one standard)',
      value_zh: '净利润标准：最近一财年净利润 ≥ USD 750K',
      value_en: 'Net Income standard: latest fiscal year net income ≥ USD 750K',
    },
    {
      key: 'equity',
      label_zh: '股东权益',
      label_en: 'Stockholders\u2019 Equity',
      value_zh: '股东权益标准：≥ USD 5M',
      value_en: 'Equity standard: ≥ USD 5M',
    },
    {
      key: 'market_value',
      label_zh: '公众持股市值',
      label_en: 'Market Value of Public Float',
      value_zh: '≥ USD 15M（净利润标准下 ≥ USD 5M）',
      value_en: '≥ USD 15M (≥ USD 5M under net income standard)',
    },
    {
      key: 'history',
      label_zh: '经营年限',
      label_en: 'Operating History',
      value_zh: '≥ 2 年',
      value_en: '≥ 2 years',
    },
    {
      key: 'public_shares',
      label_zh: '公众持股数量',
      label_en: 'Publicly Held Shares',
      value_zh: '≥ 1,000,000 股',
      value_en: '≥ 1,000,000 shares',
    },
    {
      key: 'shareholders',
      label_zh: '公众股东人数',
      label_en: 'Round-lot Holders',
      value_zh: '≥ 300 名整手股东',
      value_en: '≥ 300 round-lot holders',
    },
    {
      key: 'price',
      label_zh: '最低股价',
      label_en: 'Minimum Bid Price',
      value_zh: '≥ USD 4.00',
      value_en: '≥ USD 4.00',
    },
    {
      key: 'governance',
      label_zh: '公司治理',
      label_en: 'Corporate Governance',
      value_zh: '独立董事多数席位 + 审计委员会（萨班斯法案合规）',
      value_en: 'Majority independent board + audit committee (SOX compliant)',
    },
  ],
};

const NASDAQ_GLOBAL: ListingTier = {
  code: 'NASDAQ_GLOBAL',
  jurisdiction: 'US',
  regulator: 'SEC',
  exchange_zh: '美国 NASDAQ 交易所',
  exchange_en: 'NASDAQ',
  board_zh: 'NASDAQ Global Market（中阶板）',
  board_en: 'NASDAQ Global Market',
  tagline_zh: '面向已具备稳定盈利和一定规模的成长型企业。',
  tagline_en: 'For growth companies with established earnings and meaningful scale.',
  criteria: [
    {
      key: 'profit',
      label_zh: '盈利要求',
      label_en: 'Income Standard',
      value_zh: '持续经营税前利润 ≥ USD 1M（最近一年或最近 3 年中的 2 年）',
      value_en: 'Pre-tax income from continuing operations ≥ USD 1M (latest yr or 2 of last 3)',
    },
    {
      key: 'equity',
      label_zh: '股东权益',
      label_en: 'Stockholders\u2019 Equity',
      value_zh: '≥ USD 15M',
      value_en: '≥ USD 15M',
    },
    {
      key: 'market_value',
      label_zh: '公众持股市值',
      label_en: 'Market Value of Public Float',
      value_zh: '≥ USD 8M',
      value_en: '≥ USD 8M',
    },
    {
      key: 'public_shares',
      label_zh: '公众持股数量',
      label_en: 'Publicly Held Shares',
      value_zh: '≥ 1,100,000 股',
      value_en: '≥ 1,100,000 shares',
    },
    {
      key: 'shareholders',
      label_zh: '公众股东人数',
      label_en: 'Round-lot Holders',
      value_zh: '≥ 400 名整手股东',
      value_en: '≥ 400 round-lot holders',
    },
    {
      key: 'price',
      label_zh: '最低股价',
      label_en: 'Minimum Bid Price',
      value_zh: '≥ USD 4.00',
      value_en: '≥ USD 4.00',
    },
    {
      key: 'governance',
      label_zh: '公司治理',
      label_en: 'Corporate Governance',
      value_zh: '独立董事多数席位 + 审计/提名/薪酬委员会（SOX 合规）',
      value_en: 'Majority independent board + audit/nomination/comp committees (SOX)',
    },
    {
      key: 'reporting',
      label_zh: '财务披露',
      label_en: 'Financial Reporting',
      value_zh: 'US GAAP 或 IFRS 审计；季报 + 年报 (10-Q / 10-K)',
      value_en: 'Audited US GAAP or IFRS; quarterly + annual filings (10-Q / 10-K)',
    },
  ],
};

const NASDAQ_GLOBAL_SELECT: ListingTier = {
  code: 'NASDAQ_GLOBAL_SELECT',
  jurisdiction: 'US',
  regulator: 'SEC',
  exchange_zh: '美国 NASDAQ 交易所',
  exchange_en: 'NASDAQ',
  board_zh: 'NASDAQ Global Select（旗舰板）',
  board_en: 'NASDAQ Global Select Market',
  tagline_zh: 'NASDAQ 三层中要求最严苛的旗舰板，对标全球大型成熟企业。',
  tagline_en: 'NASDAQ\u2019s most stringent tier — peer to large, established global companies.',
  criteria: [
    {
      key: 'profit',
      label_zh: '盈利要求（最常用标准）',
      label_en: 'Earnings Standard',
      value_zh: '过去 3 年累计税前利润 ≥ USD 11M，且最近 2 年每年 ≥ USD 2.2M',
      value_en: 'Aggregate pre-tax earnings ≥ USD 11M over 3 yrs; ≥ USD 2.2M each of latest 2',
    },
    {
      key: 'market_value',
      label_zh: '公众持股市值',
      label_en: 'Market Value of Public Float',
      value_zh: '≥ USD 45M',
      value_en: '≥ USD 45M',
    },
    {
      key: 'public_shares',
      label_zh: '公众持股数量',
      label_en: 'Publicly Held Shares',
      value_zh: '≥ 1,250,000 股',
      value_en: '≥ 1,250,000 shares',
    },
    {
      key: 'shareholders',
      label_zh: '公众股东人数',
      label_en: 'Round-lot Holders',
      value_zh: '≥ 450 名整手股东，或 ≥ 2,200 名总股东',
      value_en: '≥ 450 round-lot holders, or ≥ 2,200 total holders',
    },
    {
      key: 'price',
      label_zh: '最低股价',
      label_en: 'Minimum Bid Price',
      value_zh: '≥ USD 4.00',
      value_en: '≥ USD 4.00',
    },
    {
      key: 'governance',
      label_zh: '公司治理',
      label_en: 'Corporate Governance',
      value_zh: '独立董事多数席位 + 审计/提名/薪酬委员会（SOX 全面合规）',
      value_en: 'Majority independent board + audit/nomination/comp committees (full SOX)',
    },
    {
      key: 'reporting',
      label_zh: '财务披露',
      label_en: 'Financial Reporting',
      value_zh: 'US GAAP 或 IFRS 审计；季报 + 年报 (10-Q / 10-K)，具备投资级合规水准',
      value_en: 'Audited US GAAP or IFRS; quarterly + annual filings; investor-grade compliance',
    },
  ],
};

// ── Tier auto-pick by enterprise stage ────────────────────────────────────────

interface TierPair {
  my: ListingTier;
  us: ListingTier;
  rationale_zh: string;
  rationale_en: string;
}

const EARLY_STAGE_PAIR: TierPair = {
  my: ACE_MARKET,
  us: NASDAQ_CAPITAL,
  rationale_zh:
    '当前阶段企业以模式验证和稳定经营为重点，尚未达到主板/旗舰板的盈利门槛。' +
    '我们对标的是两个市场中"门槛最低的入门通道"——马来西亚 ACE 创业板和美国 NASDAQ Capital Market。',
  rationale_en:
    'At this stage the priority is model validation and stable operations — well before main-board / flagship-tier earnings thresholds. ' +
    'We benchmark against the entry tier of each market: Bursa ACE Market and NASDAQ Capital Market.',
};

const SCALING_PAIR: TierPair = {
  my: MAIN_MARKET,
  us: NASDAQ_GLOBAL,
  rationale_zh:
    '企业已进入规模扩张阶段，盈利与营收开始具备主板级潜力。' +
    '我们对标的是马来西亚主板（盈利测试）和美国 NASDAQ Global Market 中阶板。',
  rationale_en:
    'The company is scaling, with earnings and revenue approaching main-board territory. ' +
    'We benchmark against Bursa Main Market (Profit Test) and NASDAQ Global Market.',
};

const CAPITAL_READY_PAIR: TierPair = {
  my: MAIN_MARKET,
  us: NASDAQ_GLOBAL_SELECT,
  rationale_zh:
    '企业已具备资本化条件，可以认真评估两地最严苛的旗舰上市路径。' +
    '我们对标的是马来西亚主板和美国 NASDAQ Global Select 旗舰板。',
  rationale_en:
    'The company is capital-ready and can credibly evaluate flagship listing pathways in both markets. ' +
    'We benchmark against Bursa Main Market and NASDAQ Global Select.',
};

/**
 * Pick the appropriate Bursa + NASDAQ tier pair based on the company's
 * detected enterprise stage. Defaults to the early-stage pair if the stage
 * label is missing or unrecognized.
 */
export function pickTiersForStage(stage: string | null | undefined): TierPair {
  const s = stage ?? '';
  if (s.includes('资本进阶')) return CAPITAL_READY_PAIR;
  if (s.includes('规模扩张')) return SCALING_PAIR;
  // 概念萌芽 / 初创探索 / 模式验证 / unknown → early-stage pair
  return EARLY_STAGE_PAIR;
}
