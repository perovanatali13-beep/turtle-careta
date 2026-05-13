'use client';

import { useTransition } from 'react';
import { togglePublished } from '../../actions';

export default function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => togglePublished(id, !published));
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={published ? 'Снять с публикации' : 'Опубликовать'}
      className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
        published ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
      }`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
        published ? 'left-6' : 'left-1'
      }`} />
    </button>
  );
}
