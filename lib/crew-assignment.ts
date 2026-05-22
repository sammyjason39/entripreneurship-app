import { createClient } from '@/lib/supabase/server';
import type { CrewAssignment } from '@/lib/types';

export async function getCrewAssignment(userId: string): Promise<CrewAssignment | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('crew_assignments')
    .select('*, stations(id, number, name)')
    .eq('user_id', userId)
    .maybeSingle();
  return data as CrewAssignment | null;
}
