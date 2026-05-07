export interface Option {
  value: string;
  zh: string;
  en: string;
}

export interface Question {
  id: string;
  zh: string;
  en: string;
  type: 'single' | 'multi';
  maxSelect?: number;
  options: Option[];
  // Optional sub-section divider rendered above this question.
  // Used inside Section E to separate equity-readiness from bank-loan-readiness.
  groupHeader?: {
    zh: string;
    en: string;
    desc_zh?: string;
    desc_en?: string;
  };
}

export interface Section {
  key: string; // lowercase a-f
  zh: string;
  en: string;
  desc_zh: string;
  desc_en: string;
  questions: Question[];
}

function o(zh: string, en: string): Option {
  return { value: zh, zh, en };
}

export const SECTIONS: Section[] = [
  {
    key: 'a', zh: '企业基础画像', en: 'Enterprise Profile',
    desc_zh: '了解你的企业基本情况：成立时间、行业、营收、团队规模、当前阶段。这一部分用于判断你的企业目前处于哪个成长阶段，是后续所有诊断的基础。请根据企业目前的真实情况选择，不要选"理想中"的状态。',
    desc_en: 'Tells us the basics of your company: how old it is, what industry, revenue range, team size, and current stage. This section determines which growth stage your enterprise is in and is the foundation for everything that follows. Pick the option that matches your real situation today, not where you want to be.',
    questions: [
      { id: 'Q01', zh: '你的企业目前成立多久？', en: 'How long has your enterprise been established?', type: 'single', options: [o('还未正式开始','Not yet started'), o('0–1年','0–1 year'), o('1–3年','1–3 years'), o('3–5年','3–5 years'), o('5年以上','5+ years')] },
      { id: 'Q02', zh: '创始人在本行业累计经验？', en: "Founder's cumulative industry experience?", type: 'single', options: [o('0–1年','0–1 year'), o('1–3年','1–3 years'), o('3–5年','3–5 years'), o('5–10年','5–10 years'), o('10年以上','10+ years')] },
      { id: 'Q03', zh: '行业类别？', en: 'Industry category?', type: 'single', options: [o('消费零售','Consumer Retail'), o('餐饮连锁','F&B Chain'), o('制造业','Manufacturing'), o('服务业','Services'), o('SaaS/科技','SaaS/Tech'), o('教育/培训','Education'), o('医疗/健康','Healthcare'), o('平台/交易撮合','Platform/Marketplace')] },
      { id: 'Q04', zh: '年营收区间？', en: 'Annual revenue range?', type: 'single', options: [o('还没有稳定营收','No stable revenue'), o('100万以下','Below 1M'), o('100万–500万','1M–5M'), o('500万–3000万','5M–30M'), o('3000万–1亿','30M–100M'), o('1亿以上','Above 100M')] },
      { id: 'Q05', zh: '经营利润状态？', en: 'Profit status?', type: 'single', options: [o('还在亏损','Still losing money'), o('偶尔盈利','Occasional profit'), o('已经能稳定成交','Stable transactions'), o('持续稳定盈利','Consistent profit'), o('盈利能力较强','Strong profitability')] },
      { id: 'Q06', zh: '团队规模？', en: 'Team size?', type: 'single', options: [o('5人以下','Below 5'), o('6–10人','6–10'), o('11–30人','11–30'), o('31–100人','31–100'), o('101–300人','101–300'), o('300人以上','300+')] },
      { id: 'Q07', zh: '经营状态？', en: 'Business state?', type: 'single', options: [o('还在试模式','Testing model'), o('已经能稳定成交','Stable transactions'), o('正在扩张','Expanding'), o('正在准备融资/资本动作','Preparing capital action')] },
      { id: 'Q08', zh: '企业更大目标？', en: 'Biggest goal?', type: 'single', options: [o('先活下来','Survive'), o('先稳定盈利','Stabilize profit'), o('先复制扩张','Replicate & expand'), o('先做高估值逻辑','Build valuation'), o('先进入融资/资本路径','Enter capital path')] },
    ],
  },
  {
    key: 'b', zh: '基因结构', en: 'Gene Structure (Founder Dependency)',
    desc_zh: '检测你的企业有多依赖创始人本人。一个能"做大"的企业，必须能在创始人不在的情况下继续运转和增长。这一部分判断你的企业是"老板就是公司"，还是已经形成了团队、系统和组织能力。回答时请诚实评估，不要美化。',
    desc_en: 'Measures how much your company depends on you (the founder) personally. A company that can scale must be able to run and grow even when the founder is not in the room. This section reveals whether your business is "the boss IS the company" or whether real team, systems, and organizational capability exist. Be honest — don\'t flatter yourself.',
    questions: [
      { id: 'Q09', zh: '增长最依赖什么？', en: 'Growth depends on?', type: 'single', options: [o('创始人本人','Founder'), o('少数销售高手','Few sales experts'), o('单一渠道','Single channel'), o('单一产品','Single product'), o('团队与系统共同驱动','Team + system')] },
      { id: 'Q10', zh: '最大驱动力？', en: 'Main driving force?', type: 'single', options: [o('创始人个人能力','Founder ability'), o('创始人+少数核心骨干','Founder + key people'), o('核心团队','Core team'), o('团队+组织机制','Team + org structure'), o('已开始系统化运转','Systematized')] },
      { id: 'Q11', zh: '企业定位清晰度？', en: 'Positioning clarity?', type: 'single', options: [o('还比较模糊','Fuzzy'), o('大致清楚','Generally clear'), o('较清楚','Fairly clear'), o('清楚且差异化明显','Clear + differentiated'), o('已形成行业标签/品牌认知','Industry label/brand')] },
      { id: 'Q12', zh: '离开创始人能否运转？', en: 'Run without founder?', type: 'single', options: [o('几乎不能','Almost cannot'), o('较难','Difficult'), o('一部分可以','Partially'), o('大部分可以','Mostly'), o('基本可以','Basically yes')] },
      { id: 'Q13', zh: '是否有管理层？', en: 'Management layer?', type: 'single', options: [o('没有','None'), o('有少数核心骨干','Few key people'), o('有基础管理层','Basic management'), o('有较成熟管理层','Mature management'), o('已有系统化管理团队+决策机制','Systematic management + governance')] },
    ],
  },
  {
    key: 'c', zh: '商业模式结构', en: 'Business Model & Repeatability',
    desc_zh: '检视你"怎么赚钱"以及这种赚钱方式是否可以复制放大。重点看：收入来源是否多元、销售是否可标准化、交付是否可独立运作、客户是否会复购或转介绍。这一部分决定你的企业能不能从"做生意"变成"做企业"。',
    desc_en: 'Looks at HOW you make money and whether that money-making engine can be repeated and scaled. We check: revenue sources, whether sales can be standardized, whether delivery runs without the founder, and whether customers come back or refer others. This section decides whether your company can move from "doing business" to "running a business."',
    questions: [
      { id: 'Q14', zh: '收入来源？', en: 'Revenue source?', type: 'single', options: [o('单次交易','One-time'), o('长期复购','Repeat purchase'), o('订阅/月费','Subscription'), o('项目制收入','Project-based'), o('平台抽成','Platform commission'), o('多种收入组合','Multiple revenue mix')] },
      { id: 'Q15', zh: '复制成功率？', en: 'Replication success?', type: 'single', options: [o('很低几乎靠人','Very low'), o('有机会但不稳定','Possible unstable'), o('中等部分可复制','Medium partial'), o('较高已有初步方法','High initial methods'), o('很高已有成熟SOP','Very high mature SOP')] },
      { id: 'Q16', zh: '成交标准化？', en: 'Sales standardization?', type: 'single', options: [o('基本没有','None'), o('有一些经验但不稳定','Some unstable'), o('有基础流程','Basic process'), o('已有可训练SOP','Trainable SOP'), o('已能复制给不同团队','Replicable to teams')] },
      { id: 'Q17', zh: '交付独立性？', en: 'Delivery independence?', type: 'single', options: [o('不能','Cannot'), o('较难','Difficult'), o('一部分可以','Partially'), o('大部分可以','Mostly'), o('基本完全可以','Basically fully')] },
      { id: 'Q18', zh: '客户复购/转介绍？', en: 'Customer retention?', type: 'single', options: [o('很少','Rarely'), o('偶尔','Occasionally'), o('一般','Average'), o('较高','Fairly high'), o('很高','Very high')] },
      { id: 'Q19', zh: '客户来源？', en: 'Customer source?', type: 'single', options: [o('主要靠创始人/熟人资源','Founder network'), o('主要靠转介绍','Referrals'), o('主要靠销售主动开发','Sales outbound'), o('主要靠渠道/平台/品牌流量','Channel/platform'), o('多渠道较均衡','Multi-channel balanced')] },
      { id: 'Q20', zh: '已验证的增长信号？', en: 'Validated growth signal?', type: 'single', options: [o('没有','None'), o('有尝试但未验证','Tried unvalidated'), o('有少量验证','Some validation'), o('有明显验证','Clear validation'), o('已形成区域复制基础','Regional replication base')] },
    ],
  },
  {
    key: 'd', zh: '估值结构', en: 'Valuation & Growth Story',
    desc_zh: '判断你的企业讲的是"小生意故事"还是"高估值故事"。投资人和资本市场看的不只是你今天赚多少，而是你未来能长成多大、能复制多远、能不能形成品牌或平台效应。这一部分帮你看清你的企业是经营型、业务型、成长型、资本型，还是平台型。',
    desc_en: 'Determines whether your company is telling a "small business story" or a "high-valuation story." Investors don\'t just care about today\'s revenue — they care about how big you can grow, how far you can replicate, and whether you can become a brand or platform. This section reveals whether you are an operator, a product company, a growth company, a fundable company, or a platform-grade business.',
    questions: [
      { id: 'Q21', zh: '增长方式？', en: 'Growth method?', type: 'single', options: [o('多开店/多开点','More locations'), o('增加销售团队','More sales'), o('增加经销商/渠道','More distributors'), o('产品升级与客户复购','Product upgrade'), o('平台化连接更多角色','Platform'), o('区域扩张/跨国复制','Regional expansion')] },
      { id: 'Q22', zh: '市场机会？', en: 'Market opportunity?', type: 'single', options: [o('目前还不清楚','Not clear'), o('本地刚需市场','Local necessity'), o('区域连锁机会','Regional chain'), o('全国性品牌机会','National brand'), o('东南亚机会','SEA'), o('全球性机会','Global')] },
      { id: 'Q23', zh: '资金优先投入？', en: 'Capital priority?', type: 'single', options: [o('暂时还不清楚','Not clear'), o('门店/网点扩张','Location expansion'), o('获客','Customer acquisition'), o('团队建设','Team building'), o('供应链/交付能力','Supply chain'), o('品牌与市场','Brand & marketing'), o('系统/技术','Systems/tech')] },
      { id: 'Q24', zh: '增长核心逻辑？', en: 'Growth core logic?', type: 'single', options: [o('稳定营收','Stable revenue'), o('成本优化','Cost optimization'), o('多城市复制','Multi-city replication'), o('强品牌/流量/平台效应','Strong brand/platform effect')] },
      { id: 'Q25', zh: '企业类型？', en: 'Enterprise type?', type: 'single', options: [o('靠老板赚钱的经营型公司','Boss-dependent'), o('靠产品赚钱的业务型公司','Product-driven'), o('可复制的成长型公司','Replicable growth'), o('可融资的资本型公司','Fundable capital'), o('具备平台化潜力的高估值公司','Platform high-value')] },
    ],
  },
  {
    key: 'e', zh: '融资结构', en: 'Financing Readiness',
    desc_zh: '检测你的企业"能不能拿到资金"——既包括股权融资（投资人的钱），也包括债权融资（银行贷款）。第一组评估股权资本就绪度：股权清不清晰、财务规不规范、有没有 BP、能不能讲资本故事。第二组按银行 SME 贷款审批的核心指标（DSCR、资产负债率、信用记录、银行流水）评估你的债权融资就绪度。',
    desc_en: 'Tests whether your company can actually receive capital — both equity (investor money) and debt (bank loans). The first block measures equity-capital readiness: equity clarity, financial standardization, pitch materials, capital story. The second block evaluates SME bank-loan readiness against the bank\'s core underwriting metrics (DSCR, gearing, credit record, bank statements).',
    questions: [
      {
        id: 'Q26', zh: '股权结构清晰度？', en: 'Equity structure?', type: 'single',
        groupHeader: {
          zh: 'E1 · 股权资本就绪度',
          en: 'E1 · Equity Capital Readiness',
          desc_zh: '面向投资人的资本就绪度——VC、PE、战投、并购、上市路径。',
          desc_en: 'Readiness for equity investors — VC, PE, strategic, M&A, listing pathways.',
        },
        options: [o('没有','None'), o('大致有，但不清楚','Rough unclear'), o('基本清楚','Basically clear'), o('较清晰','Fairly clear'), o('非常清晰','Very clear')],
      },
      { id: 'Q27', zh: '股东类型？', en: 'Shareholder type?', type: 'single', options: [o('全部创始人持有','All founder'), o('有历史口头安排','Historical verbal'), o('有少量外部股东','Some external'), o('有2轮以上投资人','2+ rounds investors'), o('有多轮投资人+员工持股计划','Multi-round + ESOP')] },
      { id: 'Q28', zh: '财务规范化？', en: 'Financial standardization?', type: 'single', options: [o('没有','None'), o('只有内部账','Internal only'), o('有基础财务报表','Basic statements'), o('有1年年度审计','1yr audit'), o('有2–3年审计/较规范财务体系','2–3yr audit')] },
      { id: 'Q29', zh: '资本动作意向？', en: 'Capital action intent?', type: 'single', options: [o('暂时不融资，先经营','Operate first'), o('想梳理商业模式','Clarify model'), o('想做融资准备','Prepare fundraising'), o('想正式融资','Formally fundraise'), o('想做并购/被并购准备','M&A prep'), o('想走向上市路径','IPO path')] },
      { id: 'Q30', zh: '融资时间预期？', en: 'Fundraising timeline?', type: 'single', options: [o('1年后再看','After 1yr'), o('6–12个月','6–12mo'), o('3–6个月内','3–6mo'), o('已经在推进','Already in progress')] },
      { id: 'Q31', zh: '资本准备状态？', en: 'Capital readiness?', type: 'single', options: [o('还没开始准备','Not started'), o('有想法但没材料','Ideas no materials'), o('有基础资料但不完整','Basic incomplete'), o('已开始系统整理融资资料','Systematically organizing'), o('已能进入BP/路演准备','Ready for BP/roadshow')] },
      { id: 'Q32', zh: '融资最大障碍？', en: 'Biggest fundraising obstacle?', type: 'single', options: [o('团队不够','Team insufficient'), o('财务不规范','Financials not standard'), o('没有BP','No BP'), o('不会讲资本故事',"Can't tell capital story"), o('缺乏投资人资源','Lack investor connections')] },
      // ── E2 · SME Bank Loan Readiness (10 questions, mapped to bank underwriting) ──
      {
        id: 'Q36',
        zh: '最新一年的税前利润 (PBT) 利润率？',
        en: 'Latest annual profit-before-tax (PBT) margin?',
        type: 'single',
        groupHeader: {
          zh: 'E2 · SME 银行贷款就绪度',
          en: 'E2 · SME Bank Loan Readiness',
          desc_zh: '按银行 SME 贷款审批的五大核心准则评估：DSCR > 1.0x、资产负债率 < 3.0x、信用卡使用率 < 70%、营收利润上升、银行流水良好。诚实回答；银行会自行核对。',
          desc_en: 'Scored against the bank\'s 5 core SME-loan criteria: DSCR > 1.0x, gearing < 3.0x, credit-card utilisation < 70%, uptrend revenue/profit, healthy bank statements. Answer honestly — the bank will verify independently.',
        },
        options: [
          o('亏损 / 负 PBT', 'Loss / negative PBT'),
          o('盈亏平衡 (利润率 0–3%)', 'Break-even (margin 0–3%)'),
          o('利润率 3–8%', 'Margin 3–8%'),
          o('利润率 8–15%', 'Margin 8–15%'),
          o('利润率 > 15%', 'Margin > 15%'),
        ],
      },
      {
        id: 'Q37',
        zh: '董事个人信用卡使用率？(银行红线 > 70%)',
        en: "Director's personal credit-card utilisation? (bank red-line > 70%)",
        type: 'single',
        options: [
          o('> 70% (银行不接受)', '> 70% (bank rejects)'),
          o('50–70%', '50–70%'),
          o('30–50%', '30–50%'),
          o('10–30%', '10–30%'),
          o('< 10% 或不使用信用卡', '< 10% or no credit-card use'),
        ],
      },
      {
        id: 'Q38',
        zh: '公司或董事是否有正在进行的法律诉讼？',
        en: 'Any ongoing legal cases against the company or directors?',
        type: 'single',
        options: [
          o('是，公司和董事都有', 'Yes — company and directors'),
          o('是，仅公司有', 'Yes — company only'),
          o('是，仅董事个人有', 'Yes — director only'),
          o('历史上有但已结案', 'Past cases, all resolved'),
          o('完全没有', 'None at all'),
        ],
      },
      {
        id: 'Q39',
        zh: '公司注册成立至今多少年？(银行最低要求 > 1 年)',
        en: 'Years since company incorporation? (bank minimum > 1 year)',
        type: 'single',
        options: [
          o('< 1 年 (低于银行最低要求)', '< 1 year (below bank minimum)'),
          o('1–2 年', '1–2 years'),
          o('2–3 年', '2–3 years'),
          o('3–5 年', '3–5 years'),
          o('> 5 年', '> 5 years'),
        ],
      },
      {
        id: 'Q40',
        zh: '公司银行月结单平均月末余额（占月入百分比）？(银行偏好 5–20%)',
        en: 'Average month-end bank balance as % of monthly deposits? (bank prefers 5–20%)',
        type: 'single',
        options: [
          o('几乎为零或负 (经常透支)', 'Near zero or negative (often overdrawn)'),
          o('< 5% 月入', '< 5% of monthly deposits'),
          o('5–10% 月入', '5–10% of monthly deposits'),
          o('10–20% 月入 (银行偏好区间)', '10–20% (bank sweet spot)'),
          o('> 20% 月入', '> 20% of monthly deposits'),
        ],
      },
      {
        id: 'Q41',
        zh: '公司总借贷相对股东权益的比率（资产负债率）？(银行红线 > 3.0x)',
        en: 'Total borrowings ÷ shareholder equity (gearing ratio)? (bank red-line > 3.0x)',
        type: 'single',
        options: [
          o('> 3.0x (违反银行准则)', '> 3.0x (fails bank gearing test)'),
          o('2.0–3.0x', '2.0–3.0x'),
          o('1.0–2.0x', '1.0–2.0x'),
          o('0.5–1.0x', '0.5–1.0x'),
          o('< 0.5x 或无借贷', '< 0.5x or debt-free'),
        ],
      },
      {
        id: 'Q42',
        zh: 'EBITDA ÷ 年度借贷偿还总额 (DSCR)？(银行红线 < 1.0x)',
        en: 'EBITDA ÷ annual borrowing commitments (DSCR)? (bank red-line < 1.0x)',
        type: 'single',
        options: [
          o('< 1.0x (无法覆盖偿债)', '< 1.0x (cannot cover debt)'),
          o('1.0–1.25x (勉强覆盖)', '1.0–1.25x (barely covers)'),
          o('1.25–1.5x', '1.25–1.5x'),
          o('1.5–2.0x', '1.5–2.0x'),
          o('> 2.0x (强偿债能力)', '> 2.0x (strong)'),
        ],
      },
      {
        id: 'Q43',
        zh: '公司最新股东权益 (Shareholder Equity)？',
        en: "Company's latest shareholder equity?",
        type: 'single',
        options: [
          o('负值 (技术性资不抵债)', 'Negative (technically insolvent)'),
          o('< RM 50 万', '< RM 500K'),
          o('RM 50 万 – 200 万', 'RM 500K – 2M'),
          o('RM 200 万 – 1000 万', 'RM 2M – 10M'),
          o('> RM 1000 万', '> RM 10M'),
        ],
      },
      {
        id: 'Q44',
        zh: '现有借贷的还款记录？(银行核查 CCRIS)',
        en: 'Repayment record on existing borrowings? (bank checks CCRIS)',
        type: 'single',
        options: [
          o('经常迟缴 / CCRIS 不良记录', 'Frequent late / CCRIS adverse'),
          o('近 12 个月内有迟缴', 'Late payment within last 12 months'),
          o('近 12 个月无迟缴，更早曾有', '12 months clean, older history of late'),
          o('近 24 个月无迟缴', '24 months clean'),
          o('从未迟缴', 'Never late'),
        ],
      },
      {
        id: 'Q45',
        zh: '近 2–3 年公司营收和利润趋势？(银行要求上升或稳定)',
        en: 'Revenue & profit trend over the past 2–3 years? (bank requires uptrend or stable)',
        type: 'single',
        options: [
          o('双双下降', 'Both declining'),
          o('波动较大，无明显趋势', 'Volatile, no clear trend'),
          o('大致持平', 'Roughly flat'),
          o('稳定增长', 'Stable growth'),
          o('持续高速增长', 'Strong sustained growth'),
        ],
      },
    ],
  },
  {
    key: 'f', zh: '退出与上市', en: 'Exit & IPO Path',
    desc_zh: '看你对企业"终点"的思考。绝大多数创始人只想"活下来"和"赚钱"，但真正能做大的企业，创始人会提前思考退出方式：是长期经营、股权交易、被并购，还是走向上市。这一部分判断你有没有想清楚未来的方向，以及你离上市这条路还有多远。',
    desc_en: 'Reveals how you think about your company\'s endgame. Most founders only think about "surviving" and "making money," but founders who actually build big companies think early about the exit: long-term operation, equity sale, M&A, or IPO. This section checks whether you have a clear long-term direction and how far you are from a listing pathway.',
    questions: [
      { id: 'Q33', zh: '退出方向？', en: 'Exit direction?', type: 'single', options: [o('长期经营，不谈退出','Long-term no exit'), o('未来股权交易','Equity transaction'), o('未来兼并收购','M&A'), o('未来融资后再退出','Fundraise then exit'), o('未来上市退出','IPO exit')] },
      { id: 'Q34', zh: '上市准备状态？', en: 'IPO readiness?', type: 'single', options: [o('还非常早，不应现在讨论','Very early'), o('先把经营和模式跑顺','Fix operations first'), o('可以开始补治理/财务/股权基础','Start governance'), o('可以开始做上市前体检','Pre-IPO checkup'), o('已开始认真思考上市路径','Seriously considering IPO')] },
      { id: 'Q35', zh: '报告期望？（多选最多2项）', en: 'Report focus? (max 2)', type: 'multi', maxSelect: 2, options: [o('看清企业卡在哪','See bottlenecks'), o('看清能不能复制扩张','Replication potential'), o('看清有没有融资可能','Fundraising potential'), o('看清有没有高估值潜力','Valuation potential'), o('看清能不能进入BP/路演阶段','BP/roadshow readiness'), o('看清未来上市路径','IPO path')] },
    ],
  },
];

/** Section key to module number mapping */
export const SECTION_MODULE: Record<string, string> = {
  a: '', b: '1', c: '2', d: '3', e: '4', f: '5',
};
