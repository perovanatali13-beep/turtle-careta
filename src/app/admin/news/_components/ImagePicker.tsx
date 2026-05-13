'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

const BUCKET = 'news-images';
const MAX = 3;

interface Props {
  value: string[];           // current selected URLs
  onChange: (urls: string[]) => void;
}

export default function ImagePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [gallery, setGallery] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const loadGallery = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.storage.from(BUCKET).list('', {
      limit: 100, sortBy: { column: 'created_at', order: 'desc' },
    });
    const items = await Promise.all(
      (data ?? [])
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(async f => {
          const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
          return { name: f.name, url: publicUrl };
        })
    );
    setGallery(items);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { if (open) loadGallery(); }, [open, loadGallery]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      await supabase.storage.from(BUCKET).upload(name, file);
    }
    await loadGallery();
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function toggleSelect(url: string) {
    if (value.includes(url)) {
      onChange(value.filter(u => u !== url));
    } else if (value.length < MAX) {
      onChange([...value, url]);
    }
  }

  function removeSelected(url: string) {
    onChange(value.filter(u => u !== url));
  }

  return (
    <div>
      {/* Selected images preview */}
      <div className="flex flex-wrap gap-3 mb-3">
        {value.map((url, i) => (
          <div key={i} className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-[var(--color-primary)] group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeSelected(url)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
            <span className="absolute bottom-1 left-1 bg-[var(--color-primary)] text-white text-xs rounded px-1.5">
              {i + 1}
            </span>
          </div>
        ))}

        {value.length < MAX && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-28 h-28 rounded-xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-1 text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Plus size={22} />
            <span className="text-xs">Добавить</span>
          </button>
        )}
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">До {MAX} фотографий</p>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text)]">
                Выберите фото ({value.length}/{MAX})
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-[var(--color-primary)] text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Загрузить
                  <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                </label>
                <button type="button" onClick={() => setOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Gallery */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-[var(--color-text-muted)]">
                  <Loader2 size={28} className="animate-spin" />
                </div>
              ) : gallery.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
                  <ImageIcon size={40} className="mb-3 opacity-30" />
                  <p>Нет загруженных фото</p>
                  <p className="text-xs mt-1">Нажмите «Загрузить» чтобы добавить</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {gallery.map(({ name, url }) => {
                    const selected = value.includes(url);
                    const idx = value.indexOf(url);
                    const disabled = !selected && value.length >= MAX;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => !disabled && toggleSelect(url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          selected ? 'border-[var(--color-primary)] shadow-md scale-95' :
                          disabled ? 'border-transparent opacity-40 cursor-not-allowed' :
                          'border-transparent hover:border-[var(--color-primary)]/50'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={name} className="w-full h-full object-cover" />
                        {selected && (
                          <div className="absolute inset-0 bg-[var(--color-primary)]/20 flex items-start justify-end p-1">
                            <span className="bg-[var(--color-primary)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {idx + 1}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
