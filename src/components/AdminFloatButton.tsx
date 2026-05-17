'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const ADMIN_EMAILS = ['perova.natali13@gmail.com', 'allsterlitamak@gmail.com'];

export default function AdminFloatButton() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(ADMIN_EMAILS.includes((user?.email ?? '').toLowerCase()));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(ADMIN_EMAILS.includes((session?.user?.email ?? '').toLowerCase()));
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isAdmin) return null;

  return (
    <a
      href="/admin"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg hover:bg-[var(--color-primary-dark)] transition-all hover:scale-105 active:scale-95"
    >
      <Settings size={15} />
      Админка
    </a>
  );
}
