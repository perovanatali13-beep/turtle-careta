'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('home');

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Фото черепахи — полный фон */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/turtle-orig.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Цвет hero поверх фото */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(11, 103, 120, 0.78)' }}
        aria-hidden
      />

      {/* Затемнение */}
      <div className="absolute inset-0 bg-black/30" aria-hidden />

      {/* Контент */}
      <div className="container relative z-10 py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Gazipaşa, Antalya · Türkiye
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-10 leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <Link
            href="/what-we-do/caretta-conservation"
            className="inline-flex items-center gap-2 bg-white text-[var(--color-primary-dark)] font-semibold px-7 py-3.5 rounded-xl hover:bg-[var(--color-sand)] transition-colors shadow-lg text-base"
          >
            {t('learnMore')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
