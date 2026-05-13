import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '../_components/AdminSidebar';
import PagesNav from './_components/PagesNav';
import type { PageContent } from '@/lib/supabase/types';

export default async function PagesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .order('section')
    .order('slug');

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 overflow-hidden">
        <PagesNav pages={(pages ?? []) as PageContent[]} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
