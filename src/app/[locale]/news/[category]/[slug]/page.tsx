import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getLocalizedField } from '@/lib/supabase/types';
import type { NewsItem, Locale } from '@/lib/supabase/types';
import { ClickableImage, ArticleContent } from '@/components/Lightbox';

async function getNewsItem(category: string, slug: string): Promise<NewsItem | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .eq('category', category)
      .eq('published', true)
      .single();
    return data;
  } catch {
    return null;
  }
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations();

  const news = await getNewsItem(category, slug);
  if (!news) notFound();

  const title = getLocalizedField(news, 'title', locale);
  const content = getLocalizedField(news, 'content', locale);

  return (
    <article className="py-12">
      <div className="container max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-8">
          <Link href="/" className="hover:text-[var(--color-primary)]">
            {t('common.home')}
          </Link>
          <span>/</span>
          <Link href="/news" className="hover:text-[var(--color-primary)]">
            {t('news.title')}
          </Link>
          <span>/</span>
          <Link href={`/news/${category}`} className="hover:text-[var(--color-primary)]">
            {t(`news.categories.${category}` as Parameters<typeof t>[0])}
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
          {title}
        </h1>
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-8">
          <Calendar size={14} />
          <time dateTime={news.published_at}>
            {new Date(news.published_at).toLocaleDateString(
              locale === 'ru' ? 'ru-RU' : locale === 'tr' ? 'tr-TR' : 'en-GB',
              { day: 'numeric', month: 'long', year: 'numeric' }
            )}
          </time>
        </div>

        {/* Main photo — max 700px, clickable */}
        {news.image_url && (
          <div className="mb-10 flex justify-start">
            <ClickableImage
              src={news.image_url}
              alt={title}
              className="w-full max-w-[500px] h-auto rounded-2xl shadow-sm"
            />
          </div>
        )}

        {/* Article content — images inside are also clickable */}
        {content ? (
          <ArticleContent html={content} />
        ) : (
          <p className="text-[var(--color-text-muted)]" />
        )}

        <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
          <Link
            href={`/news/${category}`}
            className="flex items-center gap-2 text-[var(--color-primary)] font-medium hover:gap-3 transition-all"
          >
            <ArrowLeft size={16} />
            {t('common.backToNews')}
          </Link>
        </div>
      </div>
    </article>
  );
}
