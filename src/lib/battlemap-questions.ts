/**
 * 战略作战图 (Strategic Battle Map) questionnaire.
 *
 * 35 questions across 8 modules (a–h). Drives a backend classifier that picks
 * one of three report variants: Replication / Financing / Capitalization.
 *
 * Shape is compatible with the Phase 1 `questions.ts` pattern — all options
 * have zh/en, plus a `kind` of 'single' or 'open' (no multi-select).
 */

export interface BMOption {
  value: string;
  zh: string;
  en: string;
}

export type BMQuestionKind = 'single' | 'open';

export interface BMQuestion {
  id: string;           // e.g. 'Q01'
  zh: string;
  en: string;
  kind: BMQuestionKind;
  options?: BMOption[]; // required for single; omitted for open
  placeholder_zh?: string;
  placeholder_en?: string;
}

export interface BMSection {
  key: string;          // lowercase 'a'–'h'
  zh: string;
  en: string;
  desc_zh: string;
  desc_en: string;
  questions: BMQuestion[];
}

function o(zh: string, en: string): BMOption {
  return { value: zh, zh, en };
}

// ── Shared option sets (mirrors client's 选项库 sheet) ──────────────────────

const GOAL_12M = [
  o('稳定盈利', 'Stable profit'),
  o('提高利润', 'Improve margin'),
  o('建立可复制模式', 'Build replicable model'),
  o('扩张到新区域 / 新门店 / 新团队', 'Expand to new region / store / team'),
  o('完成融资准备', 'Complete fundraising prep'),
  o('完成BP / 路演材料', 'Complete BP / roadshow deck'),
  o('启动资本化 / 上市规划', 'Start capitalization / IPO plan'),
];
const CURRENT_PAIN = [
  o('增长变慢', 'Growth slowing'),
  o('太依赖老板', 'Too founder-dependent'),
  o('团队承接不住', 'Team can\'t keep up'),
  o('模式难复制', 'Model hard to replicate'),
  o('利润质量不稳', 'Unstable profit quality'),
  o('财务不规范', 'Financials not standardized'),
  o('股权结构不清', 'Unclear equity structure'),
  o('不知道如何融资', 'Don\'t know how to fundraise'),
  o('不知道如何讲估值故事', 'Can\'t tell valuation story'),
];
const CAPITAL_ACTION = [
  o('暂不考虑资本动作', 'No capital action yet'),
  o('先做内部结构升级', 'Internal structure first'),
  o('融资准备', 'Fundraising prep'),
  o('正式融资', 'Formal fundraising'),
  o('商业计划书 / BP', 'Business plan / BP'),
  o('并购 / 被并购准备', 'M&A prep'),
  o('上市规划', 'IPO plan'),
];
const REVENUE_SOURCE = [
  o('单一产品 / 单一服务', 'Single product / service'),
  o('少数核心客户', 'Few core customers'),
  o('多产品组合', 'Multiple product mix'),
  o('多门店 / 多区域', 'Multi-store / multi-region'),
  o('平台交易 / 抽成', 'Platform commission'),
  o('其他', 'Other'),
];
const CONCENTRATION = [
  o('非常高', 'Very high'),
  o('较高', 'High'),
  o('一般', 'Average'),
  o('较分散', 'Fairly diversified'),
  o('很分散', 'Very diversified'),
];
const PROFIT_MODEL = [
  o('一次性交易', 'One-time'),
  o('重复采购', 'Repeat purchase'),
  o('长期客户续费', 'Long-term renewal'),
  o('订阅 / 月费', 'Subscription'),
  o('组合式收入', 'Mixed revenue'),
  o('目前尚不稳定', 'Not yet stable'),
];
const REPLICATION_MATURITY = [
  o('几乎不能', 'Almost not'),
  o('难度较高', 'Difficult'),
  o('有机会', 'Possible'),
  o('已有一定验证', 'Some validation'),
  o('已较成熟', 'Fairly mature'),
];
const OFFSITE_VALIDATION = [
  o('还没有', 'Not yet'),
  o('有尝试但不稳定', 'Tried but unstable'),
  o('有部分验证', 'Partial validation'),
  o('已初步验证', 'Initial validation'),
  o('已较成熟复制', 'Mature replication'),
];
const SOP_MATURITY = [
  o('没有', 'None'),
  o('有经验但不成体系', 'Experience but no system'),
  o('有基础流程', 'Basic process'),
  o('有较完整 SOP', 'Fairly complete SOP'),
  o('可复制给他人执行', 'Transferable to others'),
];
const FOUNDER_INDEPENDENCE = [
  o('不能', 'Cannot'),
  o('较难', 'Difficult'),
  o('一部分可以', 'Partially'),
  o('大部分可以', 'Mostly'),
  o('基本可以', 'Basically yes'),
];
const FOUNDER_ABSENCE_RISK = [
  o('销售成交', 'Sales closing'),
  o('交付运营', 'Delivery/ops'),
  o('团队管理', 'Team management'),
  o('财务管理', 'Finance'),
  o('客户维护', 'Customer relations'),
  o('整体都会受影响', 'All areas affected'),
  o('基本可正常运行', 'Runs normally'),
];
const PROFIT_STATE = [
  o('尚未盈利', 'Not yet profitable'),
  o('偶尔盈利', 'Occasional profit'),
  o('基本稳定盈利', 'Basically stable'),
  o('持续稳定盈利', 'Consistently profitable'),
  o('盈利能力较强', 'Strongly profitable'),
];
const PROFIT_STABILITY = [
  o('主要依赖偶发性收入', 'Mainly episodic income'),
  o('偏一次性项目', 'Mostly one-off projects'),
  o('一半一半', 'Half-half'),
  o('主要来自主营业务', 'Mainly core business'),
  o('非常稳定且持续', 'Very stable and recurring'),
];
const FINANCE_REGULARITY = [
  o('没有', 'None'),
  o('只有内部账', 'Internal only'),
  o('有基础财务报表', 'Basic statements'),
  o('有较规范报表', 'Fairly standardized'),
  o('有年度审计 / 较规范财务体系', 'Audited / structured system'),
];
const CAPITAL_USE_CLARITY = [
  o('还不清楚', 'Not clear'),
  o('大致知道', 'Roughly known'),
  o('基本清楚', 'Basically clear'),
  o('很清楚', 'Very clear'),
  o('已有明确预算和用途规划', 'Defined budget and plan'),
];
const MGMT_COUNT = [
  o('0位', '0'),
  o('1位', '1'),
  o('2–3位', '2–3'),
  o('4–5位', '4–5'),
  o('5位以上', '5+'),
];
const FOUNDER_RELIANCE = [
  o('成交', 'Deal closing'),
  o('关键客户维护', 'Key customers'),
  o('团队管理', 'Team management'),
  o('财务 / 决策', 'Finance / decisions'),
  o('资源整合', 'Resource integration'),
  o('几乎所有重要事项', 'Almost everything'),
];
const MIDDLE_MGMT = [
  o('没有', 'None'),
  o('很弱', 'Very weak'),
  o('有少数骨干', 'Few key people'),
  o('有基础管理层', 'Basic layer'),
  o('较成熟', 'Fairly mature'),
];
const MISSING_ROLE = [
  o('销售型人才', 'Sales talent'),
  o('运营型人才', 'Operations'),
  o('财务型人才', 'Finance'),
  o('管理型人才', 'Management'),
  o('技术 / 产品型人才', 'Tech / product'),
  o('资本 / 战略型人才', 'Capital / strategy'),
];
const EQUITY_CLARITY = [
  o('非常不清晰', 'Very unclear'),
  o('有一定混乱', 'Somewhat confused'),
  o('基本清楚', 'Basically clear'),
  o('较清晰', 'Fairly clear'),
  o('非常清晰', 'Very clear'),
];
const EQUITY_COMPLICATIONS = [
  o('代持', 'Nominee holding'),
  o('口头承诺', 'Verbal promises'),
  o('历史分配不清', 'Unclear legacy allocation'),
  o('家族成员混合持股', 'Family co-ownership'),
  o('外部股东诉求不一致', 'External SH misalignment'),
  o('以上皆无', 'None of the above'),
];
const PUB_PRIV_BOUNDARY = [
  o('很严重', 'Severe'),
  o('有明显情况', 'Clearly present'),
  o('偶尔存在', 'Occasional'),
  o('基本清楚', 'Basically clear'),
  o('已较清晰分开', 'Cleanly separated'),
];
const GOVERNANCE = [
  o('没有', 'None'),
  o('很弱', 'Very weak'),
  o('有部分机制', 'Some mechanisms'),
  o('基本建立', 'Basically established'),
  o('较规范', 'Fairly standardized'),
];
const GROWTH_STORY = [
  o('区域扩张', 'Regional expansion'),
  o('新门店 / 新网点', 'New stores / outlets'),
  o('产品升级', 'Product upgrade'),
  o('客户复购', 'Customer retention'),
  o('平台化连接', 'Platform network'),
  o('技术化升级', 'Tech upgrade'),
  o('品牌化', 'Branding'),
  o('并购整合', 'M&A rollup'),
];
const MARKET_SCOPE = [
  o('本地经营型市场', 'Local market'),
  o('城市级品牌机会', 'City brand'),
  o('全国性机会', 'National'),
  o('东南亚区域机会', 'Southeast Asia'),
  o('全球性机会', 'Global'),
  o('目前还不清楚', 'Not clear'),
];
const VALUATION_NARRATIVE = [
  o('讲不清楚', 'Can\'t articulate'),
  o('只能讲业务', 'Only ops story'),
  o('能讲部分增长逻辑', 'Partial growth logic'),
  o('能讲成长与市场空间', 'Growth + market story'),
  o('能较完整讲清估值逻辑', 'Full valuation logic'),
];
const PUSH_WILLINGNESS = [
  o('暂时不考虑', 'Not considering'),
  o('观望中', 'Watching'),
  o('愿意部分推进', 'Partial push'),
  o('愿意重点推进', 'Priority push'),
  o('愿意全面推进', 'Full push'),
];
const MGMT_PARTICIPATION = [
  o('不愿意', 'Unwilling'),
  o('暂时不会', 'Not yet'),
  o('可以部分参与', 'Partial'),
  o('愿意一起参与', 'Willing'),
  o('必须一起参与', 'Must participate'),
];
const ADJUSTMENT_WILLINGNESS = [
  o('不愿意', 'Unwilling'),
  o('较抗拒', 'Resistant'),
  o('视情况而定', 'Depends'),
  o('基本愿意', 'Basically willing'),
  o('愿意积极调整', 'Actively willing'),
];
const NEXT_STEP_SERVICE = [
  o('继续学习课程', 'Continue courses'),
  o('会员长期陪跑', 'Membership / long-term coaching'),
  o('一对一顾问深拆', '1-on-1 advisor deep-dive'),
  o('融资准备', 'Fundraising prep'),
  o('BP / 路演材料整理', 'BP / roadshow package'),
  o('资本化 / 上市前规划', 'Capitalization / pre-IPO planning'),
];

