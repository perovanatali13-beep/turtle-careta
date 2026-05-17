'use client';

import { useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteUser } from '../actions';

export default function DeleteUserButton({ userId, email }: { userId: string; email: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Удалить пользователя ${email}?`)) return;
    startTransition(async () => {
      await deleteUser(userId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50 transition-colors"
    >
      {isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      Удалить
    </button>
  );
}
