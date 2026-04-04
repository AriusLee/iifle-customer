'use client';

import { useI18n } from '@/lib/i18n';

export function LangToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <button
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      className="cursor-pointer rounded-full border px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
    >
      {locale === 'zh' ? 'EN' : '中文'}
    </button>
  );
}
