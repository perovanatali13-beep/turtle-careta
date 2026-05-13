'use client';

import { useState } from 'react';

interface FaqItem { q: string; a: string; }

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-[var(--color-border)] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-[var(--color-text)]">{item.q}</span>
            <span className={`flex-shrink-0 text-[var(--color-primary)] transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          {open === i && (
            <div className="px-5 pb-5 text-[var(--color-text-muted)] text-sm leading-relaxed border-t border-[var(--color-border)]">
              <p className="pt-4">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
