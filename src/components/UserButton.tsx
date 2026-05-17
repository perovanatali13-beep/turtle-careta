'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import type { User } from '@supabase/supabase-js';
import { UserCircle, LogOut, Settings, ChevronDown } from 'lucide-react';

const ADMIN_EMAILS = ['perova.natali13@gmail.com', 'allsterlitamak@gmail.com'];

export default function UserButton() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setOpen(false);
  }

  /* Не вошёл — иконка-ссылка на /account */
  if (!user) {
    return (
      <Link
        href="/account"
        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        title="Войти"
      >
        <UserCircle size={20} />
      </Link>
    );
  }

  /* Вошёл — аватар с дропдауном */
  const initial = (user.user_metadata?.full_name as string || user.email || '?').slice(0, 1).toUpperCase();
  const isAdmin = ADMIN_EMAILS.includes((user.email ?? '').toLowerCase());

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        title={user.email}
      >
        <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">
          {initial}
        </div>
        <ChevronDown size={12} className={`text-[var(--color-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[var(--color-border)] rounded-xl shadow-lg py-1 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <div className="text-xs font-medium text-[var(--color-text)] truncate">{user.email}</div>
            {isAdmin && <div className="text-xs text-[var(--color-primary)] mt-0.5">Администратор</div>}
          </div>

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-gray-50 transition-colors"
          >
            <UserCircle size={15} className="text-[var(--color-text-muted)]" />
            Мой аккаунт
          </Link>

          {isAdmin && (
            <a
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-gray-50 transition-colors"
            >
              <Settings size={15} className="text-[var(--color-text-muted)]" />
              Администрирование
            </a>
          )}

          <div className="border-t border-[var(--color-border)] mt-1 pt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut size={15} />
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
