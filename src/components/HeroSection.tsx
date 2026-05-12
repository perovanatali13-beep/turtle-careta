'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AlertTriangle, HelpCircle, Heart } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('home');

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0a4a5a] via-[#0d7a8a] to-[#1a9aaa]"
        aria-hidden
      />

      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden>
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 40 C360 80 720 0 1080 40 C1260 60 1380 50 1440 40 L1440 80 L0 80 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Overlay pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 60%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 30%, rgba(255,255,255,0.2) 0%, transparent 40%)',
        }}
        aria-hidden
      />

      <div className="container relative z-10 py-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Gazipaşa, Antalya · Türkiye
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/what-you-can-do/found-nest"
              className="flex items-center gap-2 bg-white text-[var(--color-primary-dark)] font-semibold px-6 py-3 rounded-xl hover:bg-[var(--color-sand)] transition-colors shadow-lg"
            >
              <HelpCircle size={18} />
              {t('foundNestBtn')}
            </Link>
            <Link
              href="/what-you-can-do/someone-touching-nest"
              className="flex items-center gap-2 bg-[var(--color-accent)] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[var(--color-accent-dark)] transition-colors shadow-lg"
            >
              <AlertTriangle size={18} />
              {t('touchingNestBtn')}
            </Link>
            <button
              disabled
              className="flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl cursor-not-allowed opacity-60"
              title="Coming soon"
            >
              <Heart size={18} />
              {t('supportBtn')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
