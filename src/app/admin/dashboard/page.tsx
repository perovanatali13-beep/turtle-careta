export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import AdminSidebar from '../_components/AdminSidebar';
import {
  Newspaper, FileText, Globe, Users,
  Plus, Pencil, ArrowRight, CheckCircle2, Clock,
  Eye, MousePointerClick, TrendingUp, MapPin,
} from 'lucide-react';
import type { NewsItem } from '@/lib/supabase/types';

const CATEGORY_LABELS: Record<string, string> = {
  ecology: 'Эко-акции', rescue: 'Спасение', cleanup: 'Уборка',
  coast: 'Побережье', research: 'Наука',
};

const COUNTRY_NAMES: Record<string, string> = {
  RU: 'Россия', TR: 'Турция', DE: 'Германия', US: 'США',
  GB: 'Великобритания', FR: 'Франция', UA: 'Украина',
  KZ: 'Казахстан', BY: 'Беларусь', UZ: 'Узбекистан',
  AZ: 'Азербайджан', GE: 'Грузия', AM: 'Армения',
  PL: 'Польша', CZ: 'Чехия', NL: 'Нидерланды',
  IT: 'Италия', ES: 'Испания', SE: 'Швеция', NO: 'Норвегия',
};

type PV = { page_path: string; session_id: string; country: string | null; city: string | null; created_at: string };

function ago(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function countUniq(rows: PV[]) { return new Set(rows.map(r => r.session_id)).size; }

function topN<T extends string>(rows: (T | null)[], n = 5): [string, number][] {
  const map: Record<string, number> = {};
  rows.forEach(v => { if (v) map[v] = (map[v] ?? 0) + 1; });
  return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, n);
}

