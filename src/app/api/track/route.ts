import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { path, session_id } = await req.json();
    if (!path || !session_id) return NextResponse.json({ ok: false });

    const country = req.headers.get('x-vercel-ip-country') ?? null;
    const rawCity = req.headers.get('x-vercel-ip-city');
    const city = rawCity ? decodeURIComponent(rawCity) : null;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('page_views').insert({ page_path: path, session_id, country, city });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
