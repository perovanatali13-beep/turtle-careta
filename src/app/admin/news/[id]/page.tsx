import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '../../_components/AdminSidebar';
import NewsForm from '../_components/NewsForm';
import DeleteButton from '../../_components/DeleteButton';
import { deleteNews } from '../../actions';
import type { NewsItem } from '@/lib/supabase/types';

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const [{ data: item }, { data: images }] = await Promise.all([
    supabase.from('news').select('*').eq('id', id).single(),
    supabase.from('news_images').select('image_url').eq('news_id', id).order('sort_order'),
  ]);
  if (!item) notFound();

  const imageUrls = (images ?? []).map(i => i.image_url);

  async function handleDelete() {
    'use server';
    await deleteNews(id);
    redirect('/admin/news');
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Редактировать новость</h1>
          <form action={handleDelete}>
            <DeleteButton />
          </form>
        </div>
        <NewsForm item={item as NewsItem} initialImages={imageUrls} />
      </main>
    </div>
  );
}