// ── Sections ──────────────────────────────────────────────────────────────

export const BM_SECTIONS: BMSection[] = [
  {
    key: 'a',
    zh: '目标与紧迫度',
    en: 'Goals & Urgency',
    desc_zh: '先把未来 12 个月最重要的目标和资本动作意图说清楚，后面章节会围绕它们展开。',
    desc_en: 'State the most important 12-month goal and capital-action intent first — later chapters build on this.',
    questions: [
      { id: 'Q01', zh: '未来12个月，你最希望企业达成的结果是什么？', en: 'What\'s your top goal for the next 12 months?', kind: 'single', options: GOAL_12M },
      { id: 'Q02', zh: '当前最困扰你的问题是什么？', en: 'What\'s bothering you most right now?', kind: 'single', options: CURRENT_PAIN },
      {
        id: 'Q03',
        zh: '如果未来12个月只能优先解决一个问题，你最想先解决什么？',
        en: 'If you could only fix one thing in 12 months, what?',
        kind: 'open',
        placeholder_zh: '请直接描述最优先事项（20–50 字）',
        placeholder_en: 'Describe the single top priority (20–50 words)',
      },
      { id: 'Q04', zh: '未来12–24个月，你最想推进哪一种资本动作？', en: 'What capital action do you want in 12–24 months?', kind: 'single', options: CAPITAL_ACTION },
    ],
  },
  {
    key: 'b',
    zh: '商业模式是否真的跑通',
    en: 'Is the Business Model Really Proven',
    desc_zh: '判断现在的收入和盈利结构，是真的模式跑通，还是少数客户或老板在撑场。',
    desc_en: 'Assess whether current revenue and profit reflect a proven model — or a few customers / the founder propping it up.',
    questions: [
      { id: 'Q05', zh: '你过去12个月的核心收入来源主要来自哪里？', en: 'Core revenue source over the last 12 months?', kind: 'single', options: REVENUE_SOURCE },
      { id: 'Q06', zh: '你的前三大客户 / 产品 / 门店收入占比是否过高？', en: 'Is top-3 customer/product/store concentration too high?', kind: 'single', options: CONCENTRATION },
      { id: 'Q07', zh: '你的盈利主要来自哪一种模式？', en: 'Which profit model drives earnings?', kind: 'single', options: PROFIT_MODEL },
      { id: 'Q08', zh: '你最赚钱的业务单元，未来能否复制到第二个区域 / 第二支团队？', en: 'Can your best unit be replicated to a second region / team?', kind: 'single', options: REPLICATION_MATURITY },
    ],
  },
  {
    key: 'c',
    zh: '复制与扩张证据',
    en: 'Replication & Expansion Evidence',
    desc_zh: '看你是否已有"不靠老板也能跑"的证据，而不只是想象中可以复制。',
    desc_en: 'Check whether replication evidence exists — not just a belief that it could work.',
    questions: [
      { id: 'Q09', zh: '你是否已在第二个城市 / 第二个团队 / 第二家门店验证成功？', en: 'Validated in a second city / team / store?', kind: 'single', options: OFFSITE_VALIDATION },
      { id: 'Q10', zh: '你的成交流程是否已有明确 SOP？', en: 'Is your sales process SOP\'d?', kind: 'single', options: SOP_MATURITY },
      { id: 'Q11', zh: '你的交付 / 服务 / 运营过程，是否可在不依赖创始人的情况下稳定完成？', en: 'Can delivery / ops run without the founder?', kind: 'single', options: FOUNDER_INDEPENDENCE },
      { id: 'Q12', zh: '如果创始人一个月不在，公司最容易先出问题的是哪一块？', en: 'If the founder is gone for a month, what breaks first?', kind: 'single', options: FOUNDER_ABSENCE_RISK },
    ],
  },
  {
    key: 'd',
    zh: '利润质量与财务准备',
    en: 'Profit Quality & Financial Readiness',
    desc_zh: '盈利是来自主营业务的稳定复购，还是一次性项目堆出来的？这是资本看你的第一层筛选。',
    desc_en: 'Are profits from recurring core business or stacked one-off projects? This is capital\'s first filter on you.',
    questions: [
      { id: 'Q13', zh: '你目前的盈利状态最接近哪一种？', en: 'Which best describes your current profitability?', kind: 'single', options: PROFIT_STATE },
      { id: 'Q14', zh: '你的利润主要来自主营业务，还是一次性项目 / 偶发性收入？', en: 'Are profits core-business or one-off / episodic?', kind: 'single', options: PROFIT_STABILITY },
      { id: 'Q15', zh: '你目前是否已有可被外部理解的财务报表或年度审计？', en: 'Do you have externally-readable financials / audit?', kind: 'single', options: FINANCE_REGULARITY },
      { id: 'Q16', zh: '你能否清楚说明未来12个月资金最主要会投向哪里？', en: 'Can you clearly state where next 12 months of capital will go?', kind: 'single', options: CAPITAL_USE_CLARITY },
    ],
  },
  {
    key: 'e',
    zh: '组织与管理层承接',
    en: 'Organization & Management',
    desc_zh: '组织承接的深度，决定企业能走多远。创始人依赖越重，估值越难抬高。',
    desc_en: 'Organizational depth caps how far the company can go. Heavy founder-dependency suppresses valuation.',
    questions: [
      { id: 'Q17', zh: '目前真正能独立带结果的核心管理层有几位？', en: 'How many real independent leaders do you have?', kind: 'single', options: MGMT_COUNT },
      { id: 'Q18', zh: '目前最依赖创始人亲自处理的事情是什么？', en: 'What does the founder still personally own?', kind: 'single', options: FOUNDER_RELIANCE },
      { id: 'Q19', zh: '你是否已有基础中层承接结构？', en: 'Do you have a basic middle-management layer?', kind: 'single', options: MIDDLE_MGMT },
      { id: 'Q20', zh: '当前最缺的核心能力岗位是哪一种？', en: 'What role are you missing most?', kind: 'single', options: MISSING_ROLE },
    ],
  },
  {
    key: 'f',
    zh: '股权与治理复杂度',
    en: 'Equity & Governance Complexity',
    desc_zh: '股权和治理是否清晰，决定未来资本动作时的速度和可执行性。',
    desc_en: 'Equity and governance clarity decide how fast capital actions can move when the time comes.',
    questions: [
      { id: 'Q21', zh: '当前股权结构是否清晰？', en: 'Is your equity structure clear?', kind: 'single', options: EQUITY_CLARITY },
      { id: 'Q22', zh: '是否存在以下情况？', en: 'Any of these equity complications?', kind: 'single', options: EQUITY_COMPLICATIONS },
      { id: 'Q23', zh: '公司与个人之间，是否仍存在账务、资源、资产混用？', en: 'Are company/personal accounts still mixed?', kind: 'single', options: PUB_PRIV_BOUNDARY },
      { id: 'Q24', zh: '目前是否已有基本治理机制？', en: 'Do you have basic governance mechanisms?', kind: 'single', options: GOVERNANCE },
    ],
  },
  {
    key: 'g',
    zh: '估值逻辑与资本叙事',
    en: 'Valuation Logic & Capital Narrative',
    desc_zh: '能不能把你的增长讲成投资人语言，决定估值讨论能不能开始。',
    desc_en: 'Whether you can translate growth into investor language decides whether valuation conversations can start.',
    questions: [
      {
        id: 'Q25',
        zh: '你认为投资人为什么会对你感兴趣？',
        en: 'Why would investors care about you?',
        kind: 'open',
        placeholder_zh: '请简述投资人可能关注的核心亮点（30–80 字）',
        placeholder_en: 'Describe what investors would notice (30–80 words)',
      },
      { id: 'Q26', zh: '你未来最大的增长故事来自哪里？', en: 'Where\'s your biggest growth story?', kind: 'single', options: GROWTH_STORY },
      { id: 'Q27', zh: '你觉得自己的市场空间更接近哪一种？', en: 'Which market scope fits you best?', kind: 'single', options: MARKET_SCOPE },
      { id: 'Q28', zh: '如果投资人问你"为什么你比同行更值钱？"你目前的状态更接近哪一种？', en: 'If an investor asks "why are you worth more than peers?" where are you?', kind: 'single', options: VALUATION_NARRATIVE },
    ],
  },
  {
    key: 'h',
    zh: '推进意愿与资源匹配',
    en: 'Willingness & Resource Match',
    desc_zh: '评估未来 90 天你和团队愿意投入多少，以及最合适的下一步服务路径。',
    desc_en: 'How much you and the team are willing to invest over the next 90 days, and the best next-step service.',
    questions: [
      { id: 'Q29', zh: '未来90天，你是否愿意投入时间推动结构升级？', en: 'Will you invest time on structural upgrades in 90 days?', kind: 'single', options: PUSH_WILLINGNESS },
      { id: 'Q30', zh: '你是否愿意让核心管理层一起参与？', en: 'Will you involve core management?', kind: 'single', options: MGMT_PARTICIPATION },
      { id: 'Q31', zh: '你是否愿意为融资 / 资本化而调整股权、组织、财务口径？', en: 'Will you adjust equity / org / financials for capital action?', kind: 'single', options: ADJUSTMENT_WILLINGNESS },
      { id: 'Q32', zh: '你认为你当前最适合进入哪一种下一步？', en: 'Which next step fits you best right now?', kind: 'single', options: NEXT_STEP_SERVICE },
      {
        id: 'Q33',
        zh: '你认为企业当前最大的结构性障碍是什么？',
        en: 'What\'s your biggest structural obstacle?',
        kind: 'open',
        placeholder_zh: '请直写最大障碍（20–60 字）',
        placeholder_en: 'State the single biggest obstacle (20–60 words)',
      },
      {
        id: 'Q34',
        zh: '你认为未来一年最值得放大的增长点是什么？',
        en: 'What growth lever deserves the most investment next year?',
        kind: 'open',
        placeholder_zh: '请直写最值得放大的增长点（20–60 字）',
        placeholder_en: 'State the single highest-value growth lever (20–60 words)',
      },
      {
        id: 'Q35',
        zh: '你最希望本次作战图帮你看清哪一件事？',
        en: 'What\'s the one thing you most want this battle map to clarify?',
        kind: 'open',
        placeholder_zh: '请写出最想从报告中获得的关键答案（20–60 字）',
        placeholder_en: 'State the single key answer you want (20–60 words)',
      },
    ],
  },
];

export const BM_TOTAL_QUESTIONS = BM_SECTIONS.reduce((n, s) => n + s.questions.length, 0);

export const BM_VARIANTS = {
  replication: {
    key: 'replication',
    name_zh: '复制扩张作战图',
    name_en: 'Replication & Expansion Battle Map',
    subtitle_zh: '从生存经营 → 稳定盈利 / 从单点 → 可复制',
    subtitle_en: 'Survival → Stable Profit / Single point → Replicable',
  },
  financing: {
    key: 'financing',
    name_zh: '融资准备作战图',
    name_en: 'Financing Readiness Battle Map',
    subtitle_zh: '稳定盈利 → 复制扩张 / 把经营语言翻译成融资语言',
    subtitle_en: 'Stable Profit → Replication / Translate ops into financing language',
  },
  capitalization: {
    key: 'capitalization',
    name_zh: '资本化推进图',
    name_en: 'Capitalization Roadmap',
    subtitle_zh: '资本准备 → 上市预备 / 把成熟业务翻译成资本市场结构',
    subtitle_en: 'Capital Ready → Pre-IPO / Translate mature business into capital structure',
  },
} as const;

export type BMVariantKey = keyof typeof BM_VARIANTS;
