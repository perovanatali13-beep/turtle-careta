export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import AdminSidebar from '../_components/AdminSidebar';
import InviteButton from './_components/InviteButton';
import DeleteUserButton from './_components/DeleteUserButton';
import type { User } from '@supabase/supabase-js';

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { users }, error } = await adminSupabase.auth.admin.listUsers();
  const list: User[] = error ? [] : users;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Пользователи</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{list.length} аккаунтов в системе</p>
          </div>
          <InviteButton />
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Пользователь</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Роль</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Зарегистрирован</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Последний вход</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Статус</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((u) => {
                const isCurrentUser = u.id === user.id;
                const isSuperAdmin = u.email === 'perova.natali13@gmail.com';
                return (
                  <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center text-xs font-bold shrink-0">
                          {initials(u.email ?? '?')}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--color-text)]">{u.email}</div>
                          {isCurrentUser && (
                            <div className="text-xs text-[var(--color-primary)]">Это вы</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isSuperAdmin
                          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isSuperAdmin ? 'Администратор' : 'Редактор'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {formatDate(u.last_sign_in_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        u.email_confirmed_at ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.email_confirmed_at ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        {u.email_confirmed_at ? 'Активен' : 'Ожидает подтверждения'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isCurrentUser && !isSuperAdmin && (
                        <DeleteUserButton userId={u.id} email={u.email ?? ''} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
