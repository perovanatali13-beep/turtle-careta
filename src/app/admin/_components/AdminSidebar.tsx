'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Newspaper, FileText, Image, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/news', label: 'Новости', icon: Newspaper },
  { href: '/admin/pages', label: 'Страницы', icon: FileText },
  { href: '/admin/media', label: 'Медиа', icon: Image },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="w-56 bg-white border-r border-[var(--color-border)] flex flex-col min-h-screen shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs">
            CC
          </div>
          <div className="text-sm font-semibold text-[var(--color-text)]">Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:bg-gray-50 hover:text-[var(--color-text)]'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
