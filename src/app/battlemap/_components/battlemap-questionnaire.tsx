'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { BM_SECTIONS, BM_TOTAL_QUESTIONS } from '@/lib/battlemap-questions';

interface Props {
  battleMapId: string;
  initial: any;
  onClassified: () => void | Promise<void>;
}

export function BattleMapQuestionnaire({ battleMapId, initial, onClassified }: Props) {
  const { t } = useT();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [bm, setBm] = useState<any>(initial);
  const [curIdx, setCurIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submittingSection, setSubmittingSection] = useState(false);
  const [editing, setEditing] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const autoSaveRef = useRef(0);

  // Hydrate from server
  useEffect(() => {
    const init: Record<string, string> = {};
    const existing = initial?.answers || {};
    Object.keys(existing).forEach((k) => {
      if (typeof existing[k] === 'string') init[k] = existing[k];
    });
    setAnswers(init);
    setBm(initial);
    const submitted: string[] = initial?.sections_submitted || [];
    const firstMissing = BM_SECTIONS.findIndex((s) => !submitted.includes(s.key));
    setCurIdx(firstMissing >= 0 ? firstMissing : BM_SECTIONS.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleMapId]);

  const section = BM_SECTIONS[curIdx];
  const submitted: string[] = bm?.sections_submitted || [];
  const isSectionDone = submitted.includes(section.key);
  const sectionIdx = curIdx;
  const prevKey = sectionIdx > 0 ? BM_SECTIONS[sectionIdx - 1].key : null;
  const canSubmitSection = !prevKey || submitted.includes(prevKey);

  const analysis = bm?.section_analyses?.[section.key];

  const answeredInSection = section.questions.filter((q) => {
    const v = answers[q.id];
    return typeof v === 'string' && v.trim().length > 0;
  }).length;
  const sectionAllAnswered = answeredInSection === section.questions.length;
  const totalAnswered = Object.values(answers).filter((v) => typeof v === 'string' && v.trim().length > 0).length;

  const showQuestions = !isSectionDone || editing;

  // Auto-save draft
  const saveDraft = useCallback(async () => {
    if (!Object.keys(answers).length) return;
    setSaving(true);
    try {
      await api.battlemaps.saveDraft(battleMapId, { answers });
      autoSaveRef.current = Date.now();
    } catch { /* silent */ }
    finally { setSaving(false); }
  }, [battleMapId, answers]);

  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - autoSaveRef.current > 25000) saveDraft();
    }, 30000);
    return () => clearInterval(id);
  }, [saveDraft]);

  const scroll = () => topRef.current?.scrollIntoView({ behavior: 'smooth' });
  const pick = (qid: string, val: string) => setAnswers((p) => ({ ...p, [qid]: val }));

  async function handleSubmitSection() {
    if (!canSubmitSection) {
      toast.error(t(`请先完成第 ${prevKey?.toUpperCase()} 分区`, `Complete section ${prevKey?.toUpperCase()} first`));
      return;
    }
    setSubmittingSection(true);
    try {
      const res = await api.battlemaps.submitSection(battleMapId, section.key, { answers });
      setBm(res);
      setEditing(false);
      toast.success(t('分析完成', 'Analysis complete'));

      const newSubmitted: string[] = res.sections_submitted || [];
      // If classifier ran on this submit, propagate to parent.
      if (res.variant && BM_SECTIONS.every((s) => newSubmitted.includes(s.key))) {
        await onClassified();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmittingSection(false);
    }
  }

  const goNext = () => { setCurIdx((i) => Math.min(i + 1, BM_SECTIONS.length - 1)); setEditing(false); scroll(); };
  const goPrev = () => { setCurIdx((i) => Math.max(i - 1, 0)); setEditing(false); scroll(); };

  return (
    <div className="mx-auto w-full max-w-3xl" ref={topRef}>
      <AnalyzeOverlay open={submittingSection} sectionLabel={t(section.zh, section.en)} t={t} />

      {/* Section tabs — sticky under page header */}
      <div className="sticky top-[60px] z-10 -mx-4 px-4 pt-3 pb-3 bg-[#fafaf7]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
          {BM_SECTIONS.map((s, i) => {
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
                    active || done ? 'bg-[var(--gold)] text-white' : 'bg-slate-200 text-slate-600'
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
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-slate-500">
            {t('已提交', 'Submitted')}{' '}
            <span className="font-semibold text-slate-800">{submitted.length}/{BM_SECTIONS.length}</span>{' '}
            {t('分区', 'sections')}{' '}
            <span className="text-slate-300">·</span>{' '}
            <span className="font-semibold text-slate-800">{totalAnswered}/{BM_TOTAL_QUESTIONS}</span>{' '}
            {t('题', 'questions')}
          </span>
          <span className="font-semibold text-[var(--gold-dark)]">
            {Math.round((submitted.length / BM_SECTIONS.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(submitted.length / BM_SECTIONS.length) * 100}%`,
              backgroundImage: 'linear-gradient(90deg, var(--gold) 0%, var(--gold-dark) 100%)',
            }}
          />
        </div>
      </div>

      {/* Inline AI analysis — shown after section is submitted */}
      {isSectionDone && analysis && (analysis.analysis_zh || analysis.analysis_en) && (
        <div className="mt-5 rounded-2xl border border-[var(--gold)]/25 bg-gradient-to-br from-[var(--gold-soft)]/40 via-white to-white p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white shrink-0"
              style={{ backgroundImage: 'linear-gradient(135deg, #c89749 0%, #8f6a2c 100%)' }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="eyebrow mb-0.5">{t('AI 顾问分析', 'AI Consultant Analysis')}</p>
              <p className="text-sm font-semibold text-slate-900">{t(section.zh, section.en)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t('基于你的回答与 Phase 1 阶段定位', 'Based on your answers + Phase 1 stage')}
              </p>
            </div>
          </div>
          <StructuredAnalysis text={t(analysis.analysis_zh || '', analysis.analysis_en || '')} />
        </div>
      )}

      {/* Questions (hidden when submitted, unless editing) */}
      {showQuestions ? (
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
                  {section.key.toUpperCase()}
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
                const val = answers[q.id] || '';

                if (q.kind === 'open') {
                  return (
                    <div key={q.id}>
                      <p className="text-sm font-semibold mb-1.5 text-slate-900 leading-relaxed">
                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                          {qi + 1}
                        </span>
                        {t(q.zh, q.en)}
                      </p>
                      <div className="ml-7">
                        <textarea
                          value={val}
                          onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                          placeholder={t(q.placeholder_zh || '', q.placeholder_en || '')}
                          className="w-full min-h-[96px] rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/20 transition-all"
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={q.id}>
                    <p className="text-sm font-semibold mb-1.5 text-slate-900 leading-relaxed">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                        {qi + 1}
                      </span>
                      {t(q.zh, q.en)}
                    </p>
                    <div className="ml-7 flex flex-col gap-1.5">
                      {(q.options || []).map((opt) => {
                        const selected = val === opt.value;
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
                              type="radio"
                              name={q.id}
                              checked={selected}
                              onChange={() => pick(q.id, opt.value)}
                              className="cursor-pointer accent-[var(--gold)]"
                            />
                            <span className={selected ? 'font-medium text-slate-900' : 'text-slate-700'}>
                              {t(opt.zh, opt.en)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer — while answering/editing */}
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
              {sectionAllAnswered && canSubmitSection && (
                <button
                  type="button"
                  onClick={handleSubmitSection}
                  disabled={submittingSection}
                  className="btn-primary h-10 px-6"
                >
                  {submittingSection
                    ? t('分析中…', 'Analyzing…')
                    : isSectionDone
                      ? t('重新分析', 'Re-analyze')
                      : t('提交并分析 →', 'Submit & analyze →')}
                </button>
              )}
              {!sectionAllAnswered && (
                <span className="text-xs text-slate-400">{t('回答所有问题后提交', 'Answer all to submit')}</span>
              )}
              {!canSubmitSection && (
                <span className="text-xs text-gray-400">
                  {t(`请先完成 ${prevKey?.toUpperCase()} 分区`, `Complete ${prevKey?.toUpperCase()} first`)}
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Submitted view — collapsed with re-answer + next buttons */
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
            {curIdx < BM_SECTIONS.length - 1 && (
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

/**
 * Blocking overlay while a section is being analyzed. The AI call typically
 * takes 5–12s — this mirrors Phase 1's pattern so the customer sees motion.
 */
function AnalyzeOverlay({
  open,
  sectionLabel,
  t,
}: {
  open: boolean;
  sectionLabel: string;
  t: (zh: string, en: string) => string;
}) {
  const steps = [
    { zh: '正在收集该分区的回答…', en: 'Collecting this section\'s answers…' },
    { zh: '正在结合 Phase 1 阶段定位…', en: 'Combining with Phase 1 stage context…' },
    { zh: '正在识别核心张力…', en: 'Identifying core tensions…' },
    { zh: 'AI 顾问正在撰写下一步建议…', en: 'AI consultant is writing next-step advice…' },
    { zh: '即将完成…', en: 'Almost done…' },
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!open) { setIdx(0); return; }
    setIdx(0);
    const id = setInterval(() => setIdx((i) => Math.min(i + 1, steps.length - 1)), 2200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-emerald-100 bg-white p-8 shadow-2xl">
        <div className="relative mx-auto mb-6 h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500" />
        </div>
        <h3 className="mb-1 text-center text-base font-bold text-gray-900">
          {t('正在分析你的回答', 'Analysing your answers')}
        </h3>
        <p className="mb-5 text-center text-xs text-gray-500">{sectionLabel}</p>
        <ul className="flex flex-col gap-2">
          {steps.map((s, i) => {
            const isDone = i < idx;
            const isCurrent = i === idx;
            return (
              <li
                key={i}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  isCurrent ? 'bg-emerald-50 font-semibold text-emerald-700'
                    : isDone ? 'text-gray-500' : 'text-gray-300'
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
        <p className="mt-5 text-center text-[10px] text-gray-400">
          {t('请勿关闭页面，分析通常需要 5–15 秒', 'Please do not close this page — analysis usually takes 5–15 seconds')}
        </p>
      </div>
    </div>
  );
}

/**
 * Renders the [ZH]/[EN] structured analysis output:
 *   【现状判断】 ... 【下一步重点】 ... 【常见陷阱】 ... 【行动建议】 ...
 *   [State] ... [Next Focus] ... [Common Pitfall] ... [Action] ...
 * Shows each block with a styled header.
 */
function StructuredAnalysis({ text }: { text: string }) {
  if (!text) return null;

  // Split on 【...】 (zh) or [...] (en) headers at line start.
  const re = /^(【[^】]+】|\[[^\]]+\])/gm;
  const chunks: { header: string; body: string }[] = [];
  const parts = text.split(re);
  // parts is [leading, header, body, header, body, ...]
  let leading = parts.shift() || '';
  if (leading.trim()) chunks.push({ header: '', body: leading.trim() });
  for (let i = 0; i < parts.length; i += 2) {
    const header = (parts[i] || '').trim();
    const body = (parts[i + 1] || '').trim();
    if (header || body) chunks.push({ header, body });
  }

  if (!chunks.length) {
    return <p className="text-sm text-gray-700 whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {chunks.map((c, i) => (
        <div key={i}>
          {c.header && (
            <p className="text-xs font-bold text-emerald-700 mb-1">
              {c.header.replace(/[【】\[\]]/g, '')}
            </p>
          )}
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{c.body}</div>
        </div>
      ))}
    </div>
  );
}
