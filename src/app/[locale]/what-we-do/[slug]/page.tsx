export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/server';
import { getLocalizedField } from '@/lib/supabase/types';
import type { PageContent, Locale } from '@/lib/supabase/types';

const VALID_SLUGS = [
  'caretta-conservation',
  'sand-lily',
  'publications',
  'hotels-coast',
  'beach-cleanup',
];

const SLUG_TO_KEY: Record<string, string> = {
  'caretta-conservation': 'carettaConservation',
  'sand-lily': 'sandLily',
  publications: 'publications',
  'hotels-coast': 'hotelsCoast',
  'beach-cleanup': 'beachCleanup',
};

async function getPage(slug: string): Promise<PageContent | null> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('section', 'what-we-do')
      .single();
    return data;
  } catch {
    return null;
  }
}

export default async function WhatWeDoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations();

  if (!VALID_SLUGS.includes(slug)) notFound();

  const page = await getPage(slug);
  const pageTitle = page
    ? getLocalizedField(page, 'title', locale)
    : t(`nav.${SLUG_TO_KEY[slug]}` as Parameters<typeof t>[0]);
  const pageContent = page ? getLocalizedField(page, 'content', locale) : null;

  return (
    <div className="py-12">
      <div className="container max-w-3xl">
        <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-8">
          <Link href="/" className="hover:text-[var(--color-primary)]">{t('common.home')}</Link>
          <span>/</span>
          <span>{t('nav.whatWeDo')}</span>
          <span>/</span>
          <span className="text-[var(--color-text)]">{pageTitle}</span>
        </nav>

        <div className="mb-10 pb-8 border-b border-[var(--color-border)]">
          <div className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold px-3 py-1 rounded-full mb-4">
            {t('nav.whatWeDo')}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)]">{pageTitle}</h1>
        </div>

        {pageContent ? (
          <div
            className="prose prose-lg max-w-none text-[var(--color-text)]"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        ) : (
          <div className="py-16 text-center text-[var(--color-text-muted)]">
            <span className="text-5xl block mb-4">🐢</span>
            <p>Контент скоро будет добавлен.</p>
          </div>
        )}
      </div>
    </div>
  );
}
