'use client';

import { useI18n } from '@/lib/i18n';

export function LangToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <button
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-[var(--gold)]/40 hover:bg-[var(--gold-soft)]/50 hover:text-[var(--gold-dark)] transition-all shadow-sm"
      title={locale === 'zh' ? 'Switch to English' : '切换至中文'}
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span>{locale === 'zh' ? 'EN' : '中文'}</span>
    </button>
  );
}
