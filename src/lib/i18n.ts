import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'zh' | 'en';

interface I18nStore {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set) => ({
      locale: 'zh',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'iifle-customer-locale' }
  )
);

export function useT() {
  const locale = useI18n((s) => s.locale);
  const t = (zh: string, en: string) => (locale === 'zh' ? zh : en);
  return { t, locale };
}
