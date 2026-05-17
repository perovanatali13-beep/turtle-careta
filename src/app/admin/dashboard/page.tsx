export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import AdminSidebar from '../_components/AdminSidebar';
import { Newspaper, FileText, Globe, Users, Plus, Pencil, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import type { NewsItem } from '@/lib/supabase/types';

const CATEGORY_LABELS: Record<string, string> = {
  ecology: 'Эко-акции', rescue: 'Спасение', cleanup: 'Уборка', coast: 'Побережье', research: 'Наука',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [
    { count: newsTotal },
    { count: newsPublished },
    { count: pageCount },
    { data: recentNews },
    { data: { users: userList } },
  ] = await Promise.all([
    supabase.from('news').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('pages').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*').order('created_at', { ascending: false }).limit(5),
    adminSupabase.auth.admin.listUsers(),
  ]);

  const stats = [
    { label: 'Новостей опубликовано', value: newsPublished ?? 0, sub: `из ${newsTotal ?? 0} всего`, icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/news' },
    { label: 'Страниц сайта', value: pageCount ?? 0, sub: 'статических страниц', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50', href: '/admin/pages' },
    { label: 'Пользователей', value: userList?.length ?? 0, sub: 'в системе', icon: Users, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary-light)]', href: '/admin/users' },
    { label: 'Языков', value: 3, sub: 'ru · tr · en', icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50', href: null },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Добро пожаловать 👋</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{user.email} · Панель управления Caretta Gazipaşa</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map(({ label, value, sub, icon: Icon, color, bg, href }) => {
            const card = (
              <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={20} className={color} />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-[var(--color-text)]">{value}</div>
                  <div className="text-sm font-medium text-[var(--color-text)] leading-tight">{label}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</div>
                </div>
              </div>
            );
            return href ? (
              <Link key={label} href={href} className="block">{card}</Link>
            ) : (
              <div key={label}>{card}</div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent news */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-[var(--color-text)]">Последние новости</h2>
              <Link href="/admin/news" className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline">
                Все новости <ArrowRight size={12} />
              </Link>
            </div>
            {!recentNews || recentNews.length === 0 ? (
              <div className="py-12 text-center text-[var(--color-text-muted)] text-sm">Новостей пока нет</div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {(recentNews as NewsItem[]).map(item => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50">
                    <div className="shrink-0">
                      {item.published
                        ? <CheckCircle2 size={16} className="text-green-500" />
                        : <Clock size={16} className="text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--color-text)] truncate">
                        {item.title_ru || item.slug}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {CATEGORY_LABELS[item.category] ?? item.category} · {new Date(item.published_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <Link href={`/admin/news/${item.id}`} className="shrink-0 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                      <Pencil size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-[var(--color-text)]">Быстрые действия</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { href: '/admin/news/new', label: 'Добавить новость', icon: Plus, primary: true },
                { href: '/admin/pages', label: 'Редактировать страницы', icon: FileText, primary: false },
                { href: '/admin/users', label: 'Управление пользователями', icon: Users, primary: false },
                { href: '/ru', label: 'Перейти на сайт', icon: Globe, primary: false, external: true },
              ].map(({ href, label, icon: Icon, primary, external }) => (
                <Link
                  key={href}
                  href={href}
                  target={external ? '_blank' : undefined}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    primary
                      ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                      : 'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
