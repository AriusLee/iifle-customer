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
 * Top-of-page navigation between the two customer phases. Replaces the old
 * intra-phase wizard step pills (auth → company → questionnaire → results)
 * with a simple two-tab switcher — the content below each page self-explains
 * where the user is inside that phase.
 */
export function PhaseNav({ active, battlemapUnlocked }: Props) {
  const { t } = useT();

  const baseTab = 'cursor-pointer flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors';
  const activeTab = 'bg-emerald-500 text-white shadow-sm';
  const inactiveTab = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  const lockedTab = 'bg-gray-50 text-gray-300 cursor-not-allowed';

  return (
    <nav className="flex items-center gap-1" aria-label="Phase navigation">
      <Link
        href="/diagnostic"
        className={`${baseTab} ${active === 'diagnostic' ? activeTab : inactiveTab}`}
      >
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
          1
        </span>
        <span>{t('诊断', 'Diagnostic')}</span>
      </Link>

      {battlemapUnlocked ? (
        <Link
          href="/battlemap"
          className={`${baseTab} ${active === 'battlemap' ? activeTab : inactiveTab}`}
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
            2
          </span>
          <span>{t('作战图', 'Battle Map')}</span>
        </Link>
      ) : (
        <span
          className={`${baseTab} ${lockedTab}`}
          title={t('先完成诊断再开启作战图', 'Finish the diagnostic to unlock the battle map')}
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold">
            2
          </span>
          <span>{t('作战图', 'Battle Map')}</span>
          <svg className="h-3 w-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </span>
      )}
    </nav>
  );
}
