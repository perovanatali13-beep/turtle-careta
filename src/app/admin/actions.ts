'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function saveImages(supabase: Awaited<ReturnType<typeof createClient>>, newsId: string, images: string[]) {
  await supabase.from('news_images').delete().eq('news_id', newsId);
  if (!images.length) return;
  await supabase.from('news_images').insert(
    images.map((url, i) => ({ news_id: newsId, image_url: url, sort_order: i }))
  );
}

// ─── NEWS ─────────────────────────────────────────────────────────────────────

export async function createNews(formData: FormData) {
  const supabase = await createClient();

  const slug = (formData.get('slug') as string).trim()
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const images: string[] = JSON.parse((formData.get('images') as string) || '[]');

  const { data, error } = await supabase.from('news').insert({
    slug,
    category: formData.get('category'),
    title_ru:   formData.get('title_ru')   || null,
    title_en:   formData.get('title_en')   || null,
    title_tr:   formData.get('title_tr')   || null,
    excerpt_ru: formData.get('excerpt_ru') || null,
    excerpt_en: formData.get('excerpt_en') || null,
    excerpt_tr: formData.get('excerpt_tr') || null,
    content_ru: formData.get('content_ru') || null,
    content_en: formData.get('content_en') || null,
    content_tr: formData.get('content_tr') || null,
    image_url:  images[0] || null,
    published:  formData.get('published') === 'true',
    published_at: formData.get('published_at') || new Date().toISOString(),
  }).select('id').single();

  if (error) throw new Error(error.message);
  await saveImages(supabase, data.id, images);

  revalidatePath('/admin/news');
  revalidatePath('/[locale]/news', 'page');
  redirect('/admin/news');
}

export async function updateNews(id: string, formData: FormData) {
  const supabase = await createClient();
  const images: string[] = JSON.parse((formData.get('images') as string) || '[]');

  const { error } = await supabase.from('news').update({
    category:   formData.get('category'),
    title_ru:   formData.get('title_ru')   || null,
    title_en:   formData.get('title_en')   || null,
    title_tr:   formData.get('title_tr')   || null,
    excerpt_ru: formData.get('excerpt_ru') || null,
    excerpt_en: formData.get('excerpt_en') || null,
    excerpt_tr: formData.get('excerpt_tr') || null,
    content_ru: formData.get('content_ru') || null,
    content_en: formData.get('content_en') || null,
    content_tr: formData.get('content_tr') || null,
    image_url:  images[0] || null,
    published:  formData.get('published') === 'true',
    published_at: formData.get('published_at') || new Date().toISOString(),
  }).eq('id', id);

  if (error) throw new Error(error.message);
  await saveImages(supabase, id, images);

  revalidatePath('/admin/news');
  revalidatePath('/[locale]/news', 'page');
  redirect('/admin/news');
}

export async function deleteNews(id: string) {
  const supabase = await createClient();
  await supabase.from('news_images').delete().eq('news_id', id);
  await supabase.from('news').delete().eq('id', id);
  revalidatePath('/admin/news');
}

export async function togglePublished(id: string, published: boolean) {
  const supabase = await createClient();
  await supabase.from('news').update({ published }).eq('id', id);
  revalidatePath('/admin/news');
  revalidatePath('/[locale]/news', 'page');
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

export async function updatePage(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from('pages').update({
    title_ru:            formData.get('title_ru')            || null,
    title_en:            formData.get('title_en')            || null,
    title_tr:            formData.get('title_tr')            || null,
    content_ru:          formData.get('content_ru')          || null,
    content_en:          formData.get('content_en')          || null,
    content_tr:          formData.get('content_tr')          || null,
    meta_title_ru:       formData.get('meta_title_ru')       || null,
    meta_title_en:       formData.get('meta_title_en')       || null,
    meta_title_tr:       formData.get('meta_title_tr')       || null,
    meta_description_ru: formData.get('meta_description_ru') || null,
    meta_description_en: formData.get('meta_description_en') || null,
    meta_description_tr: formData.get('meta_description_tr') || null,
  }).eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/pages');
  redirect('/admin/pages');
}
