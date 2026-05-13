'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PageContent } from '@/lib/supabase/types';

const SECTION_LABELS: Record<string, string> = {
  'what-you-can-do': 'Что вы можете сделать',
  'volunteers':      'Волонтёры',
  'what-we-do':      'Что мы делаем',
  'about':           'О нас',
};

export default function PagesNav({ pages }: { pages: PageContent[] }) {
  const pathname = usePathname();

  const grouped = pages.reduce<Record<string, PageContent[]>>((acc, p) => {
    (acc[p.section] ??= []).push(p);
    return acc;
  }, {});

  return (
    <nav className="w-64 shrink-0 border-r border-[var(--color-border)] bg-white overflow-y-auto">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Страницы
        </h2>
      </div>

      {Object.entries(SECTION_LABELS).map(([section, label]) => {
        const items = grouped[section] ?? [];
        if (!items.length) return null;
        return (
          <div key={section} className="border-b border-[var(--color-border)]">
            <div className="px-4 py-2.5 bg-gray-50">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                {label}
              </span>
            </div>
            {items.map((page) => {
              const href = `/admin/pages/${page.id}`;
              const active = pathname === href;
              return (
                <Link
                  key={page.id}
                  href={href}
                  className={`block px-4 py-2.5 text-sm transition-colors border-l-2 ${
                    active
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)] font-medium'
                      : 'text-[var(--color-text)] hover:bg-gray-50 border-transparent'
                  }`}
                >
                  {page.title_ru || page.slug}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
