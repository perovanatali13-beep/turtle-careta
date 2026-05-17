'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function inviteUser(email: string): Promise<{ error?: string }> {
  const { error } = await adminClient().auth.admin.inviteUserByEmail(email);
  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return {};
}

export async function deleteUser(userId: string): Promise<void> {
  await adminClient().auth.admin.deleteUser(userId);
  revalidatePath('/admin/users');
}
