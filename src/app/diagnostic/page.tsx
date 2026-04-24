'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { LangToggle } from './_components/lang-toggle';
import { UserMenu } from './_components/user-menu';
import { PhaseNav } from './_components/phase-nav';
import { AuthForm } from './_components/auth-form';
import { CompanyForm } from './_components/company-form';
import { Questionnaire } from './_components/questionnaire';
import { Results } from './_components/results';

type Step = 'loading' | 'auth' | 'company' | 'questionnaire' | 'results';

export default function DiagnosticPage() {
  const { t } = useT();
  const [step, setStep] = useState<Step>('loading');
  const [diagnosticId, setDiagnosticId] = useState('');
  const [resultData, setResultData] = useState<any>(null);

  // On mount — check session and resume
  useEffect(() => {
    (async () => {
      const token = auth.get();
      if (!token) { setStep('auth'); return; }

      try {
        const list = await api.diagnostics.list();
        if (list?.length) {
          const d = list[0];
          setDiagnosticId(d.id);
          if (d.status === 'completed') {
            setResultData(d);
            setStep('results');
          } else {
            setStep('questionnaire');
          }
        } else {
          setStep('company');
        }
      } catch {
        auth.clear();
        setStep('auth');
      }
    })();
  }, []);

  const handleAuth = async () => {
    // After auth, check for existing diagnostic
    try {
      const list = await api.diagnostics.list();
      if (list?.length) {
        const d = list[0];
        setDiagnosticId(d.id);
        if (d.status === 'completed') {
          setResultData(d);
          setStep('results');
        } else {
          setStep('questionnaire');
        }
        return;
      }
    } catch { /* fall through */ }
    setStep('company');
  };

  const handleCompany = (id: string) => {
    setDiagnosticId(id);
    setStep('questionnaire');
  };

  const handleComplete = (data: any) => {
    setResultData(data);
    setStep('results');
  };

  const handleRestart = () => {
    setResultData(null);
    setStep('questionnaire');
  };

  // Battle map unlocks once the Phase 1 diagnostic has produced scores.
  const battlemapUnlocked = !!(
    resultData?.module_scores &&
    Object.keys(resultData.module_scores).some((k) => k !== '_meta')
  );
  const loggedIn = step !== 'auth' && step !== 'loading';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-emerald-600">IIFLE</span>
          {loggedIn && (
            <div className="hidden sm:block">
              <PhaseNav active="diagnostic" battlemapUnlocked={battlemapUnlocked} />
            </div>
          )}
          {loggedIn ? (
            <UserMenu
              companyName={resultData?.company_name}
              diagnosticId={diagnosticId}
              onLogout={() => { auth.clear(); setStep('auth'); setDiagnosticId(''); setResultData(null); }}
            />
          ) : (
            <LangToggle />
          )}
        </div>
        {/* Mobile: phase nav wraps below on small screens */}
        {loggedIn && (
          <div className="sm:hidden mx-auto max-w-4xl px-4 pb-3">
            <PhaseNav active="diagnostic" battlemapUnlocked={battlemapUnlocked} />
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
        {step === 'auth' && <AuthForm onDone={handleAuth} />}
        {step === 'company' && <CompanyForm onDone={handleCompany} />}
        {step === 'questionnaire' && <Questionnaire diagnosticId={diagnosticId} onComplete={handleComplete} />}
        {step === 'results' && <Results diagnosticId={diagnosticId} data={resultData} onRestart={handleRestart} />}
      </main>
    </div>
  );
}
