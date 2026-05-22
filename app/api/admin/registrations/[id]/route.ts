import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import {
  deleteEventRegistration,
  updateEventRegistration,
} from '@/lib/admin-registrations';
import type { EventRegistrationInput } from '@/lib/types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const body = (await request.json()) as EventRegistrationInput;

  try {
    const registration = await updateEventRegistration(id, body);
    return NextResponse.json({ ok: true, registration });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not update registration' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { id } = await params;

  try {
    await deleteEventRegistration(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not delete registration' },
      { status: 400 }
    );
  }
}
