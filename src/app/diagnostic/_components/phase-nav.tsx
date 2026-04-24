'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';

interface Props {
  /** Which phase is currently active. */
  active: 'diagnostic' | 'battlemap';
  /** Whether the battle map tab is clickable. False before Phase 1 scoring completes. */
  battlemapUnlocked: boolean;
}

/**
 * Top-of-page navigation between the two customer phases.
 * Active tab gets a solid dark fill + brand gold underline.
 * Inactive tabs are soft slate pills; the locked Battle Map tab shows a
 * gold-tinted lock hint instead of gray.
 */
export function PhaseNav({ active, battlemapUnlocked }: Props) {
  const { t } = useT();

  const baseTab =
    'cursor-pointer relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all';

  return (
    <nav
      className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 backdrop-blur-sm p-1 shadow-sm"
      aria-label="Phase navigation"
    >
      <Link
        href="/diagnostic"
        className={`${baseTab} ${
          active === 'diagnostic'
            ? 'bg-slate-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
            active === 'diagnostic' ? 'bg-[var(--gold)] text-white' : 'bg-slate-200 text-slate-600'
          }`}
        >
          1
        </span>
        <span>{t('诊断', 'Diagnostic')}</span>
      </Link>

      {battlemapUnlocked ? (
        <Link
          href="/battlemap"
          className={`${baseTab} ${
            active === 'battlemap'
              ? 'bg-slate-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span
            className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
              active === 'battlemap' ? 'bg-[var(--gold)] text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </span>
          <span>{t('作战图', 'Battle Map')}</span>
        </Link>
      ) : (
        <span
          className={`${baseTab} text-slate-400 cursor-not-allowed`}
          title={t('先完成诊断再开启作战图', 'Finish the diagnostic to unlock the battle map')}
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-400">
            2
          </span>
          <span>{t('作战图', 'Battle Map')}</span>
          <svg className="h-3 w-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </span>
      )}
    </nav>
  );
}
