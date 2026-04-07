'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { SECTIONS, SECTION_MODULE, type Question, type Section } from '@/lib/questions';
import { ListingRequirements } from './listing-requirements';
import { toast } from 'sonner';

interface Props {
  diagnosticId: string;
  onComplete: (data: any) => void;
}

export function Questionnaire({ diagnosticId, onComplete }: Props) {
  const { t } = useT();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [curIdx, setCurIdx] = useState(0);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [diag, setDiag] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [editing, setEditing] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const autoSaveRef = useRef(0);

  // Load existing data on mount
  useEffect(() => {
    api.diagnostics.get(diagnosticId).then((d) => {
      setDiag(d);
      if (d.answers) setAnswers(d.answers);
      if (d.other_answers) setOtherText(d.other_answers);
      const done: string[] = d.sections_submitted || [];
      setSubmitted(done);
      // Jump to first incomplete section
      const next = SECTIONS.findIndex((s) => !done.includes(s.key));
      if (next >= 0) setCurIdx(next);
      else setCurIdx(SECTIONS.length - 1);
    }).catch(() => {});
  }, [diagnosticId]);

  const section = SECTIONS[curIdx];
  const sectionKey = section.key;
  const isSectionDone = submitted.includes(sectionKey);
  const moduleKey = SECTION_MODULE[sectionKey];

  // Count answered in this section
  const answeredInSection = section.questions.filter((q) => {
    const v = answers[q.id];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }).length;
  const allAnswered = answeredInSection === section.questions.length;

  // Auto-save
  const saveDraft = useCallback(async () => {
    if (!Object.keys(answers).length) return;
    setSaving(true);
    try {
      await api.diagnostics.saveDraft(diagnosticId, { answers, other_answers: otherText });
      autoSaveRef.current = Date.now();
    } catch { /* silent */ }
    finally { setSaving(false); }
  }, [diagnosticId, answers, otherText]);

  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - autoSaveRef.current > 25000) saveDraft();
    }, 30000);
    return () => clearInterval(id);
  }, [saveDraft]);

  const scroll = () => topRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Answer handlers
  const pick = (qid: string, val: string) => setAnswers((p) => ({ ...p, [qid]: val }));
  const pickMulti = (q: Question, val: string) => {
    setAnswers((p) => {
      const cur = Array.isArray(p[q.id]) ? (p[q.id] as string[]) : [];
      if (cur.includes(val)) return { ...p, [q.id]: cur.filter((v) => v !== val) };
      if (q.maxSelect && cur.length >= q.maxSelect) return { ...p, [q.id]: [...cur.slice(1), val] };
      return { ...p, [q.id]: [...cur, val] };
    });
  };

  // Submit section
  const handleSubmitSection = async () => {
    setScoring(true);
    try {
      const res = await api.diagnostics.submitSection(diagnosticId, sectionKey, { answers, other_answers: otherText });
      setDiag(res);
      const newSubmitted: string[] = res.sections_submitted || [...submitted, sectionKey];
      setSubmitted(newSubmitted);
      setEditing(false);
      toast.success(t('评分完成', 'Scoring complete'));

      // If all done
      if (SECTIONS.every((s) => newSubmitted.includes(s.key))) {
        onComplete(res);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setScoring(false);
    }
  };

  const goNext = () => { setCurIdx((i) => Math.min(i + 1, SECTIONS.length - 1)); setEditing(false); scroll(); };
  const goPrev = () => { setCurIdx((i) => Math.max(i - 1, 0)); setEditing(false); scroll(); };

  // Score display
  const moduleScore = moduleKey ? diag?.module_scores?.[moduleKey] : null;
  const findings = (diag?.key_findings || []).filter((f: any) => moduleKey && f.module === parseInt(moduleKey));
  const sectionAnalysis = diag?.section_analyses?.[sectionKey];

  return (
    <div className="mx-auto w-full max-w-3xl" ref={topRef}>
      {/* Section tabs */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm pb-3 pt-2 px-4">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {SECTIONS.map((s, i) => {
            const done = submitted.includes(s.key);
            return (
              <button key={s.key} onClick={() => { setCurIdx(i); scroll(); }}
                className={`cursor-pointer flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  i === curIdx ? 'bg-emerald-500 text-white shadow-sm'
                    : done ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                <span className="font-bold">{s.key.toUpperCase()}</span>
                <span className="hidden sm:inline">{t(s.zh, s.en)}</span>
                {done && i !== curIdx && <CheckSvg />}
              </button>
            );
          })}
        </div>
        {/* Progress */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>{t('已完成', 'Completed')} {submitted.length}/{SECTIONS.length} {t('分区', 'sections')}</span>
          <span>{Math.round((submitted.length / SECTIONS.length) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200">
          <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${(submitted.length / SECTIONS.length) * 100}%` }} />
        </div>
      </div>

      {/* Section A results — enterprise stage + AI analysis */}
      {isSectionDone && sectionKey === 'a' && diag?.enterprise_stage && (
        <SectionAResults diag={diag} answers={answers} analysis={sectionAnalysis} t={t} />
      )}

      {/* Module score results — sections B-F */}
      {isSectionDone && moduleScore && (
        <ModuleResults moduleScore={moduleScore} findings={findings} section={section} answers={answers} analysis={sectionAnalysis} t={t} />
      )}

      {/* Listing requirements panel — appears once Section F is submitted */}
      {isSectionDone && sectionKey === 'f' && (
        <div className="mt-4">
          <ListingRequirements enterpriseStage={diag?.enterprise_stage} />
        </div>
      )}

      {/* Questions — hidden when submitted, unless editing */}
      {(!isSectionDone || editing) ? (
        <>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">{sectionKey.toUpperCase()}</span>
                <div>{t(section.zh, section.en)}</div>
              </CardTitle>
              <div className="ml-10 mt-2 rounded-lg bg-emerald-50/60 border border-emerald-100 px-3 py-2.5">
                <p className="text-xs leading-relaxed text-gray-700">
                  {t(section.desc_zh, section.desc_en)}
                </p>
              </div>
              <p className="text-xs text-gray-400 ml-10 mt-2">
                {answeredInSection}/{section.questions.length} {t('已回答', 'answered')}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {section.questions.map((q, qi) => {
                const val = answers[q.id] || (q.type === 'multi' ? [] : '');
                return (
                  <div key={q.id}>
                    <p className="text-sm font-medium mb-1">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">{qi + 1}</span>
                      {t(q.zh, q.en)}
                    </p>
                    {q.type === 'multi' && q.maxSelect && (
                      <p className="ml-7 mb-1 text-xs text-emerald-600">{t(`最多选择${q.maxSelect}项`, `Select up to ${q.maxSelect}`)}</p>
                    )}
                    <div className="ml-7 flex flex-col gap-1.5">
                      {q.options.map((opt) => {
                        const selected = q.type === 'single' ? val === opt.value : Array.isArray(val) && val.includes(opt.value);
                        return (
                          <label key={opt.value} className={`cursor-pointer flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${selected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input type={q.type === 'single' ? 'radio' : 'checkbox'} name={q.id} checked={selected}
                              onChange={() => q.type === 'single' ? pick(q.id, opt.value) : pickMulti(q, opt.value)}
                              className="cursor-pointer accent-emerald-500" />
                            <span className="text-gray-800">{t(opt.zh, opt.en)}</span>
                          </label>
                        );
                      })}
                      <label className={`cursor-pointer flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${val === '__other__' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" name={q.id} checked={val === '__other__'}
                          onChange={() => pick(q.id, '__other__')}
                          className="cursor-pointer accent-emerald-500" />
                        <span className="text-gray-800">{t('其他', 'Other')}</span>
                      </label>
                      {val === '__other__' && (
                        <Input placeholder={t('请输入...', 'Please specify...')} value={otherText[q.id] || ''} onChange={(e) => setOtherText((p) => ({ ...p, [q.id]: e.target.value }))} className="h-8 text-sm ml-6" />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Actions bar — visible when editing/answering */}
          <div className="sticky bottom-0 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-sm py-4 px-4 mt-4 border-t">
            <Button variant="outline" onClick={goPrev} disabled={curIdx === 0} className="cursor-pointer h-10 px-5">
              ← {t('上一步', 'Back')}
            </Button>

            <Button variant="ghost" onClick={() => { saveDraft(); toast.success(t('已保存', 'Saved')); }} disabled={saving}
              className="cursor-pointer h-10 text-xs text-gray-500">
              {saving ? t('保存中...', 'Saving...') : t('保存草稿', 'Save Draft')}
            </Button>

            <div className="flex items-center gap-2">
              {editing && (
                <Button variant="outline" onClick={() => setEditing(false)} className="cursor-pointer h-10 px-5">
                  {t('取消', 'Cancel')}
                </Button>
              )}
              {allAnswered && (
                <Button onClick={handleSubmitSection} disabled={scoring}
                  className="cursor-pointer h-10 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg font-semibold px-6">
                  {scoring ? t('评分中...', 'Scoring...') : isSectionDone ? t('重新评分', 'Re-score') : t('提交并评分', 'Submit & Score')}
                </Button>
              )}
              {!allAnswered && !isSectionDone && (
                <span className="text-xs text-gray-400">{t('回答所有问题后提交', 'Answer all to submit')}</span>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Submitted state — collapsed view with re-answer + next buttons */
        <div className="mt-4 flex items-center justify-between gap-3 px-4">
          <Button variant="outline" onClick={goPrev} disabled={curIdx === 0} className="cursor-pointer h-10 px-5">
            ← {t('上一步', 'Back')}
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditing(true)} className="cursor-pointer h-10 px-5">
              {t('重新作答', 'Re-answer')}
            </Button>
            {curIdx < SECTIONS.length - 1 && (
              <Button onClick={goNext} className="cursor-pointer h-10 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg font-semibold px-6">
                {t('下一步', 'Next')} →
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckSvg() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ── Structured analysis renderer ──────────────────────────────────────── */
/**
 * Parses the AI's [ZH]/[EN] structured output:
 *   【现状判断】 ... 【核心优势】 ... 【关键短板】 ... 【行动建议】 ...
 *   [State] ... [Strength] ... [Weakness] ... [Next Steps] ...
 * and renders each block with a styled header.
 *
 * Falls back to plain text for non-structured strings.
 */
function StructuredAnalysis({ text, accent = 'emerald' }: { text: string; accent?: 'emerald' | 'blue' }) {
  if (!text) return null;
  // Match either 【...】 or [...] at line start as block headers.
  // Split keeps the delimiters so we can identify which header each block belongs to.
  const blockRegex = /(【[^】]+】|\[(?:State|Strength|Weakness|Next Steps)\])/g;
  const parts = text.split(blockRegex).filter((p) => p && p.trim());

  // If no headers detected, render as plain pre-line text
  if (!parts.some((p) => blockRegex.test(p))) {
    return <p className={`text-xs leading-relaxed whitespace-pre-line ${accent === 'blue' ? 'text-blue-800' : 'text-emerald-800'}`}>{text}</p>;
  }

  // Pair headers with their following content
  const blocks: { header: string; body: string }[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (/^(【[^】]+】|\[(?:State|Strength|Weakness|Next Steps)\])$/.test(p.trim())) {
      blocks.push({ header: p.trim(), body: (parts[i + 1] || '').trim() });
      i++;
    }
  }

  // Color hint per block type
  const colorFor = (header: string): string => {
    if (header.includes('优势') || header.includes('Strength')) return 'text-emerald-700';
    if (header.includes('短板') || header.includes('Weakness')) return 'text-rose-700';
    if (header.includes('建议') || header.includes('Next Steps')) return 'text-blue-700';
    return 'text-gray-700';
  };

  return (
    <div className="flex flex-col gap-2.5">
      {blocks.map((b, i) => (
        <div key={i}>
          <p className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${colorFor(b.header)}`}>
            {b.header.replace(/[【】\[\]]/g, '')}
          </p>
          <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-line">{b.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Section A Results ─────────────────────────────────────────────────── */

const STAGE_INFO: Record<string, { color: string; zh: string; en: string }> = {
  '概念萌芽期': { color: 'bg-red-100 text-red-700', zh: '企业尚处于概念阶段，尚未形成稳定的商业模式和收入来源。建议先验证核心假设，找到产品市场契合点。', en: 'The enterprise is at the concept stage without a stable business model. Focus on validating core assumptions and finding product-market fit.' },
  '初创探索期': { color: 'bg-orange-100 text-orange-700', zh: '企业已经起步但仍在探索阶段。商业模式初步成型，需要重点关注市场验证和团队建设。', en: 'The enterprise has started but is still exploring. Business model is forming — focus on market validation and team building.' },
  '模式验证期': { color: 'bg-yellow-100 text-yellow-700', zh: '企业已有一定经营基础，正在验证商业模式的可复制性。这是向规模化过渡的关键阶段。', en: 'The enterprise has an operational foundation and is validating replicability. This is a critical transition stage toward scaling.' },
  '规模扩张期': { color: 'bg-emerald-100 text-emerald-700', zh: '企业已验证商业模式，正在进入规模化扩张阶段。建议关注组织能力建设和资本化路径。', en: 'Business model is validated and scaling is underway. Focus on organizational capability and capital pathway.' },
  '资本进阶期': { color: 'bg-blue-100 text-blue-700', zh: '企业已具备资本化条件，可以认真考虑融资、并购或上市路径。建议做好财务规范化和股权结构优化。', en: 'The enterprise is capital-ready. Consider fundraising, M&A, or IPO pathways. Focus on financial standardization and equity optimization.' },
};

function getStageKey(stage: string): string {
  for (const key of Object.keys(STAGE_INFO)) {
    if (stage.includes(key)) return key;
  }
  return '';
}

function SectionAResults({ diag, answers, analysis, t }: { diag: any; answers: Record<string, string | string[]>; analysis?: { analysis_zh: string; analysis_en: string }; t: (zh: string, en: string) => string }) {
  const stage = diag.enterprise_stage || '';
  const stageKey = getStageKey(stage);
  const info = STAGE_INFO[stageKey];
  const stageScore = diag.stage_score ?? 0;

  // Build quick profile summary from answers
  const profileItems = [
    { zh: '成立时间', en: 'Established', val: answers['Q01'] },
    { zh: '行业', en: 'Industry', val: answers['Q03'] },
    { zh: '年营收', en: 'Revenue', val: answers['Q04'] },
    { zh: '团队规模', en: 'Team', val: answers['Q06'] },
    { zh: '经营状态', en: 'State', val: answers['Q07'] },
  ].filter((p) => p.val);

  return (
    <Card className="mt-4 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white overflow-hidden">
      <CardContent className="pt-5 pb-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{t('企业阶段判定', 'Enterprise Stage Assessment')}</p>
            <p className="text-[11px] text-gray-400">{t('基于8项基础指标综合评估', 'Based on 8 foundational indicators')}</p>
          </div>
        </div>

        {/* Stage badge + score */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stageScore}</p>
            <p className="text-[10px] text-gray-400">{t('阶段得分', 'Stage Score')}</p>
          </div>
          <div className="flex-1">
            <Badge className={`${info?.color || 'bg-gray-100 text-gray-700'} text-sm px-3 py-1.5 mb-2`}>{stage}</Badge>
            <div className="h-2 rounded-full bg-gray-200 mt-1">
              <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${stageScore}%` }} />
            </div>
          </div>
        </div>

        {/* AI analysis text */}
        {(analysis?.analysis_zh || info) && (
          <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-3 mb-4">
            {analysis?.analysis_zh ? (
              <StructuredAnalysis
                text={t(analysis.analysis_zh, analysis.analysis_en || analysis.analysis_zh)}
                accent="blue"
              />
            ) : info ? (
              <p className="text-xs leading-relaxed text-blue-800 whitespace-pre-line">{t(info.zh, info.en)}</p>
            ) : null}
          </div>
        )}

        {/* Quick profile summary */}
        {profileItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {profileItems.map((p) => (
              <div key={p.en} className="rounded-lg bg-white border border-gray-100 px-3 py-2">
                <p className="text-[10px] text-gray-400 mb-0.5">{t(p.zh, p.en)}</p>
                <p className="text-xs font-medium text-gray-700 truncate">{String(p.val)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Module Results (sections B-F) ─────────────────────────────────────── */

const RATING_LABEL: Record<string, { zh: string; en: string }> = {
  Strong: { zh: '优秀', en: 'Strong' },
  Medium: { zh: '中等', en: 'Medium' },
  Developing: { zh: '发展中', en: 'Developing' },
  Weak: { zh: '薄弱', en: 'Weak' },
};

const RATING_INFO: Record<string, { zh: string; en: string }> = {
  Strong: { zh: '该模块表现优秀，已具备较强的结构基础，可作为企业核心竞争力进一步强化。', en: 'This module is performing well with a strong structural foundation. It can be further strengthened as a core competitive advantage.' },
  Medium: { zh: '该模块处于中等水平，有一定基础但仍有提升空间。建议针对薄弱环节进行优化。', en: 'This module is at a medium level with room for improvement. Focus on optimizing weak areas.' },
  Developing: { zh: '该模块仍在发展中，需要重点关注和改善。建议优先投入资源补齐短板。', en: 'This module is still developing and needs attention. Prioritize resources to address gaps.' },
  Weak: { zh: '该模块表现较弱，是当前企业发展的主要瓶颈之一。建议优先制定改善计划。', en: 'This module is weak and represents a key bottleneck. Prioritize creating an improvement plan.' },
};

function ModuleResults({ moduleScore, findings, section, answers, analysis, t }: { moduleScore: any; findings: any[]; section: Section; answers: Record<string, string | string[]>; analysis?: { analysis_zh: string; analysis_en: string }; t: (zh: string, en: string) => string }) {
  const score = moduleScore.score;
  const scoreColor = score >= 60 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const ratingInfo = RATING_INFO[moduleScore.rating];

  // Build answer summary from this section's questions
  const answerItems = section.questions
    .map((q) => ({ zh: q.zh.replace('？', ''), en: q.en.replace('?', ''), val: answers[q.id] }))
    .filter((a) => a.val && a.val !== '__other__');

  return (
    <Card className="mt-4 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white overflow-hidden">
      <CardContent className="pt-5 pb-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{t(moduleScore.name_zh, moduleScore.name_en)} {t('评分', 'Score')}</p>
            <p className="text-[11px] text-gray-400">{t(`基于${section.questions.length}项指标综合评估`, `Based on ${section.questions.length} indicators`)}</p>
          </div>
        </div>

        {/* Score + rating */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: scoreColor }}>{score}</p>
            <p className="text-[10px] text-gray-400">{t('得分', 'Score')}</p>
          </div>
          <div className="flex-1">
            <Badge className={
              moduleScore.rating === 'Strong' ? 'bg-emerald-100 text-emerald-700' :
              moduleScore.rating === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              moduleScore.rating === 'Developing' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }>{t(RATING_LABEL[moduleScore.rating]?.zh || moduleScore.rating, RATING_LABEL[moduleScore.rating]?.en || moduleScore.rating)}</Badge>
            <div className="h-2 rounded-full bg-gray-200 mt-2">
              <div className="h-2 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: scoreColor }} />
            </div>
          </div>
        </div>

        {/* Analysis text */}
        {(analysis?.analysis_zh || ratingInfo) && (
          <div className="rounded-lg bg-emerald-50/60 border border-emerald-100 p-3 mb-4">
            {analysis?.analysis_zh ? (
              <StructuredAnalysis
                text={t(analysis.analysis_zh, analysis.analysis_en || analysis.analysis_zh)}
                accent="emerald"
              />
            ) : ratingInfo ? (
              <p className="text-xs leading-relaxed text-emerald-800 whitespace-pre-line">{t(ratingInfo.zh, ratingInfo.en)}</p>
            ) : null}
          </div>
        )}

        {/* Findings */}
        {findings.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('关键发现', 'Key Findings')}</p>
            {findings.map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg bg-white p-3 border">
                <div className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${f.severity === 'high' ? 'bg-red-500' : f.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <div>
                  <p className="text-xs font-semibold text-gray-800">{t(f.title_zh, f.title_en)}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{t(f.description_zh, f.description_en)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Answer summary grid */}
        {answerItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {answerItems.map((a, i) => (
              <div key={i} className="rounded-lg bg-white border border-gray-100 px-3 py-2">
                <p className="text-[10px] text-gray-400 mb-0.5 truncate">{t(a.zh, a.en)}</p>
                <p className="text-xs font-medium text-gray-700 truncate">{String(a.val)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
