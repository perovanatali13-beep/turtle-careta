'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import { Search, Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import UserButton from '@/components/UserButton';

interface DropdownItem {
  key: string;
  href: string;
  disabled?: boolean;
}

interface NavItem {
  key: string;
  href?: string;
  dropdown?: DropdownItem[];
}

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const headerRef = useRef<HTMLElement>(null);

  const navItems: NavItem[] = [
    {
      key: 'whatYouCanDo',
      dropdown: [
        { key: 'foundTurtle', href: '/what-you-can-do/found-turtle' },
        { key: 'foundNest', href: '/what-you-can-do/found-nest' },
        { key: 'someoneTouchingNest', href: '/what-you-can-do/someone-touching-nest' },
        { key: 'beachRules', href: '/what-you-can-do/beach-rules' },
        { key: 'reportProblem', href: '/what-you-can-do/report-problem' },
      ],
    },
    {
      key: 'volunteers',
      dropdown: [
        { key: 'volunteerInfo', href: '/volunteers/info' },
        { key: 'faq', href: '/volunteers/faq' },
      ],
    },
    {
      key: 'whatWeDo',
      dropdown: [
        { key: 'carettaConservation', href: '/what-we-do/caretta-conservation' },
        { key: 'sandLily', href: '/what-we-do/sand-lily' },
        { key: 'publications', href: '/what-we-do/publications' },
        { key: 'hotelsCoast', href: '/what-we-do/hotels-coast' },
        { key: 'beachCleanup', href: '/what-we-do/beach-cleanup' },
      ],
    },
    {
      key: 'about',
      dropdown: [
        { key: 'whoWeAre', href: '/about/who-we-are' },
        { key: 'supporters', href: '/about/supporters' },
      ],
    },
    {
      key: 'news',
      dropdown: [
        { key: 'allNews', href: '/news' },
        { key: 'ecoActions', href: '/news/ecology' },
        { key: 'turtleRescue', href: '/news/rescue' },
        { key: 'cleanups', href: '/news/cleanup' },
        { key: 'coastNews', href: '/news/coast' },
        { key: 'research', href: '/news/research' },
      ],
    },
  ];

  const languages = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
    { code: 'tr', label: 'Türkçe' },
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setLangOpen(false);
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
    setLangOpen(false);
  }

  return (
    <header
      ref={headerRef}
      className="bg-white border-b border-[var(--color-border)] sticky top-0 z-50 shadow-sm"
    >
      <div className="container">
        <div className="flex items-center h-28 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo-header.png" alt="Caretta Gazipaşa" width={200} height={200} priority unoptimized className="h-[100px] w-auto" />
            <div className="hidden sm:block">
              <div className="font-bold text-[var(--color-primary)] text-sm leading-tight">
                Caretta
              </div>
              <div className="text-[var(--color-text-muted)] text-xs leading-tight">
                Gazipaşa
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const firstHref = item.dropdown?.find(s => !s.disabled)?.href ?? '/';
              return (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.key)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={firstHref}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                      ${openDropdown === item.key
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                        : 'text-[var(--color-text)] hover:bg-gray-100'
                      }`}
                  >
                    {t(item.key as Parameters<typeof t>[0])}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${openDropdown === item.key ? 'rotate-180' : ''}`}
                    />
                  </Link>

                  {openDropdown === item.key && item.dropdown && (
                    <div className="absolute top-full left-0 bg-white border border-[var(--color-border)] rounded-lg shadow-lg py-1 min-w-56 z-50">
                      {item.dropdown.map((sub) => (
                        sub.disabled ? (
                          <span
                            key={sub.key}
                            className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                          >
                            {t(sub.key as Parameters<typeof t>[0])}
                          </span>
                        ) : (
                          <Link
                            key={sub.key}
                            href={sub.href}
                            className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
                          >
                            {t(sub.key as Parameters<typeof t>[0])}
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск..."
                  className="border border-[var(--color-border)] rounded-md px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary)] w-48"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            )}

                      <UserButton />
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors text-sm font-medium"
              >
                <Globe size={16} />
                <span className="hidden sm:inline uppercase">{locale}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg py-1 min-w-36 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLocale(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors
                        ${locale === lang.code
                          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium'
                          : 'text-[var(--color-text)] hover:bg-gray-50'
                        }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--color-border)] bg-white max-h-[80vh] overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.key}>
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === item.key ? null : item.key)
                }
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50"
              >
                {t(item.key as Parameters<typeof t>[0])}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${openDropdown === item.key ? 'rotate-180' : ''}`}
                />
              </button>
              {openDropdown === item.key && item.dropdown && (
                <div className="bg-gray-50 border-t border-[var(--color-border)]">
                  {item.dropdown.map((sub) =>
                    sub.disabled ? (
                      <span
                        key={sub.key}
                        className="block px-8 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                      >
                        {t(sub.key as Parameters<typeof t>[0])}
                      </span>
                    ) : (
                      <Link
                        key={sub.key}
                        href={sub.href}
                        className="block px-8 py-2.5 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)]"
                      >
                        {t(sub.key as Parameters<typeof t>[0])}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
