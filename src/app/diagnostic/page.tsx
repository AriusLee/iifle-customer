'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { LangToggle } from './_components/lang-toggle';
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
    setDiagnosticId('');
    setResultData(null);
    setStep('company');
  };

  const stepLabels: { key: Step; zh: string; en: string }[] = [
    { key: 'auth', zh: '登录', en: 'Auth' },
    { key: 'company', zh: '企业信息', en: 'Company' },
    { key: 'questionnaire', zh: '问卷诊断', en: 'Questionnaire' },
    { key: 'results', zh: '诊断结果', en: 'Results' },
  ];
  const stepIdx = stepLabels.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-emerald-600">IIFLE</span>
          <div className="hidden sm:flex items-center gap-1">
            {stepLabels.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  i === stepIdx ? 'bg-emerald-500 text-white'
                    : i < stepIdx ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <span>{i + 1}</span>
                  <span>{t(s.zh, s.en)}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`mx-1 h-px w-4 ${i < stepIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <LangToggle />
        </div>
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
