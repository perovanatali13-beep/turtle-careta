import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import HeroSection from '@/components/HeroSection';
import ActionCards from '@/components/ActionCards';
import NewsCard from '@/components/NewsCard';
import { createClient } from '@/lib/supabase/server';
import type { NewsItem, Locale } from '@/lib/supabase/types';
import { ArrowRight } from 'lucide-react';

async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(6);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('home');
  const latestNews = await getLatestNews();

  return (
    <>
      <HeroSection />
      <ActionCards locale={locale} />

      {/* Latest news */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">
              {t('latestNews')}
            </h2>
            <Link
              href="/news"
              className="flex items-center gap-1.5 text-[var(--color-primary)] font-medium text-sm hover:gap-2.5 transition-all"
            >
              {t('viewAllNews')}
              <ArrowRight size={16} />
            </Link>
          </div>

          {latestNews.length === 0 ? (
            <div className="text-center py-20 text-[var(--color-text-muted)]">
              <span className="text-5xl block mb-4">🐢</span>
              <p>Новости скоро появятся</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestNews.map((item) => (
                <NewsCard key={item.id} news={item} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>

    </>
  );
}
