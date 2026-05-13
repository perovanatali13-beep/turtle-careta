import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createPublicClient } from '@/lib/supabase/server';
import { getLocalizedField } from '@/lib/supabase/types';
import type { NewsItem, PageContent, Locale } from '@/lib/supabase/types';
import { Search as SearchIcon, Calendar } from 'lucide-react';

interface SearchResult {
  type: 'news' | 'page';
  title: string;
  excerpt: string;
  href: string;
  date?: string;
  category?: string;
}

async function search(query: string, locale: Locale): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  try {
    const supabase = createPublicClient();
    const q = query.trim();

    const [newsRes, pagesRes] = await Promise.all([
      supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .or(
          `title_ru.ilike.%${q}%,title_en.ilike.%${q}%,title_tr.ilike.%${q}%,content_ru.ilike.%${q}%`
        )
        .limit(10),
      supabase
        .from('pages')
        .select('*')
        .or(`title_ru.ilike.%${q}%,title_en.ilike.%${q}%,title_tr.ilike.%${q}%`)
        .limit(10),
    ]);

    const newsResults: SearchResult[] = (newsRes.data ?? []).map((item: NewsItem) => ({
      type: 'news',
      title: getLocalizedField(item, 'title', locale),
      excerpt: getLocalizedField(item, 'excerpt', locale),
      href: `/news/${item.category}/${item.slug}`,
      date: item.published_at,
      category: item.category,
    }));

    const pageResults: SearchResult[] = (pagesRes.data ?? []).map((item: PageContent) => ({
      type: 'page',
      title: getLocalizedField(item, 'title', locale),
      excerpt: '',
      href: `/${item.section}/${item.slug}`,
    }));

    return [...newsResults, ...pageResults];
  } catch {
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('search');

  const results = q ? await search(q, locale) : [];

  return (
    <div className="py-12">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-8">
          {t('title')}
        </h1>

        {/* Search form */}
        <form action="" method="GET" className="mb-10">
          <div className="relative">
            <SearchIcon
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder={t('placeholder')}
              className="w-full pl-12 pr-4 py-3.5 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
        </form>

        {q && (
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              {t('resultsFor')}: <strong className="text-[var(--color-text)]">{q}</strong> —{' '}
              {results.length} {t('results')}
            </p>

            {results.length === 0 ? (
              <div className="text-center py-16 text-[var(--color-text-muted)]">
                <SearchIcon size={48} className="mx-auto mb-4 opacity-30" />
                <p>{t('noResults')}</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {results.map((result, i) => (
                  <li key={i}>
                    <Link
                      href={result.href}
                      className="block p-5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] mt-0.5 shrink-0">
                          {result.type === 'news' ? result.category : 'page'}
                        </span>
                        <div>
                          <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                            {result.title || '—'}
                          </h3>
                          {result.excerpt && (
                            <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">
                              {result.excerpt}
                            </p>
                          )}
                          {result.date && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-[var(--color-text-muted)]">
                              <Calendar size={11} />
                              {new Date(result.date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
