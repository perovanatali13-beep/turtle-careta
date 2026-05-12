import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '../_components/AdminSidebar';
import type { NewsItem } from '@/lib/supabase/types';
import { Plus, Pencil } from 'lucide-react';

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: news } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Новости</h1>
          <Link
            href="/admin/news/new"
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <Plus size={16} />
            Добавить
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          {!news || news.length === 0 ? (
            <div className="text-center py-16 text-[var(--color-text-muted)]">
              <span className="text-4xl block mb-3">📰</span>
              <p>Новостей пока нет. Добавьте первую!</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Заголовок (RU)</th>
                  <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Категория</th>
                  <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Дата</th>
                  <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Статус</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {(news as NewsItem[]).map((item) => (
                  <tr key={item.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-[var(--color-text)] max-w-xs truncate">
                      {item.title_ru || '—'}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">{item.category}</td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {new Date(item.published_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.published ? 'Опубликовано' : 'Черновик'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/news/${item.id}`}
                        className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:underline text-xs"
                      >
                        <Pencil size={12} />
                        Редактировать
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
