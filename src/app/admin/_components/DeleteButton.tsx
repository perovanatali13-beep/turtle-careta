'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteButton() {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Удалить?</span>
        <button type="submit"
          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
          Да
        </button>
        <button type="button" onClick={() => setConfirm(false)}
          className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors">
          Нет
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setConfirm(true)}
      className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
      <Trash2 size={15} />
      Удалить
    </button>
  );
}
