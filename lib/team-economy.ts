import { createServiceClient } from '@/lib/supabase/server';

export type EconomyEventCode =
  | 'pos1_capital'
  | 'pos2_transport'
  | 'pos3_transport'
  | 'pos4_transport'
  | 'pos5_transport';

const EVENTS: Record<
  EconomyEventCode,
  { amount: number; type: 'reward' | 'spend'; note: string; stationNumber: number }
> = {
  pos1_capital: {
    amount: 100_000,
    type: 'reward',
    note: 'Pos 1 — Uang modal awal',
    stationNumber: 1,
  },
  pos2_transport: {
    amount: 5_000,
    type: 'spend',
    note: 'Pos 2 — Transport cost',
    stationNumber: 2,
  },
  pos3_transport: {
    amount: 5_000,
    type: 'spend',
    note: 'Pos 3 — Transport cost',
    stationNumber: 3,
  },
  pos4_transport: {
    amount: 5_000,
    type: 'spend',
    note: 'Pos 4 — Transport cost',
    stationNumber: 4,
  },
  pos5_transport: {
    amount: 5_000,
    type: 'spend',
    note: 'Pos 5 — Transport cost',
    stationNumber: 5,
  },
};

const STATION_TO_EVENT: Record<number, EconomyEventCode | undefined> = {
  1: 'pos1_capital',
  2: 'pos2_transport',
  3: 'pos3_transport',
  4: 'pos4_transport',
  5: 'pos5_transport',
};

export async function applyEconomyEvent(
  teamId: string,
  eventCode: EconomyEventCode,
  actorUserId: string
): Promise<{ applied: boolean; amount?: number }> {
  const service = await createServiceClient();
  const spec = EVENTS[eventCode];

  const { data: existing } = await service
    .from('team_economy_events')
    .select('id')
    .eq('team_id', teamId)
    .eq('event_code', eventCode)
    .maybeSingle();

  if (existing) return { applied: false };

  const { data: team } = await service.from('teams').select('balance').eq('id', teamId).single();
  if (!team) return { applied: false };

  if (spec.type === 'spend' && team.balance < spec.amount) {
    throw new Error(`Saldo tidak cukup untuk ${spec.note} (${spec.amount} EC)`);
  }

  const { data: tx, error: txErr } =
    spec.type === 'reward'
      ? await service
          .from('transactions')
          .insert({
            from_user_id: actorUserId,
            to_team_id: teamId,
            amount: spec.amount,
            type: 'reward',
            note: spec.note,
          })
          .select('id')
          .single()
      : await service
          .from('transactions')
          .insert({
            from_user_id: actorUserId,
            from_team_id: teamId,
            to_team_id: teamId,
            amount: spec.amount,
            type: 'spend',
            note: spec.note,
          })
          .select('id')
          .single();

  if (txErr) throw new Error(txErr.message);

  const { error: evErr } = await service.from('team_economy_events').insert({
    team_id: teamId,
    event_code: eventCode,
    station_number: spec.stationNumber,
    amount: spec.type === 'reward' ? spec.amount : -spec.amount,
    note: spec.note,
    transaction_id: tx.id,
  });

  if (evErr) throw new Error(evErr.message);

  return { applied: true, amount: spec.amount };
}

export async function startTeamRaceIfNeeded(teamId: string): Promise<void> {
  const service = await createServiceClient();
  const { data: team } = await service
    .from('teams')
    .select('race_started_at')
    .eq('id', teamId)
    .single();

  if (team?.race_started_at) return;

  await service
    .from('teams')
    .update({ race_started_at: new Date().toISOString() })
    .eq('id', teamId);
}

export async function finishTeamRaceIfNeeded(teamId: string): Promise<void> {
  const service = await createServiceClient();
  const { data: team } = await service
    .from('teams')
    .select('race_finished_at')
    .eq('id', teamId)
    .single();

  if (team?.race_finished_at) return;

  await service
    .from('teams')
    .update({ race_finished_at: new Date().toISOString() })
    .eq('id', teamId);
}

/** Called after a new check-in (not alreadyHere). */
export async function onStationCheckIn(params: {
  teamId: string;
  stationNumber: number;
  userId: string;
}): Promise<void> {
  if (params.stationNumber === 1) {
    await startTeamRaceIfNeeded(params.teamId);
  }

  const code = STATION_TO_EVENT[params.stationNumber];
  if (code) {
    await applyEconomyEvent(params.teamId, code, params.userId);
  }

  if (params.stationNumber === 7) {
    await finishTeamRaceIfNeeded(params.teamId);
  }
}
