import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import NewsCard from '@/components/NewsCard';
import { createClient } from '@/lib/supabase/server';
import type { NewsItem, Locale, NewsCategory } from '@/lib/supabase/types';

const VALID_CATEGORIES: NewsCategory[] = ['ecology', 'rescue', 'cleanup', 'coast', 'research'];

async function getNewsByCategory(category: NewsCategory): Promise<NewsItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .eq('category', category)
      .order('published_at', { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function NewsCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { category } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations();

  if (!VALID_CATEGORIES.includes(category as NewsCategory)) {
    notFound();
  }

  const news = await getNewsByCategory(category as NewsCategory);

  return (
    <div className="py-12">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
          <Link href="/" className="hover:text-[var(--color-primary)]">
            {t('common.home')}
          </Link>
          <span>/</span>
          <Link href="/news" className="hover:text-[var(--color-primary)]">
            {t('news.title')}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text)]">
            {t(`news.categories.${category}` as Parameters<typeof t>[0])}
          </span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-8">
          {t(`news.categories.${category}` as Parameters<typeof t>[0])}
        </h1>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/news"
            className="px-4 py-2 rounded-full text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            {t('news.categories.all')}
          </Link>
          {VALID_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/news/${cat}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                cat === category
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
              }`}
            >
              {t(`news.categories.${cat}` as Parameters<typeof t>[0])}
            </Link>
          ))}
        </div>

        {news.length === 0 ? (
          <div className="text-center py-24 text-[var(--color-text-muted)]">
            <span className="text-6xl block mb-4">🐢</span>
            <p>В этой категории пока нет новостей</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
