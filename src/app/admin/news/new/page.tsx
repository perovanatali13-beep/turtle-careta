import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '../../_components/AdminSidebar';
import NewsForm from '../_components/NewsForm';

export default async function NewNewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-8">Новая новость</h1>
        <NewsForm />
      </main>
    </div>
  );
}
