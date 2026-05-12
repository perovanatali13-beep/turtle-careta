import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '../_components/AdminSidebar';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  // Get stats
  const [{ count: newsCount }, { count: pageCount }] = await Promise.all([
    supabase.from('news').select('*', { count: 'exact', head: true }),
    supabase.from('pages').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-8">
          Панель управления
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard label="Новостей" value={newsCount ?? 0} icon="📰" />
          <StatCard label="Страниц" value={pageCount ?? 0} icon="📄" />
          <StatCard label="Языков" value={3} icon="🌐" />
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">Быстрые действия</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="/admin/news/new"
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              + Новая новость
            </a>
            <a
              href="/admin/pages"
              className="inline-flex items-center gap-2 border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Редактировать страницы
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-3xl font-bold text-[var(--color-text)]">{value}</div>
      <div className="text-sm text-[var(--color-text-muted)] mt-1">{label}</div>
    </div>
  );
}
