import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import type { NewsItem, Locale } from '@/lib/supabase/types';
import { getLocalizedField } from '@/lib/supabase/types';

const CATEGORY_COLORS: Record<string, string> = {
  ecology: 'bg-green-100 text-green-800',
  rescue: 'bg-blue-100 text-blue-800',
  cleanup: 'bg-yellow-100 text-yellow-800',
  coast: 'bg-cyan-100 text-cyan-800',
  research: 'bg-purple-100 text-purple-800',
};

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  ecology: { ru: 'Эко-акции', en: 'Eco Actions', tr: 'Ekolojik' },
  rescue: { ru: 'Спасение', en: 'Rescue', tr: 'Kurtarma' },
  cleanup: { ru: 'Уборка', en: 'Cleanup', tr: 'Temizlik' },
  coast: { ru: 'Побережье', en: 'Coast', tr: 'Kıyı' },
  research: { ru: 'Наука', en: 'Research', tr: 'Araştırma' },
};

interface NewsCardProps {
  news: NewsItem;
  locale: Locale;
}

export default function NewsCard({ news, locale }: NewsCardProps) {
  const title = getLocalizedField(news, 'title', locale);
  const excerpt = getLocalizedField(news, 'excerpt', locale);
  const categoryColor = CATEGORY_COLORS[news.category] ?? 'bg-gray-100 text-gray-800';
  const categoryLabel = CATEGORY_LABELS[news.category]?.[locale] ?? news.category;

  const href = `/news/${news.category}/${news.slug}`;

  return (
    <Link href={href} className="group block">
      <article className="bg-white rounded-xl overflow-hidden border border-[var(--color-border)] hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-[var(--color-primary-light)] overflow-hidden">
          {news.image_url ? (
            <Image
              src={news.image_url}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl opacity-30">🐢</span>
            </div>
          )}
          <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full ${categoryColor}`}>
            {categoryLabel}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-semibold text-[var(--color-text)] leading-snug mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
            {title || '—'}
          </h3>
          {excerpt && (
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-3 flex-1">
              {excerpt}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-3 text-xs text-[var(--color-text-muted)]">
            <Calendar size={12} />
            <time dateTime={news.published_at}>
              {new Date(news.published_at).toLocaleDateString(
                locale === 'ru' ? 'ru-RU' : locale === 'tr' ? 'tr-TR' : 'en-GB',
                { day: 'numeric', month: 'long', year: 'numeric' }
              )}
            </time>
          </div>
        </div>
      </article>
    </Link>
  );
}
