import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function requireAdminApi() {
  const { user, profile } = await requireAuth();
  if (profile.app_role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    } as const;
  }
  return { user, profile } as const;
}
