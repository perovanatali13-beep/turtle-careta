'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getSessionId(): string {
  const key = 'cg_sid';
  try {
    let sid = sessionStorage.getItem(key);
    if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem(key, sid); }
    return sid;
  } catch { return 'anon'; }
}

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const sid = getSessionId();
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, session_id: sid }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