function BarChart({ data }: { data: { label: string; views: number; uniq: number }[] }) {
  const max = Math.max(...data.map(d => d.views), 1);
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {data.map(d => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="text-[10px] text-[var(--color-text-muted)] font-medium">{d.views || ''}</div>
          <div className="w-full flex flex-col justify-end" style={{ height: 80 }}>
            <div
              className="w-full rounded-t-sm bg-[var(--color-primary)] opacity-80 hover:opacity-100 transition-opacity min-h-[2px]"
              style={{ height: `${Math.max((d.views / max) * 80, d.views > 0 ? 2 : 0)}px` }}
              title={`${d.views} просмотров, ${d.uniq} уникальных`}
            />
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = startOfToday();
  const d7 = ago(7);
  const d30 = ago(30);

  const [
    { count: newsTotal },
    { count: newsPublished },
    { count: pageCount },
    { data: recentNews },
    { data: { users: userList } },
    { data: allPV },
  ] = await Promise.all([
    supabase.from('news').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('pages').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('id,title_ru,slug,category,published,published_at').order('created_at', { ascending: false }).limit(5),
    adminSupabase.auth.admin.listUsers(),
    adminSupabase.from('page_views').select('page_path,session_id,country,city,created_at').order('created_at', { ascending: false }),
  ]);

  const pv: PV[] = allPV ?? [];
  const pvToday = pv.filter(r => new Date(r.created_at) >= today);
  const pv7 = pv.filter(r => new Date(r.created_at) >= d7);
  const pv30 = pv.filter(r => new Date(r.created_at) >= d30);

  // Daily bars: last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(today); start.setDate(today.getDate() - (6 - i));
    const end = new Date(start); end.setDate(start.getDate() + 1);
    const rows = pv.filter(r => { const t = new Date(r.created_at); return t >= start && t < end; });
    const label = start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
    return { label, views: rows.length, uniq: countUniq(rows) };
  });

  // Popular pages (30d)
  const pageCounts = topN(pv30.map(r => r.page_path) as string[], 8);

  // Countries & cities
  const countries = topN(pv.map(r => r.country), 6);
  const cities = topN(pv.map(r => r.city), 6);

  const statsCards = [
    { label: 'Новостей опубл.', value: newsPublished ?? 0, sub: `из ${newsTotal ?? 0} всего`, icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/news' },
    { label: 'Страниц', value: pageCount ?? 0, sub: 'статических', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50', href: '/admin/pages' },
    { label: 'Пользователей', value: userList?.length ?? 0, sub: 'в системе', icon: Users, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary-light)]', href: '/admin/users' },
    { label: 'Языков', value: 3, sub: 'ru · tr · en', icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50', href: null },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Дашборд</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{user.email}</p>
        </div>

        {/* Site stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map(({ label, value, sub, icon: Icon, color, bg, href }) => {
            const card = (
              <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <div className="text-xl font-bold text-[var(--color-text)]">{value}</div>
                  <div className="text-xs font-medium text-[var(--color-text)]">{label}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{sub}</div>
                </div>
              </div>
            );
            return href
              ? <Link key={label} href={href}>{card}</Link>
              : <div key={label}>{card}</div>;
          })}
        </div>

        {/* Analytics cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Просмотры сегодня', value: pvToday.length, icon: Eye, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { label: 'Просмотры 7 дней', value: pv7.length, icon: Eye, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Просмотры 30 дней', value: pv30.length, icon: Eye, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Всего просмотров', value: pv.length, icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-[var(--color-border)] p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--color-text)]">{value}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Уникальные сегодня', value: countUniq(pvToday), icon: MousePointerClick, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Уникальные 7 дней', value: countUniq(pv7), icon: MousePointerClick, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Уникальные 30 дней', value: countUniq(pv30), icon: MousePointerClick, color: 'text-pink-600', bg: 'bg-pink-50' },
            { label: 'Уникальные всего', value: countUniq(pv), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-[var(--color-border)] p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--color-text)]">{value}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Daily chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[var(--color-border)] p-5">
            <h2 className="font-semibold text-[var(--color-text)] mb-4 text-sm">Просмотры по дням (7 дней)</h2>
            {pv.length === 0
              ? <p className="text-xs text-[var(--color-text-muted)] py-10 text-center">Нет данных — настройте таблицу page_views</p>
              : <BarChart data={days} />
            }
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <h2 className="font-semibold text-[var(--color-text)] mb-3 text-sm">Быстрые действия</h2>
            <div className="space-y-2">
              {[
                { href: '/admin/news/new', label: 'Новая новость', icon: Plus, primary: true },
                { href: '/admin/pages', label: 'Страницы', icon: FileText, primary: false },
                { href: '/admin/users', label: 'Пользователи', icon: Users, primary: false },
                { href: '/ru', label: 'На сайт ↗', icon: Globe, primary: false, external: true },
              ].map(({ href, label, icon: Icon, primary, external }) => (
                <Link key={href} href={href} target={external ? '_blank' : undefined}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    primary
                      ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                      : 'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50'
                  }`}>
                  <Icon size={14} />{label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Popular pages */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-[var(--color-text)] text-sm">Популярные страницы (30 дней)</h2>
            </div>
            {pageCounts.length === 0
              ? <p className="text-xs text-[var(--color-text-muted)] py-8 text-center">Нет данных</p>
              : <div className="divide-y divide-[var(--color-border)]">
                  {pageCounts.map(([path, count], i) => {
                    const maxC = pageCounts[0][1];
                    return (
                      <div key={path} className="flex items-center gap-3 px-5 py-2.5">
                        <span className="text-xs text-[var(--color-text-muted)] w-4 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-[var(--color-text)] truncate">{path}</div>
                          <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-primary)] opacity-60"
                              style={{ width: `${(count / maxC) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[var(--color-text)] shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>
            }
          </div>

          {/* Recent news */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-[var(--color-text)] text-sm">Последние новости</h2>
              <Link href="/admin/news" className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline">
                Все <ArrowRight size={11} />
              </Link>
            </div>
            {!recentNews || recentNews.length === 0
              ? <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">Новостей нет</div>
              : <div className="divide-y divide-[var(--color-border)]">
                  {(recentNews as NewsItem[]).map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                      <div className="shrink-0">
                        {item.published ? <CheckCircle2 size={14} className="text-green-500" /> : <Clock size={14} className="text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[var(--color-text)] truncate">{item.title_ru || item.slug}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {CATEGORY_LABELS[item.category] ?? item.category}
                        </div>
                      </div>
                      <Link href={`/admin/news/${item.id}`} className="shrink-0 text-[var(--color-primary)]"><Pencil size={12} /></Link>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

        {/* Geo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
              <MapPin size={14} className="text-[var(--color-text-muted)]" />
              <h2 className="font-semibold text-[var(--color-text)] text-sm">Страны</h2>
            </div>
            {countries.length === 0
              ? <p className="text-xs text-[var(--color-text-muted)] py-8 text-center">Нет данных</p>
              : <div className="divide-y divide-[var(--color-border)]">
                  {countries.map(([code, count]) => {
                    const maxC = countries[0][1];
                    return (
                      <div key={code} className="flex items-center gap-3 px-5 py-2.5">
                        <span className="text-sm w-6">{countryFlag(code)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-[var(--color-text)]">
                            {COUNTRY_NAMES[code] ?? code}
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-primary)] opacity-50"
                              style={{ width: `${(count / maxC) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[var(--color-text)] shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>
            }
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
              <MapPin size={14} className="text-[var(--color-text-muted)]" />
              <h2 className="font-semibold text-[var(--color-text)] text-sm">Города</h2>
            </div>
            {cities.length === 0
              ? <p className="text-xs text-[var(--color-text-muted)] py-8 text-center">Нет данных</p>
              : <div className="divide-y divide-[var(--color-border)]">
                  {cities.map(([city, count]) => {
                    const maxC = cities[0][1];
                    return (
                      <div key={city} className="flex items-center gap-3 px-5 py-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-[var(--color-text)] truncate">{city}</div>
                          <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-accent)] opacity-60"
                              style={{ width: `${(count / maxC) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[var(--color-text)] shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>
            }
          </div>
        </div>

      </main>
    </div>
  );
}

function countryFlag(code: string) {
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );
}
