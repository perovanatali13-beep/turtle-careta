import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Mail, MapPin, Share2, Camera } from 'lucide-react';

export default async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="bg-[var(--color-text)] text-white mt-auto" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
                CC
              </div>
              <div>
                <div className="font-bold text-white">Caretta Gazipaşa</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-primary)] transition-colors"
                aria-label="Facebook"
              >
                <Share2 size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-primary)] transition-colors"
                aria-label="Instagram"
              >
                <Camera size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
              {t('nav.news')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/news" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('nav.allNews')}
                </Link>
              </li>
              <li>
                <Link href="/news/ecology" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('nav.ecoActions')}
                </Link>
              </li>
              <li>
                <Link href="/news/rescue" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('nav.turtleRescue')}
                </Link>
              </li>
              <li>
                <Link href="/news/cleanup" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('nav.cleanups')}
                </Link>
              </li>
              <li>
                <Link href="/news/research" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('nav.research')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
              {t('footer.contacts')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                <span>Gazipaşa, Antalya, Türkiye</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail size={16} className="shrink-0 text-[var(--color-primary)]" />
                <a href="mailto:info@caretta-gazipasa.org" className="hover:text-white transition-colors">
                  info@caretta-gazipasa.org
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-4">
          <p className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Caretta Gazipaşa. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
