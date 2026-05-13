'use client';

import { useState, useTransition } from 'react';
import { updatePage } from '../../actions';
import type { PageContent } from '@/lib/supabase/types';
import RichEditor from '@/components/RichEditor';

const LANGS = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
];

export default function PageForm({ page }: { page: PageContent }) {
  const [lang, setLang] = useState<'ru' | 'en' | 'tr'>('ru');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updatePage(page.id, fd);
    });
  }

  const inputClass = 'w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20';
  const labelClass = 'block text-sm font-medium text-[var(--color-text)] mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Lang tabs */}
      <div className="bg-gray-50 rounded-xl p-5 border border-[var(--color-border)]">
        <div className="flex gap-1 mb-5 border-b border-[var(--color-border)] pb-3">
          {LANGS.map(({ code, label }) => (
            <button key={code} type="button" onClick={() => setLang(code as 'ru'|'en'|'tr')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                lang === code ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:bg-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {LANGS.map(({ code }) => (
          <div key={code} className={lang === code ? 'block' : 'hidden'}>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Заголовок ({code.toUpperCase()})</label>
                <input name={`title_${code}`}
                  defaultValue={(page as unknown as Record<string,string>)[`title_${code}`] ?? ''}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Содержимое ({code.toUpperCase()})</label>
                <RichEditor
                  name={`content_${code}`}
                  defaultValue={(page as unknown as Record<string,string>)[`content_${code}`] ?? ''}
                  placeholder="Текст страницы..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SEO */}
      <details className="border border-[var(--color-border)] rounded-xl overflow-hidden">
        <summary className="px-5 py-3 bg-gray-50 cursor-pointer text-sm font-medium text-[var(--color-text)]">
          SEO метаданные
        </summary>
        <div className="p-5 grid grid-cols-1 gap-4">
          {LANGS.map(({ code, label }) => (
            <div key={code} className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Meta title {label}</label>
                <input name={`meta_title_${code}`}
                  defaultValue={(page as unknown as Record<string,string>)[`meta_title_${code}`] ?? ''}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Meta description {label}</label>
                <input name={`meta_description_${code}`}
                  defaultValue={(page as unknown as Record<string,string>)[`meta_description_${code}`] ?? ''}
                  className={inputClass} />
              </div>
            </div>
          ))}
        </div>
      </details>

      <div className="flex justify-end gap-3">
        <a href="/admin/pages" className="px-5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 transition-colors">
          Отмена
        </a>
        <button type="submit" disabled={isPending}
          className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60">
          {isPending ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}
