'use client';

import { useState, useTransition } from 'react';
import { createNews, updateNews } from '../../actions';
import ImagePicker from './ImagePicker';
import type { NewsItem } from '@/lib/supabase/types';

const CATEGORIES = [
  { value: 'ecology', label: 'Экологические акции' },
  { value: 'rescue',  label: 'Спасение черепах' },
  { value: 'cleanup', label: 'Уборки пляжей' },
  { value: 'coast',   label: 'Защита побережья' },
  { value: 'research',label: 'Исследования' },
];

const LANGS = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
];

interface Props {
  item?: NewsItem;
  initialImages?: string[];
}

export default function NewsForm({ item, initialImages = [] }: Props) {
  const [lang, setLang] = useState<'ru' | 'en' | 'tr'>('ru');
  const [published, setPublished] = useState(item?.published ?? true);
  const [images, setImages] = useState<string[]>(initialImages);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('published', String(published));
    fd.set('images', JSON.stringify(images));
    startTransition(async () => {
      if (item) await updateNews(item.id, fd);
      else await createNews(fd);
    });
  }

  const inputClass = 'w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20';
  const labelClass = 'block text-sm font-medium text-[var(--color-text)] mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Slug + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Slug (URL) *</label>
          <input name="slug" defaultValue={item?.slug} required placeholder="my-news-slug"
            className={inputClass} readOnly={!!item}
            style={item ? { background: '#f5f5f5', cursor: 'not-allowed' } : {}} />
        </div>
        <div>
          <label className={labelClass}>Категория *</label>
          <select name="category" defaultValue={item?.category ?? 'ecology'} required className={inputClass}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className={labelClass}>Дата публикации</label>
        <input type="datetime-local" name="published_at"
          defaultValue={item?.published_at ? item.published_at.slice(0, 16) : new Date().toISOString().slice(0, 16)}
          className={inputClass} />
      </div>

      {/* Image picker */}
      <div>
        <label className={labelClass}>Фотографии</label>
        <ImagePicker value={images} onChange={setImages} />
      </div>

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
                  defaultValue={(item as unknown as Record<string,string>)?.[`title_${code}`] ?? ''}
                  className={inputClass} placeholder="Заголовок новости" />
              </div>
              <div>
                <label className={labelClass}>Краткое описание ({code.toUpperCase()})</label>
                <textarea name={`excerpt_${code}`} rows={2}
                  defaultValue={(item as unknown as Record<string,string>)?.[`excerpt_${code}`] ?? ''}
                  className={inputClass} placeholder="Короткое описание для карточки..." />
              </div>
              <div>
                <label className={labelClass}>Текст статьи ({code.toUpperCase()})</label>
                <textarea name={`content_${code}`} rows={10}
                  defaultValue={(item as unknown as Record<string,string>)?.[`content_${code}`] ?? ''}
                  className={inputClass} placeholder="Полный текст новости..." />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Published + Submit */}
      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <button type="button" onClick={() => setPublished(p => !p)}
            className={`w-12 h-6 rounded-full transition-colors relative ${published ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${published ? 'left-7' : 'left-1'}`} />
          </button>
          <span className="text-sm font-medium text-[var(--color-text)]">
            {published ? 'Опубликовано' : 'Черновик'}
          </span>
        </label>

        <div className="flex gap-3">
          <a href="/admin/news" className="px-5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 transition-colors">
            Отмена
          </a>
          <button type="submit" disabled={isPending}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60">
            {isPending ? 'Сохранение...' : item ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </form>
  );
}
