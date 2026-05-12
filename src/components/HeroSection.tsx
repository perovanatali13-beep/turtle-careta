'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AlertTriangle, HelpCircle, Heart } from 'lucide-react';
// Caretta caretta — loggerhead sea turtle (local, Wikimedia Commons CC BY-SA)
const TURTLE_PHOTO = '/turtle.jpg';

export default function HeroSection() {
  const t = useTranslations('home');

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0a4a5a] via-[#0d7a8a] to-[#1a9aaa]"
        aria-hidden
      />

      {/* Turtle photo — right side, desktop only, ~40% width */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TURTLE_PHOTO}
          alt="Caretta caretta — loggerhead sea turtle"
          className="w-full h-full object-cover object-center"
          style={{ transform: 'scaleX(-1)' }}
        />
        {/* Smooth multi-stop gradient fade from left */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, #0d7a8a 0%, #0d7a8a 5%, rgba(13,122,138,0.85) 25%, rgba(13,122,138,0.4) 55%, rgba(13,122,138,0.05) 85%, transparent 100%)',
          }}
        />
      </div>

      {/* Mobile: photo as faint background */}
      <div className="absolute inset-0 lg:hidden overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TURTLE_PHOTO}
          alt=""
          className="w-full h-full object-cover object-center opacity-15"
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>

      {/* Decorative wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10" aria-hidden>
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 40 C360 80 720 0 1080 40 C1260 60 1380 50 1440 40 L1440 80 L0 80 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Content — left half */}
      <div className="container relative z-10 py-24">
        <div className="max-w-xl lg:max-w-[48%]">
          {/* Badge */}
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
