'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { BM_VARIANTS } from '@/lib/battlemap-questions';

interface Props {
  diagnosticId: string;
  onStarted: () => void | Promise<void>;
}

const VARIANT_COLOR: Record<string, string> = {
  replication: 'border-amber-200 bg-amber-50/60',
  financing: 'border-blue-200 bg-blue-50/60',
  capitalization: 'border-emerald-200 bg-emerald-50/60',
};

export function BattleMapIntro({ diagnosticId, onStarted }: Props) {
  const { t } = useT();
  const [creating, setCreating] = useState(false);

  async function handleStart() {
    setCreating(true);
    try {
      await api.battlemaps.createForDiagnostic(diagnosticId);
      await onStarted();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-5">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
        <CardHeader>
          <CardTitle className="text-lg">
            {t('战略作战图', 'Strategic Battle Map')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-gray-700">
            {t(
              'Phase 1 告诉你"你在哪里、卡在哪里"。战略作战图进一步告诉你：下一阶段怎么打、用什么顺序打、90 天开始做什么。',
              'Phase 1 tells you where you are and what\'s stuck. The battle map tells you how to level up next, in what order, and what to start in 90 days.',
            )}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.values(BM_VARIANTS).map((v) => (
              <div key={v.key} className={`rounded-lg border p-3 ${VARIANT_COLOR[v.key]}`}>
                <p className="text-xs font-bold">{t(v.name_zh, v.name_en)}</p>
                <p className="text-[11px] mt-1 leading-snug text-gray-600">
                  {t(v.subtitle_zh, v.subtitle_en)}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-white border border-emerald-100 p-3">
            <p className="text-xs text-gray-700 leading-relaxed">
              <strong className="font-semibold">{t('如何工作', 'How it works')}：</strong>{' '}
              {t(
                '回答 35 道问题（约 15 分钟）。AI 会结合 Phase 1 的六大结构分数，从上方三种作战图中为你匹配最合适的一份，并生成 10 章量身定制的作战方案。',
                '35 questions (~15 min). AI combines them with your Phase 1 six-structure scores and picks the right battle map variant — then generates a 10-chapter tailored playbook.',
              )}
            </p>
          </div>
          <div className="flex items-center justify-end">
            <Button
              onClick={handleStart}
              disabled={creating}
              className="cursor-pointer h-10 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg font-semibold px-6"
            >
              {creating ? t('正在创建...', 'Creating...') : t('开始作战图问卷', 'Start battle map questionnaire')}
              <span className="ml-1">→</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
