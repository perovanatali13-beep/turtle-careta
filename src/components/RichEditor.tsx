'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';

interface Props {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
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

export default function RichEditor({ name, defaultValue = '', placeholder }: Props) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[var(--color-primary)] underline' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'Введите текст...' }),
    ],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate({ editor }) {
      if (hiddenRef.current) {
        hiddenRef.current.value = editor.getHTML();
      }
    },
  });

  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value = defaultValue;
    }
  }, [defaultValue]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL ссылки:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-[var(--color-border)]">
        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Заголовок H2">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Заголовок H3">
          H3
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-300 mx-1" />

        {/* Inline */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Жирный (Ctrl+B)">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Курсив (Ctrl+I)">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')} title="Подчёркнутый (Ctrl+U)">
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="Зачёркнутый">
          <s>S</s>
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Маркированный список">
          ≡
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Нумерованный список">
          1≡
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-300 mx-1" />

        {/* Align */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })} title="По левому краю">
          ⬅
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })} title="По центру">
          ↔
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })} title="По правому краю">
          ➡
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-300 mx-1" />

        {/* Link */}
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Вставить ссылку">
          🔗
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Убрать ссылку">
            ✂️
          </ToolbarButton>
        )}

        <span className="w-px h-5 bg-gray-300 mx-1" />

        {/* Blockquote + HR */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Цитата">
          ❝
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Разделитель">
          —
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-300 mx-1" />

        {/* Undo / Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Отменить (Ctrl+Z)">
          ↩
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Повторить (Ctrl+Y)">
          ↪
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-4 py-3 min-h-[200px] text-[var(--color-text)] focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[200px]"
      />

      {/* Hidden input for form submission */}
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultValue} />
    </div>
  );
}
