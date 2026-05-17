'use client';

import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, Loader2, X, Image as ImageIcon, Link2 } from 'lucide-react';

// ─── Resizable Image ──────────────────────────────────────────────────────────

function ResizableImageView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = (side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = node.attrs.width ?? containerRef.current?.offsetWidth ?? 300;
    const onMove = (ev: MouseEvent) => {
      const delta = side === 'right' ? ev.clientX - startX : startX - ev.clientX;
      updateAttributes({ width: Math.max(80, Math.round(startWidth + delta)) });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 10,
    height: 32,
    background: '#0d7a8a',
    borderRadius: 3,
    cursor: 'ew-resize',
    zIndex: 10,
    opacity: 0.9,
  };

  return (
    <NodeViewWrapper style={{ display: 'block', lineHeight: 0, margin: '0.5em 0' }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: node.attrs.width ? `${node.attrs.width}px` : 'auto',
          maxWidth: '100%',
          outline: selected ? '2px solid #0d7a8a' : 'none',
          outlineOffset: 1,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt ?? ''}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          draggable={false}
        />
        {selected && (
          <>
            <div onMouseDown={startResize('left')}  style={{ ...handle, left:  6 }} />
            <div onMouseDown={startResize('right')} style={{ ...handle, right: 6 }} />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src:   { default: null },
      alt:   { default: null },
      width: { default: null },
    };
  },

  parseHTML() {
    return [{
      tag: 'img[src]',
      getAttrs: (el) => {
        if (typeof el === 'string') return {};
        const dom = el as HTMLElement;
        const w = dom.getAttribute('width');
        return { src: dom.getAttribute('src'), alt: dom.getAttribute('alt'), width: w ? parseInt(w) : null };
      },
    }];
  },

  renderHTML({ HTMLAttributes }) {
    const { width, ...rest } = HTMLAttributes;
    return ['img', mergeAttributes(rest, {
      width: width ?? undefined,
      style: 'max-width:100%;height:auto;display:block',
    })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

// ─── Image Modal ──────────────────────────────────────────────────────────────

const BUCKET = 'news-images';

function ImageModal({ onInsert, onClose }: { onInsert: (src: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'gallery' | 'url'>('gallery');
  const [gallery, setGallery] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const loadGallery = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.storage.from(BUCKET).list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
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

  useEffect(() => { loadGallery(); }, [loadGallery]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fname = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await supabase.storage.from(BUCKET).upload(fname, file);
    await loadGallery();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex gap-2">
            {(['gallery', 'url'] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  tab === t ? 'bg-[var(--color-primary)] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {t === 'gallery' ? 'Галерея' : 'По URL'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {tab === 'gallery' && (
              <label className="flex items-center gap-1.5 cursor-pointer bg-[var(--color-primary)] text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Загрузить
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            )}
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'gallery' ? (
            loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-gray-400" />
              </div>
            ) : gallery.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ImageIcon size={40} className="mb-3 opacity-30" />
                <p className="text-sm">Нет фото. Нажмите «Загрузить».</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {gallery.map(({ name, url }) => (
                  <button key={name} type="button" onClick={() => onInsert(url)}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-[var(--color-primary)] hover:scale-95 transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlValue}
                  onChange={e => setUrlValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && urlValue) { e.preventDefault(); onInsert(urlValue); } }}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-primary)]"
                  autoFocus
                />
                <button type="button" onClick={() => urlValue && onInsert(urlValue)}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-1.5">
                  <Link2 size={14} /> Вставить
                </button>
              </div>
              {urlValue && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlValue} alt="preview" className="max-h-48 rounded-lg object-contain border border-[var(--color-border)]" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolbarButton({ onClick, active, title, children }: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-[var(--color-primary)] text-white'
          : 'text-[var(--color-text-muted)] hover:bg-gray-200 hover:text-[var(--color-text)]'
      }`}
    >
      {children}
    </button>
  );
}

// ─── RichEditor ───────────────────────────────────────────────────────────────

interface Props {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

export default function RichEditor({ name, defaultValue = '', placeholder }: Props) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[var(--color-primary)] underline' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'Введите текст...' }),
      ResizableImage,
    ],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate({ editor }) {
      if (hiddenRef.current) hiddenRef.current.value = editor.getHTML();
    },
  });

  useEffect(() => {
    if (hiddenRef.current) hiddenRef.current.value = defaultValue;
  }, [defaultValue]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL ссылки:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const insertImage = (src: string) => {
    editor.chain().focus().insertContent({ type: 'resizableImage', attrs: { src, width: 400 } }).run();
    setShowImageModal(false);
  };

  return (
    <>
      {showImageModal && <ImageModal onInsert={insertImage} onClose={() => setShowImageModal(false)} />}

      <div className="border border-[var(--color-border)] rounded-lg focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-[var(--color-border)] rounded-t-lg">
          {/* Headings */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })} title="Заголовок H2">H2</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })} title="Заголовок H3">H3</ToolbarButton>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Inline */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')} title="Жирный"><strong>B</strong></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')} title="Курсив"><em>I</em></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')} title="Подчёркнутый"><u>U</u></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')} title="Зачёркнутый"><s>S</s></ToolbarButton>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Lists */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')} title="Маркированный список">≡</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')} title="Нумерованный список">1≡</ToolbarButton>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Align */}
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })} title="По левому краю">⬅</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })} title="По центру">↔</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })} title="По правому краю">➡</ToolbarButton>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Link */}
          <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Вставить ссылку">🔗</ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Убрать ссылку">✂️</ToolbarButton>
          )}

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Image */}
          <ToolbarButton onClick={() => setShowImageModal(true)} title="Вставить изображение">
            <ImageIcon size={15} />
          </ToolbarButton>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Blockquote + HR */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')} title="Цитата">❝</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Разделитель">—</ToolbarButton>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Undo / Redo */}
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Отменить (Ctrl+Z)">↩</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Повторить (Ctrl+Y)">↪</ToolbarButton>
        </div>

        {/* Editor area */}
        <EditorContent
          editor={editor}
          className="px-4 py-3 min-h-[200px] text-[var(--color-text)]"
        />

        <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultValue} />
      </div>
    </>
  );
}
