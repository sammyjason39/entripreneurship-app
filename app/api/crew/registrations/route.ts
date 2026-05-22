import { NextResponse } from 'next/server';
import { requireRegistrationCrewApi } from '@/lib/crew-registration-auth';
import { createEventRegistration } from '@/lib/admin-registrations';
import type { EventRegistrationInput } from '@/lib/types';

export async function POST(request: Request) {
  const auth = await requireRegistrationCrewApi();
  if ('error' in auth) return auth.error;

  const body = (await request.json()) as EventRegistrationInput;

  try {
    const registration = await createEventRegistration(body);
    return NextResponse.json({ ok: true, registration });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not register participant' },
      { status: 400 }
    );
  }
}
