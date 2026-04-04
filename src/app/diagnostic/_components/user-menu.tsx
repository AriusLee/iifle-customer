'use client';

import { useState, useRef, useEffect } from 'react';
import { useT, useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';

interface Props {
  companyName?: string;
  diagnosticId?: string;
  onLogout: () => void;
}

export function UserMenu({ companyName, diagnosticId, onLogout }: Props) {
  const { t } = useT();
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch company info when opened
  useEffect(() => {
    if (!open || company || !diagnosticId) return;
    api.diagnostics.get(diagnosticId).then((d) => {
      if (d?.company_name) setCompany({ name: d.company_name });
    }).catch(() => {});
  }, [open, company, diagnosticId]);

  const displayName = companyName || company?.name;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
          {displayName ? displayName[0].toUpperCase() : '?'}
        </div>
        <span className="hidden sm:inline max-w-[120px] truncate">{displayName || t('菜单', 'Menu')}</span>
        <svg className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-lg z-50 py-1 overflow-hidden">
          {/* Company info */}
          {displayName && (
            <div className="px-4 py-3 border-b">
              <p className="text-xs text-gray-400">{t('企业', 'Company')}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
            </div>
          )}

          {/* Language */}
          <button
            onClick={() => { setLocale(locale === 'zh' ? 'en' : 'zh'); }}
            className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {locale === 'zh' ? 'Switch to English' : '切换到中文'}
          </button>

          {/* Logout */}
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('退出登录', 'Logout')}
          </button>
        </div>
      )}
    </div>
  );
}
