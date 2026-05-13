'use client';

import { useState, useTransition } from 'react';
import { updatePage } from '../../actions';
import type { PageContent } from '@/lib/supabase/types';

interface FaqItem { q: string; a: string; }

const LANGS = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
] as const;

type LangCode = 'ru' | 'en' | 'tr';

function parseFaq(raw: string | null): FaqItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

function EmptyIcon() {
  return (
    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function FaqEditor({ page }: { page: PageContent }) {
  const [lang, setLang] = useState<LangCode>('ru');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const p = page as unknown as Record<string, string>;

  const [items, setItems] = useState<Record<LangCode, FaqItem[]>>({
    ru: parseFaq(p.content_ru),
    en: parseFaq(p.content_en),
    tr: parseFaq(p.content_tr),
  });

  const [titles, setTitles] = useState<Record<LangCode, string>>({
    ru: p.title_ru ?? '',
    en: p.title_en ?? '',
    tr: p.title_tr ?? '',
  });

  function addItem() {
    setItems(prev => ({ ...prev, [lang]: [...prev[lang], { q: '', a: '' }] }));
  }

  function removeItem(index: number) {
    setItems(prev => ({ ...prev, [lang]: prev[lang].filter((_, i) => i !== index) }));
  }

  function updateItem(index: number, field: 'q' | 'a', value: string) {
    setItems(prev => ({
      ...prev,
      [lang]: prev[lang].map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));
  }

  function moveItem(index: number, dir: -1 | 1) {
    setItems(prev => {
      const arr = [...prev[lang]];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return { ...prev, [lang]: arr };
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    LANGS.forEach(({ code }) => {
      fd.set(`title_${code}`, titles[code]);
      fd.set(`content_${code}`, JSON.stringify(items[code]));
    });
    startTransition(async () => {
      await updatePage(page.id, fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  const inputClass = 'w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Lang tabs */}
      <div className="bg-gray-50 rounded-xl p-5 border border-[var(--color-border)]">
        <div className="flex gap-1 mb-5 border-b border-[var(--color-border)] pb-3">
          {LANGS.map(({ code, label }) => (
            <button key={code} type="button" onClick={() => setLang(code)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                lang === code ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:bg-white'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Title */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            Заголовок страницы ({lang.toUpperCase()})
          </label>
          <input
            value={titles[lang]}
            onChange={e => setTitles(prev => ({ ...prev, [lang]: e.target.value }))}
            className={inputClass}
            placeholder="Заголовок..."
          />
        </div>

        {/* FAQ items */}
        <div className="space-y-3">
          {items[lang].length === 0 ? (
            <div className="py-10 text-center text-[var(--color-text-muted)]">
              <EmptyIcon />
              <p className="text-sm">Нет вопросов. Нажмите «Добавить вопрос».</p>
            </div>
          ) : (
            items[lang].map((item, i) => (
              <div key={i} className="bg-white border border-[var(--color-border)] rounded-xl p-4 space-y-3">
                {/* Item header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    Вопрос {i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0}
                      className="p-1 rounded text-gray-400 hover:text-[var(--color-text)] hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      title="Переместить вверх">
                      ↑
                    </button>
                    <button type="button" onClick={() => moveItem(i, 1)} disabled={i === items[lang].length - 1}
                      className="p-1 rounded text-gray-400 hover:text-[var(--color-text)] hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      title="Переместить вниз">
                      ↓
                    </button>
                    <button type="button" onClick={() => removeItem(i)}
                      className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                      title="Удалить вопрос">
                      ✕
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Вопрос</label>
                  <input
                    value={item.q}
                    onChange={e => updateItem(i, 'q', e.target.value)}
                    className={inputClass}
                    placeholder="Введите вопрос..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Ответ</label>
                  <textarea
                    value={item.a}
                    onChange={e => updateItem(i, 'a', e.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder="Введите ответ..."
                  />
                </div>
              </div>
            ))
          )}

          <button type="button" onClick={addItem}
            className="w-full py-2.5 border-2 border-dashed border-[var(--color-border)] rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors flex items-center justify-center gap-2">
            <span className="text-lg leading-none">+</span> Добавить вопрос
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <a href="/admin/pages"
          className="px-5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 transition-colors">
          Отмена
        </a>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium">✓ Сохранено</span>
          )}
          <button type="submit" disabled={isPending}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60">
            {isPending ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </form>
  );
}
