export type Locale = 'ru' | 'tr' | 'en';

export interface NewsItem {
  id: string;
  slug: string;
  category: NewsCategory;
  title_ru: string | null;
  title_tr: string | null;
  title_en: string | null;
  content_ru: string | null;
  content_tr: string | null;
  content_en: string | null;
  excerpt_ru: string | null;
  excerpt_tr: string | null;
  excerpt_en: string | null;
  image_url: string | null;
  published_at: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageContent {
  id: string;
  slug: string;
  section: string;
  title_ru: string | null;
  title_tr: string | null;
  title_en: string | null;
  content_ru: string | null;
  content_tr: string | null;
  content_en: string | null;
  meta_title_ru: string | null;
  meta_title_tr: string | null;
  meta_title_en: string | null;
  meta_description_ru: string | null;
  meta_description_tr: string | null;
  meta_description_en: string | null;
  updated_at: string;
}

export interface SiteSetting {
  key: string;
  value_ru: string | null;
  value_tr: string | null;
  value_en: string | null;
  updated_at: string;
}

export type NewsCategory =
  | 'ecology'
  | 'rescue'
  | 'cleanup'
  | 'coast'
  | 'research';

export function getLocalizedField<T extends object>(
  obj: T,
  field: string,
  locale: Locale
): string {
  const key = `${field}_${locale}` as keyof T;
  const fallback = `${field}_ru` as keyof T;
  return (obj[key] as string) || (obj[fallback] as string) || '';
}
