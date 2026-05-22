import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import {
  createEventRegistration,
  listEventRegistrations,
} from '@/lib/admin-registrations';
import type { EventRegistrationInput } from '@/lib/types';

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? undefined;

  try {
    const registrations = await listEventRegistrations(search);
    return NextResponse.json({ registrations });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const body = (await request.json()) as EventRegistrationInput;

  try {
    const registration = await createEventRegistration(body);
    return NextResponse.json({ ok: true, registration });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not create registration' },
      { status: 400 }
    );
  }
}
