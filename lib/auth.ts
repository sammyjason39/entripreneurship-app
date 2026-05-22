import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';
import { redirect } from 'next/navigation';

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data as Profile | null;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) redirect('/auth/login');
  const profile = await getProfile(user.id);
  if (!profile) redirect('/auth/login');
  return { user, profile };
}

export async function requireParticipant() {
  const { user, profile } = await requireAuth();
  if (profile.app_role === 'crew') redirect('/crew');
  if (!profile.onboarding_complete) redirect('/onboarding');
  return { user, profile };
}

export async function requireCrew() {
  const { user, profile } = await requireAuth();
  if (profile.app_role !== 'crew' && profile.app_role !== 'admin') {
    redirect('/home');
  }
  return { user, profile };
}

export async function getUserTeamId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.team_id ?? null;
}
