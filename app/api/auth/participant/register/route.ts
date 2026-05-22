import { NextResponse } from 'next/server';
import { registerParticipant } from '@/lib/participant-auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      full_name?: string;
      student_id?: string;
      phone?: string;
    };

    await registerParticipant({
      full_name: body.full_name ?? '',
      student_id: body.student_id ?? '',
      phone: body.phone ?? '',
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
