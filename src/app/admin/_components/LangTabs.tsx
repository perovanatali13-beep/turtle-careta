'use client';

import { useState } from 'react';

interface Tab { code: string; label: string }
const TABS: Tab[] = [
  { code: 'ru', label: 'РУС' },
  { code: 'en', label: 'ENG' },
  { code: 'tr', label: 'TUR' },
];

interface Props {
  renderContent: (lang: string) => React.ReactNode;
}

export default function LangTabs({ renderContent }: Props) {
  const [active, setActive] = useState('ru');

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-[var(--color-border)]">
        {TABS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => setActive(code)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              active === code
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-muted)] hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {renderContent(active)}
    </div>
  );
}
