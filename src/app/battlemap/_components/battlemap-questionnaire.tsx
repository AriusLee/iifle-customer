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

      {/* Section tabs */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm pb-3 pt-2 px-4">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {BM_SECTIONS.map((s, i) => {
            const done = submitted.includes(s.key);
            return (
              <button
                key={s.key}
                onClick={() => { setCurIdx(i); scroll(); }}
                className={`cursor-pointer flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  i === curIdx ? 'bg-emerald-500 text-white shadow-sm'
                    : done ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <span className="font-bold">{s.key.toUpperCase()}</span>
                <span className="hidden sm:inline">{t(s.zh, s.en)}</span>
                {done && i !== curIdx && <CheckSvg />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>
            {t('已提交', 'Submitted')} {submitted.length}/{BM_SECTIONS.length} {t('分区', 'sections')} ·{' '}
            {totalAnswered}/{BM_TOTAL_QUESTIONS} {t('题', 'questions')}
          </span>
          <span>{Math.round((submitted.length / BM_SECTIONS.length) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${(submitted.length / BM_SECTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Inline AI analysis — shown after section is submitted */}
      {isSectionDone && analysis && (analysis.analysis_zh || analysis.analysis_en) && (
        <Card className="mt-4 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">{t('AI 顾问分析', 'AI Consultant Analysis')}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t(section.zh, section.en)} · {t('基于你的回答与 Phase 1 阶段定位', 'Based on your answers + Phase 1 stage')}
                </p>
              </div>
            </div>
            <StructuredAnalysis text={t(analysis.analysis_zh || '', analysis.analysis_en || '')} />
          </CardContent>
        </Card>
      )}

      {/* Questions (hidden when submitted, unless editing) */}
      {showQuestions ? (
        <>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
                  {section.key.toUpperCase()}
                </span>
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
                const val = answers[q.id] || '';

                if (q.kind === 'open') {
                  return (
                    <div key={q.id}>
                      <p className="text-sm font-medium mb-1">
                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                          {qi + 1}
                        </span>
                        {t(q.zh, q.en)}
                      </p>
                      <div className="ml-7">
                        <textarea
                          value={val}
                          onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                          placeholder={t(q.placeholder_zh || '', q.placeholder_en || '')}
                          className="w-full min-h-[80px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={q.id}>
                    <p className="text-sm font-medium mb-1">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
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
                            className={`cursor-pointer flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                              selected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={selected}
                              onChange={() => pick(q.id, opt.value)}
                              className="cursor-pointer accent-emerald-500"
                            />
                            <span className="text-gray-800">{t(opt.zh, opt.en)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Footer — while answering/editing */}
          <div className="sticky bottom-0 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-sm py-4 px-4 mt-4 border-t">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={curIdx === 0}
              className="cursor-pointer h-10 px-5"
            >
              ← {t('上一步', 'Back')}
            </Button>

            <Button
              variant="ghost"
              onClick={() => { saveDraft(); toast.success(t('已保存', 'Saved')); }}
              disabled={saving}
              className="cursor-pointer h-10 text-xs text-gray-500"
            >
              {saving ? t('保存中...', 'Saving...') : t('保存草稿', 'Save Draft')}
            </Button>

            <div className="flex items-center gap-2">
              {editing && (
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  className="cursor-pointer h-10 px-5"
                >
                  {t('取消', 'Cancel')}
                </Button>
              )}
              {sectionAllAnswered && canSubmitSection && (
                <Button
                  onClick={handleSubmitSection}
                  disabled={submittingSection}
                  className="cursor-pointer h-10 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg font-semibold px-6"
                >
                  {submittingSection
                    ? t('分析中...', 'Analyzing...')
                    : isSectionDone
                      ? t('重新分析', 'Re-analyze')
                      : t('提交并分析', 'Submit & analyze')}
                </Button>
              )}
              {!sectionAllAnswered && (
                <span className="text-xs text-gray-400">{t('回答所有问题后提交', 'Answer all to submit')}</span>
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
        <div className="mt-4 flex items-center justify-between gap-3 px-4">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={curIdx === 0}
            className="cursor-pointer h-10 px-5"
          >
            ← {t('上一步', 'Back')}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setEditing(true)}
              className="cursor-pointer h-10 px-5"
            >
              {t('重新作答', 'Re-answer')}
            </Button>
            {curIdx < BM_SECTIONS.length - 1 && (
              <Button
                onClick={goNext}
                className="cursor-pointer h-10 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg font-semibold px-6"
              >
                {t('下一分区', 'Next section')} →
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
