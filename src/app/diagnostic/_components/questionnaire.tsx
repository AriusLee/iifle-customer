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
      {/* Full-screen scoring overlay — blocks all interaction while AI works */}
      <ScoringOverlay open={scoring} sectionLabel={t(section.zh, section.en)} t={t} />

      {/* Section tabs — sticky under the page header */}
      <div className="sticky top-[60px] z-10 -mx-4 px-4 pt-3 pb-3 bg-[#fafaf7]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
          {SECTIONS.map((s, i) => {
            const done = submitted.includes(s.key);
            const active = i === curIdx;
            return (
              <button
                key={s.key}
                onClick={() => { setCurIdx(i); scroll(); }}
                className={`cursor-pointer flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                    : done
                      ? 'bg-[var(--gold-soft)] text-[var(--gold-dark)] border-[var(--gold)]/30 hover:bg-[var(--gold-soft)]/80'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <span
                  className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                    active ? 'bg-[var(--gold)] text-white'
                      : done ? 'bg-[var(--gold)] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {s.key.toUpperCase()}
                </span>
                <span className="hidden sm:inline">{t(s.zh, s.en)}</span>
                {done && !active && <CheckSvg />}
              </button>
            );
          })}
        </div>
        {/* Progress */}
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-slate-500">
            {t('已完成', 'Completed')}{' '}
            <span className="font-semibold text-slate-800">{submitted.length}/{SECTIONS.length}</span>{' '}
            {t('分区', 'sections')}
          </span>
          <span className="font-semibold text-[var(--gold-dark)]">
            {Math.round((submitted.length / SECTIONS.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(submitted.length / SECTIONS.length) * 100}%`,
              backgroundImage: 'linear-gradient(90deg, var(--gold) 0%, var(--gold-dark) 100%)',
            }}
          />
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
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)] overflow-hidden">
            {/* Section header with gold accent */}
            <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-[var(--gold-soft)]/40 via-white to-white border-b border-slate-100">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--gold)]" />
              <div className="flex items-center gap-3 mb-2.5">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundImage: 'linear-gradient(135deg, #c89749 0%, #8f6a2c 100%)' }}
                >
                  {sectionKey.toUpperCase()}
                </span>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {t(section.zh, section.en)}
                </h2>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 max-w-2xl">
                {t(section.desc_zh, section.desc_en)}
              </p>
              <p className="mt-3 text-[11px] font-semibold text-slate-500">
                <span className="text-[var(--gold-dark)]">{answeredInSection}</span>
                <span className="text-slate-400"> / {section.questions.length} </span>
                {t('已回答', 'answered')}
              </p>
            </div>

            <div className="flex flex-col gap-7 p-6">
              {section.questions.map((q, qi) => {
                const val = answers[q.id] || (q.type === 'multi' ? [] : '');
                return (
                  <div key={q.id}>
                    <p className="text-sm font-semibold mb-1.5 text-slate-900 leading-relaxed">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                        {qi + 1}
                      </span>
                      {t(q.zh, q.en)}
                    </p>
                    {q.type === 'multi' && q.maxSelect && (
                      <p className="ml-7 mb-1.5 text-[11px] font-medium text-[var(--gold-dark)]">
                        {t(`最多选择 ${q.maxSelect} 项`, `Select up to ${q.maxSelect}`)}
                      </p>
                    )}
                    <div className="ml-7 flex flex-col gap-1.5">
                      {q.options.map((opt) => {
                        const selected = q.type === 'single' ? val === opt.value : Array.isArray(val) && val.includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className={`cursor-pointer flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-all ${
                              selected
                                ? 'border-[var(--gold)] bg-[var(--gold-soft)]/50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type={q.type === 'single' ? 'radio' : 'checkbox'}
                              name={q.id}
                              checked={selected}
                              onChange={() => q.type === 'single' ? pick(q.id, opt.value) : pickMulti(q, opt.value)}
                              className="cursor-pointer accent-[var(--gold)]"
                            />
                            <span className={selected ? 'font-medium text-slate-900' : 'text-slate-700'}>
                              {t(opt.zh, opt.en)}
                            </span>
                          </label>
                        );
                      })}
                      <label
                        className={`cursor-pointer flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-all ${
                          val === '__other__'
                            ? 'border-[var(--gold)] bg-[var(--gold-soft)]/50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={val === '__other__'}
                          onChange={() => pick(q.id, '__other__')}
                          className="cursor-pointer accent-[var(--gold)]"
                        />
                        <span className="text-slate-700">{t('其他', 'Other')}</span>
                      </label>
                      {val === '__other__' && (
                        <Input
                          placeholder={t('请输入...', 'Please specify...')}
                          value={otherText[q.id] || ''}
                          onChange={(e) => setOtherText((p) => ({ ...p, [q.id]: e.target.value }))}
                          className="h-9 text-sm ml-6"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions bar — sticky footer while answering */}
          <div className="sticky bottom-0 flex items-center justify-between gap-3 bg-white/90 backdrop-blur-md py-3 px-4 mt-4 border-t border-slate-200 -mx-4">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={curIdx === 0}
              className="cursor-pointer h-10 px-5 rounded-lg"
            >
              ← {t('上一步', 'Back')}
            </Button>

            <Button
              variant="ghost"
              onClick={() => { saveDraft(); toast.success(t('已保存', 'Saved')); }}
              disabled={saving}
              className="cursor-pointer h-10 text-xs text-slate-500 hover:text-slate-700"
            >
              {saving ? t('保存中…', 'Saving…') : t('保存草稿', 'Save Draft')}
            </Button>

            <div className="flex items-center gap-2">
              {editing && (
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  className="cursor-pointer h-10 px-5 rounded-lg"
                >
                  {t('取消', 'Cancel')}
                </Button>
              )}
              {allAnswered && (
                <button
                  type="button"
                  onClick={handleSubmitSection}
                  disabled={scoring}
                  className="btn-primary h-10 px-6"
                >
                  {scoring
                    ? t('评分中…', 'Scoring…')
                    : isSectionDone
                      ? t('重新评分', 'Re-score')
                      : t('提交并评分 →', 'Submit & Score →')}
                </button>
              )}
              {!allAnswered && !isSectionDone && (
                <span className="text-xs text-slate-400">
                  {t('回答所有问题后提交', 'Answer all to submit')}
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Submitted state — collapsed view with re-answer + next buttons */
        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={curIdx === 0}
            className="cursor-pointer h-10 px-5 rounded-lg"
          >
            ← {t('上一步', 'Back')}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setEditing(true)}
              className="cursor-pointer h-10 px-5 rounded-lg"
            >
              {t('重新作答', 'Re-answer')}
            </Button>
            {curIdx < SECTIONS.length - 1 && (
              <button
                type="button"
                onClick={goNext}
                className="btn-primary h-10 px-6"
              >
                {t('下一分区', 'Next section')} →
              </button>
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

/* ── Scoring overlay ──────────────────────────────────────────────────────
 * Full-screen blocking overlay shown while a section is being scored + the
 * AI analysis is being generated. Cycles through a series of progress
 * messages so the user sees the system is working through their answers
 * rather than staring at a frozen button.
 *
 * Cannot be dismissed — disappears automatically when `open` flips false.
 */
function ScoringOverlay({
  open,
  sectionLabel,
  t,
}: {
  open: boolean;
  sectionLabel: string;
  t: (zh: string, en: string) => string;
}) {
  const steps: { zh: string; en: string }[] = [
    { zh: '正在收集你的回答…', en: 'Collecting your answers…' },
    { zh: '正在结构化分析…', en: 'Structuring your responses…' },
    { zh: '正在比对独角兽企业模型…', en: 'Comparing against the Unicorn model…' },
    { zh: '正在生成评分…', en: 'Calculating module scores…' },
    { zh: 'AI 顾问正在撰写洞察…', en: 'AI consultant is writing insights…' },
    { zh: '即将完成…', en: 'Almost done…' },
  ];
  const [stepIdx, setStepIdx] = useState(0);

  // Reset to first step whenever the overlay re-opens, then cycle every ~2.2s.
  // Stay on the last step if the AI takes longer than expected.
  useEffect(() => {
    if (!open) {
      setStepIdx(0);
      return;
    }
    setStepIdx(0);
    const id = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, steps.length - 1));
    }, 2200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-md"
      // Block interaction with anything behind the overlay
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-emerald-100 bg-white p-8 shadow-2xl">
        {/* Animated radial spinner */}
        <div className="relative mx-auto mb-6 h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-1 text-center text-base font-bold text-gray-900">
          {t('正在分析你的回答', 'Analysing your answers')}
        </h3>
        <p className="mb-5 text-center text-xs text-gray-500">
          {sectionLabel}
        </p>

        {/* Step list — current step highlighted, prior steps checked, future steps muted */}
        <ul className="flex flex-col gap-2">
          {steps.map((s, i) => {
            const isDone = i < stepIdx;
            const isCurrent = i === stepIdx;
            return (
              <li
                key={i}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  isCurrent ? 'bg-emerald-50 font-semibold text-emerald-700'
                    : isDone ? 'text-gray-500'
                    : 'text-gray-300'
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center shrink-0">
                  {isDone ? (
                    <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                  )}
                </span>
                <span>{t(s.zh, s.en)}</span>
              </li>
            );
          })}
        </ul>

        {/* Hint */}
        <p className="mt-5 text-center text-[10px] text-gray-400">
          {t('请勿关闭页面，分析通常需要 5–15 秒', 'Please do not close this page — analysis usually takes 5–15 seconds')}
        </p>
      </div>
    </div>
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
