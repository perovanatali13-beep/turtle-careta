-- Caretta Gazipaşa — database schema
-- Run in Supabase SQL Editor

-- News table
CREATE TABLE IF NOT EXISTS news (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('ecology', 'rescue', 'cleanup', 'coast', 'research')),
  title_ru text,
  title_tr text,
  title_en text,
  content_ru text,
  content_tr text,
  content_en text,
  excerpt_ru text,
  excerpt_tr text,
  excerpt_en text,
  image_url text,
  published boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pages table (static content)
CREATE TABLE IF NOT EXISTS pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL,
  section text NOT NULL,
  title_ru text,
  title_tr text,
  title_en text,
  content_ru text,
  content_tr text,
  content_en text,
  meta_title_ru text,
  meta_title_tr text,
  meta_title_en text,
  meta_description_ru text,
  meta_description_tr text,
  meta_description_en text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (section, slug)
);

-- Site settings
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value_ru text,
  value_tr text,
  value_en text,
  updated_at timestamptz DEFAULT now()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public can read published news and all pages/settings
CREATE POLICY "Public can read published news"
  ON news FOR SELECT
  USING (published = true);

CREATE POLICY "Public can read pages"
  ON pages FOR SELECT
  USING (true);

CREATE POLICY "Public can read settings"
  ON settings FOR SELECT
  USING (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Admins can manage news"
  ON news FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage pages"
  ON pages FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  USING (auth.role() = 'authenticated');

-- Seed initial pages
INSERT INTO pages (slug, section, title_ru, title_en, title_tr) VALUES
  ('found-turtle', 'what-you-can-do', 'Если вы нашли черепаху', 'If You Found a Turtle', 'Kaplumbağa Bulduysanız'),
  ('found-nest', 'what-you-can-do', 'Если вы нашли гнездо', 'If You Found a Nest', 'Yuva Bulduysanız'),
  ('someone-touching-nest', 'what-you-can-do', 'Если кто-то трогает гнездо', 'If Someone Is Touching a Nest', 'Birileri Yuvaya Dokunuyorsa'),
  ('beach-rules', 'what-you-can-do', 'Правила поведения на пляже', 'Beach Behavior Rules', 'Sahil Davranış Kuralları'),
  ('report-problem', 'what-you-can-do', 'Как сообщить о проблеме', 'How to Report a Problem', 'Sorun Nasıl Bildirilir'),
  ('info', 'volunteers', 'Информация для волонтеров', 'Volunteer Information', 'Gönüllü Bilgileri'),
  ('faq', 'volunteers', 'Часто задаваемые вопросы', 'FAQ', 'Sık Sorulan Sorular'),
  ('caretta-conservation', 'what-we-do', 'Сохранение Caretta caretta', 'Conservation of Caretta caretta', 'Caretta caretta Koruma'),
  ('sand-lily', 'what-we-do', 'Сохранение песчаных лилий', 'Sand Lily Conservation', 'Kum Zambağı Koruması'),
  ('publications', 'what-we-do', 'Научные публикации', 'Scientific Publications', 'Bilimsel Yayınlar'),
  ('hotels-coast', 'what-we-do', 'Отели и защита побережья', 'Hotels & Coastal Protection', 'Oteller ve Kıyı Koruma'),
  ('beach-cleanup', 'what-we-do', 'Очистка пляжей от пластика', 'Beach Plastic Cleanup', 'Sahil Plastik Temizliği')
ON CONFLICT (section, slug) DO NOTHING;

-- Seed initial settings
INSERT INTO settings (key, value_ru, value_en, value_tr) VALUES
  ('site_title', 'Caretta Gazipaşa', 'Caretta Gazipaşa', 'Caretta Gazipaşa'),
  ('hero_title', 'Защита Caretta caretta в Газипаше', 'Protecting Caretta caretta in Gazipaşa', 'Gazipaşa''da Caretta caretta Koruma'),
  ('hero_subtitle',
    'Мы ведём наблюдение за гнёздами морских черепах, защищаем прибрежные экосистемы',
    'We monitor sea turtle nests, protect coastal ecosystems and educate local communities',
    'Deniz kaplumbağası yuvalarını izliyor, kıyı ekosistemlerini koruyoruz'
  )
ON CONFLICT (key) DO NOTHING;
