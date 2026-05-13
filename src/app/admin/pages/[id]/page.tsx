import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageForm from '../_components/PageForm';
import type { PageContent } from '@/lib/supabase/types';

const SECTION_LABELS: Record<string, string> = {
  'what-you-can-do': 'Что вы можете сделать',
  'volunteers':      'Волонтёры',
  'what-we-do':      'Что мы делаем',
  'about':           'О нас',
};

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase.from('pages').select('*').eq('id', id).single();
  if (!page) notFound();

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
          {SECTION_LABELS[page.section] ?? page.section}
        </p>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {page.title_ru || page.slug}
        </h1>
      </div>
      <PageForm page={page as PageContent} />
    </div>
  );
}
