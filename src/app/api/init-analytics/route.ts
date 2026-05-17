import { NextRequest, NextResponse } from 'next/server';

// One-time setup endpoint: GET /api/init-analytics?secret=SUPABASE_SERVICE_ROLE_KEY
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sql = `
    CREATE TABLE IF NOT EXISTS page_views (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      page_path TEXT NOT NULL,
      session_id TEXT,
      country TEXT,
      city TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views(created_at);
    CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views(page_path);
    CREATE INDEX IF NOT EXISTS idx_pv_session ON page_views(session_id);
  `;

  // Use Supabase's pg connection via the REST API pg-meta proxy
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/pg-meta/v1/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const text = await res.text();
  return NextResponse.json({ status: res.status, body: text });
}
