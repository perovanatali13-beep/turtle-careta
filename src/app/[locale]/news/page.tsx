import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import NewsCard from '@/components/NewsCard';
import { createClient } from '@/lib/supabase/server';
import type { NewsItem, Locale, NewsCategory } from '@/lib/supabase/types';

const CATEGORIES: { key: NewsCategory | 'all'; path: string }[] = [
  { key: 'all', path: '/news' },
  { key: 'ecology', path: '/news/ecology' },
  { key: 'rescue', path: '/news/rescue' },
  { key: 'cleanup', path: '/news/cleanup' },
  { key: 'coast', path: '/news/coast' },
  { key: 'research', path: '/news/research' },
];

async function getAllNews(): Promise<NewsItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations();
  const news = await getAllNews();

  return (
    <div className="py-12">
      <div className="container">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-8">
          {t('news.title')}
        </h1>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(({ key, path }) => (
            <Link
              key={key}
              href={path}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                key === 'all'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
              }`}
            >
              {t(`news.categories.${key}` as Parameters<typeof t>[0])}
            </Link>
          ))}
        </div>

        {news.length === 0 ? (
          <div className="text-center py-24 text-[var(--color-text-muted)]">
            <span className="text-6xl block mb-4">🐢</span>
            <p className="text-lg">Новости скоро появятся</p>
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
