'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Loader2, LogOut, Mail, CheckCircle, ShieldCheck } from 'lucide-react';

type Tab = 'login' | 'register';
type View = 'auth' | 'profile' | 'forgot' | 'forgot-sent';

const ADMIN_EMAILS = ['perova.natali13@gmail.com', 'allsterlitamak@gmail.com'];

const inputCls = 'w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors bg-white';
const btnPrimary = 'w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60';

export default function AccountForms() {
  const [view, setView] = useState<View>('auth');
  const [tab, setTab] = useState<Tab>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
      if (user) setView('profile');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) setView('profile');
      else { setView('auth'); setSuccess(''); setError(''); }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reset() { setError(''); setSuccess(''); }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault(); reset();
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError('Неверный email или пароль. Проверьте данные и попробуйте снова.');
      else setSuccess('Вы вошли в систему.');
    });
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault(); reset();
    startTransition(async () => {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      });
      if (error) setError(error.message);
      else setSuccess('Проверьте почту для подтверждения регистрации.');
    });
  }

  function handleForgot(e: React.FormEvent) {
    e.preventDefault(); reset();
    startTransition(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/account',
      });
      if (error) setError(error.message);
      else setView('forgot-sent');
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setEmail(''); setPassword(''); setName('');
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[var(--color-text-muted)]" />
      </div>
    );
  }

  /* ── Профиль авторизованного ─────────────────────────────── */
  if (view === 'profile' && user) {
    const fullName = user.user_metadata?.full_name as string | undefined;
    const isAdmin = ADMIN_EMAILS.includes((user.email ?? '').toLowerCase());
    const initial = (fullName || user.email || '?').slice(0, 1).toUpperCase();

    return (
      <div className="max-w-md mx-auto">
        {/* Avatar */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {initial}
          </div>
          {fullName && <h2 className="text-xl font-bold text-[var(--color-text)]">{fullName}</h2>}
          <p className="text-[var(--color-text-muted)] text-sm mt-1">{user.email}</p>
          {isAdmin && (
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold">
              <ShieldCheck size={13} /> Администратор
            </span>
          )}
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)] mb-4">
          <div className="flex items-center gap-3 px-5 py-4">
            <Mail size={16} className="text-[var(--color-text-muted)] shrink-0" />
            <div>
              <div className="text-xs text-[var(--color-text-muted)]">Email</div>
              <div className="text-sm font-medium text-[var(--color-text)]">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <CheckCircle size={16} className="text-green-500 shrink-0" />
            <div>
              <div className="text-xs text-[var(--color-text-muted)]">Статус аккаунта</div>
              <div className="text-sm font-medium text-green-600">
                {user.email_confirmed_at ? 'Email подтверждён' : 'Ожидает подтверждения email'}
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <a
            href="/admin/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors mb-3"
          >
            <ShieldCheck size={15} /> Перейти в админ-панель
          </a>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <LogOut size={15} /> Выйти
        </button>
      </div>
    );
  }

  /* ── Письмо отправлено ───────────────────────────────────── */
  if (view === 'forgot-sent') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Mail size={28} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Письмо отправлено</h2>
        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          Мы отправили ссылку для сброса пароля на <strong>{email}</strong>.<br />Проверьте почту.
        </p>
        <button onClick={() => { setView('auth'); reset(); }}
          className="text-sm text-[var(--color-primary)] hover:underline">
          ← Вернуться к входу
        </button>
      </div>
    );
  }

  /* ── Сброс пароля ────────────────────────────────────────── */
  if (view === 'forgot') {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Сброс пароля</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Введите email — пришлём ссылку для создания нового пароля.
        </p>
        <form onSubmit={handleForgot} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" required autoFocus className={inputCls} />
          {error && <div className="text-sm px-4 py-2.5 rounded-xl bg-red-50 text-red-700">{error}</div>}
          <button type="submit" disabled={isPending} className={btnPrimary}>
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? 'Отправляем...' : 'Отправить ссылку'}
          </button>
          <button type="button" onClick={() => { setView('auth'); reset(); }}
            className="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors py-1 text-center">
            ← Назад к входу
          </button>
        </form>
      </div>
    );
  }

  /* ── Вход / Регистрация ──────────────────────────────────── */
  return (
    <div className="max-w-md mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-8">
        {(['login', 'register'] as const).map(t => (
          <button key={t} type="button"
            onClick={() => { setTab(t); reset(); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white text-[var(--color-text)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            {t === 'login' ? 'Вход' : 'Регистрация'}
          </button>
        ))}
      </div>

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" required autoComplete="email" className={inputCls} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Пароль" required autoComplete="current-password" className={inputCls} />

          {error   && <div className="text-sm px-4 py-2.5 rounded-xl bg-red-50   text-red-700">{error}</div>}
          {success && <div className="text-sm px-4 py-2.5 rounded-xl bg-green-50 text-green-700">{success}</div>}

          <button type="submit" disabled={isPending} className={btnPrimary}>
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? 'Входим...' : 'Войти'}
          </button>

          <button type="button" onClick={() => { setView('forgot'); reset(); }}
            className="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors py-1 text-left">
            Забыли пароль?
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Ваше имя" autoComplete="name" className={inputCls} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" required autoComplete="email" className={inputCls} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Пароль (минимум 6 символов)" required minLength={6}
            autoComplete="new-password" className={inputCls} />

          {error   && <div className="text-sm px-4 py-2.5 rounded-xl bg-red-50   text-red-700">{error}</div>}
          {success && <div className="text-sm px-4 py-2.5 rounded-xl bg-green-50 text-green-700">{success}</div>}

          <button type="submit" disabled={isPending} className={btnPrimary}>
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? 'Регистрируем...' : 'Зарегистрироваться'}
          </button>
        </form>
      )}
    </div>
  );
}
