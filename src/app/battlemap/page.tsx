'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { LangToggle } from '../diagnostic/_components/lang-toggle';
import { UserMenu } from '../diagnostic/_components/user-menu';
import { PhaseNav } from '../diagnostic/_components/phase-nav';
import { BattleMapIntro } from './_components/battlemap-intro';
import { BattleMapQuestionnaire } from './_components/battlemap-questionnaire';
import { BattleMapResults } from './_components/battlemap-results';

type Step =
  | 'loading'
  | 'auth-missing'        // not signed in
  | 'needs-phase1'        // no scored diagnostic yet
  | 'intro'               // diagnostic ready, no battle map yet
  | 'questionnaire'       // battle map draft in progress
  | 'results';            // classified — show variant + report CTA / report

export default function BattleMapPage() {
  const { t } = useT();
  const [step, setStep] = useState<Step>('loading');
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [battleMap, setBattleMap] = useState<any>(null);

  async function refresh() {
    const token = auth.get();
    if (!token) { setStep('auth-missing'); return; }

    try {
      const diagList = await api.diagnostics.list();
      const readyDiag = diagList?.find((d: any) => {
        const scores = d.module_scores || {};
        return Object.keys(scores).some((k) => k !== '_meta');
      });
      if (!readyDiag) { setStep('needs-phase1'); return; }
      setDiagnostic(readyDiag);

      const bmList = await api.battlemaps.listMine();
      const existing = bmList?.find((b: any) => b.diagnostic_id === readyDiag.id);
      if (!existing) { setStep('intro'); return; }
      setBattleMap(existing);
      if (existing.variant) {
        setStep('results');
      } else {
        setStep('questionnaire');
      }
    } catch (err) {
      // Session likely invalid
      auth.clear();
      setStep('auth-missing');
    }
  }

  useEffect(() => { refresh(); }, []);

  const loggedIn = step !== 'auth-missing' && step !== 'loading';
  const showPhaseNav = loggedIn && step !== 'needs-phase1';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3 gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/iifle-logo.png"
              alt="IIFLE"
              width={120}
              height={38}
              priority
              className="h-8 w-auto"
            />
          </Link>
          {showPhaseNav && (
            <div className="hidden sm:block">
              <PhaseNav active="battlemap" battlemapUnlocked={true} />
            </div>
          )}
          {loggedIn ? (
            <UserMenu
              companyName={diagnostic?.company_name}
              diagnosticId={diagnostic?.id || ''}
              onLogout={() => { auth.clear(); setStep('auth-missing'); }}
            />
          ) : (
            <LangToggle />
          )}
        </div>
        {/* Mobile — nav wraps below on small screens */}
        {showPhaseNav && (
          <div className="sm:hidden mx-auto max-w-5xl px-4 pb-3 flex justify-center">
            <PhaseNav active="battlemap" battlemapUnlocked={true} />
          </div>
        )}
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {step === 'loading' && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        )}

        {step === 'auth-missing' && (
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-lg font-bold mb-2">{t('请先登录', 'Please sign in')}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {t('战略作战图需要在已登录的诊断账号下使用。', 'The battle map lives under your signed-in diagnostic account.')}
            </p>
            <Link href="/diagnostic" className="cursor-pointer inline-flex items-center rounded-lg bg-emerald-500 text-white text-sm font-semibold px-5 py-2 hover:bg-emerald-600">
              {t('前往登录', 'Go to sign in')}
            </Link>
          </div>
        )}

        {step === 'needs-phase1' && (
          <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-center">
            <h2 className="text-lg font-bold mb-2">{t('需先完成 Phase 1 诊断', 'Finish Phase 1 diagnostic first')}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {t(
                '战略作战图基于 Phase 1 的六大结构评分生成。请先完成诊断问卷，再回到此页面。',
                'The battle map is built from your Phase 1 six-structure scores. Complete the diagnostic first, then come back.',
              )}
            </p>
            <Link href="/diagnostic" className="cursor-pointer inline-flex items-center rounded-lg bg-emerald-500 text-white text-sm font-semibold px-5 py-2 hover:bg-emerald-600">
              {t('前往诊断', 'Go to diagnostic')}
            </Link>
          </div>
        )}

        {step === 'intro' && diagnostic && (
          <BattleMapIntro
            diagnosticId={diagnostic.id}
            onStarted={async () => { await refresh(); }}
          />
        )}

        {step === 'questionnaire' && battleMap && (
          <BattleMapQuestionnaire
            battleMapId={battleMap.id}
            initial={battleMap}
            onClassified={async () => { await refresh(); }}
          />
        )}

        {step === 'results' && battleMap && (
          <BattleMapResults
            battleMap={battleMap}
            diagnostic={diagnostic}
            onUpdated={async () => { await refresh(); }}
          />
        )}
      </main>
    </div>
  );
}
