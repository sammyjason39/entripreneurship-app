import { NextResponse } from 'next/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  if (auth.profile.app_role !== 'crew' && auth.profile.app_role !== 'admin') {
    return NextResponse.json({ error: 'Crew only' }, { status: 403 });
  }

  const body = (await request.json()) as {
    team_id?: string;
    action?: 'start' | 'stop';
    run_id?: string;
  };

  const teamId = body.team_id?.trim();
  const action = body.action;

  if (!teamId || (action !== 'start' && action !== 'stop')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const service = await createServiceClient();

  if (action === 'start') {
    const { data: active } = await service
      .from('team_compete_runs')
      .select('id')
      .eq('team_id', teamId)
      .eq('station_number', 6)
      .is('ended_at', null)
      .maybeSingle();

    if (active) {
      return NextResponse.json({ error: 'Timer already running for this team', run_id: active.id }, { status: 400 });
    }

    const { data: run, error } = await service
      .from('team_compete_runs')
      .insert({
        team_id: teamId,
        station_number: 6,
        started_by: auth.userId,
      })
      .select('id, team_id, started_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, run });
  }

  const runId = body.run_id?.trim();
  if (!runId) {
    return NextResponse.json({ error: 'run_id required to stop' }, { status: 400 });
  }

  const { data: run } = await service
    .from('team_compete_runs')
    .select('id, team_id, started_at, ended_at')
    .eq('id', runId)
    .eq('team_id', teamId)
    .single();

  if (!run || run.ended_at) {
    return NextResponse.json({ error: 'Run not found or already stopped' }, { status: 404 });
  }

  const endedAt = new Date();
  const elapsedMs = endedAt.getTime() - new Date(run.started_at).getTime();

  const { data: updated, error } = await service
    .from('team_compete_runs')
    .update({
      ended_at: endedAt.toISOString(),
      elapsed_ms: elapsedMs,
      ended_by: auth.userId,
    })
    .eq('id', runId)
    .select('id, team_id, started_at, ended_at, elapsed_ms')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, run: updated });
}

export async function GET(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  if (auth.profile.app_role !== 'crew' && auth.profile.app_role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const teamId = new URL(request.url).searchParams.get('teamId');
  if (!teamId) {
    return NextResponse.json({ error: 'teamId required' }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data: active } = await service
    .from('team_compete_runs')
    .select('id, team_id, started_at')
    .eq('team_id', teamId)
    .eq('station_number', 6)
    .is('ended_at', null)
    .maybeSingle();

  const { data: history } = await service
    .from('team_compete_runs')
    .select('id, started_at, ended_at, elapsed_ms')
    .eq('team_id', teamId)
    .eq('station_number', 6)
    .not('ended_at', 'is', null)
    .order('ended_at', { ascending: false })
    .limit(5);

  return NextResponse.json({ active, history: history ?? [] });
}
