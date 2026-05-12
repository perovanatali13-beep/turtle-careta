# turtle-careta — Сайт о черепахах Caretta caretta

Сайт-аналог archelon.gr про морских черепах карета (Caretta caretta) в районе Газипаши (Турция).

## Стек

- **Next.js 15** — App Router, TypeScript
- **Tailwind CSS** — стили
- **next-intl** — i18n (ru, tr, en), маршруты вида `/ru/...`, `/tr/...`, `/en/...`
- **Supabase** — база данных (content), аутентификация для админки
- **Supabase Storage** — медиафайлы (фото, видео)
- **Lucide React** — иконки

## Языки

`ru` (русский) | `tr` (türkçe) | `en` (english)

Контент на 3 языках хранится в Supabase. Каждая таблица содержит поля `title_ru`, `title_tr`, `title_en`, `content_ru`, `content_tr`, `content_en`.

## Структура маршрутов

```
/[locale]/                          → Главная страница
/[locale]/what-you-can-do/
  found-turtle                      → Если вы нашли черепаху
  found-nest                        → Если вы нашли гнездо
  someone-touching-nest             → Если кто-то трогает гнездо
  beach-rules                       → Правила поведения на пляже
  report-problem                    → Как сообщить о проблеме
  support                           → Поддержать проект (позже)
/[locale]/volunteers/
  info                              → Информация для волонтеров
  faq                               → FAQ
/[locale]/what-we-do/
  caretta-conservation              → Сохранение Caretta caretta
  sand-lily-conservation            → Сохранение песчаных лилий
  publications                      → Научные публикации
  hotels-coast                      → Отели и защита побережья
  beach-cleanup                     → Очистка пляжей
/[locale]/news/
  (category)/[slug]                 → Отдельная новость
/[locale]/search?q=...              → Поиск
/admin/                             → Админка (protected)
```

## Supabase таблицы

- `pages` — статические страницы (slug, title_*, content_*, meta_*)
- `news` — новости (slug, category, title_*, content_*, image, published_at, published)
- `settings` — глобальные настройки сайта
- `media` — загруженные файлы

## Поиск

Full-text search через Supabase (PostgreSQL `to_tsvector`). Поиск по таблицам `pages` и `news`.

## Главная страница (Hero)

- Большое фото/видео черепахи или побережья
- Короткий текст о проекте (из базы, multilingual)
- CTA кнопки: "Что делать если увидел гнездо", "Если кто-то трогает гнездо", "Поддержать проект" (задизаблена)
- Блок последних новостей (авто, все категории)

## Категории новостей

- `ecology` — Экологические акции
- `rescue` — Спасение черепах
- `cleanup` — Уборки пляжей
- `coast` — Новости по защите побережья
- `research` — Исследования и публикации

## Админка

- Аутентификация через Supabase Auth (email/password)
- CRUD для новостей (с rich-text редактором)
- CRUD для страниц
- Загрузка медиа в Supabase Storage
- Управление SEO-метаданными

## Мобильная версия

Hamburger-меню, адаптивная сетка, touch-friendly элементы.

## Переменные окружения

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

## Команды

```bash
npm run dev       # localhost:3000
npm run build
npm run lint
```
