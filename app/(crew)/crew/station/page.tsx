import Link from 'next/link';
import { requireCrewMember } from '@/lib/auth';
import { getCrewAssignment } from '@/lib/crew-assignment';
import { createClient } from '@/lib/supabase/server';
import { StationDeskPanel } from '@/components/crew/StationDeskPanel';
import { Card } from '@/components/ui/card';

export default async function CrewStationPage() {
  const { user } = await requireCrewMember();
  const assignment = await getCrewAssignment(user.id);
  const supabase = await createClient();

  const { data: stations } = await supabase
    .from('stations')
    .select('id, number, name, checkin_token, is_active')
    .order('number');

  const assignedStationId =
    assignment?.assignment_kind === 'station' ? assignment.station_id : null;

  const myStation = assignedStationId
    ? stations?.find((s) => s.id === assignedStationId)
    : null;

  return (
    <main className="space-y-4 p-4 text-on-bg-readable">
      <Link href="/crew" className="font-display text-xs text-accent-green">
        ← CREW
      </Link>
      <h1 className="font-display text-lg">STATION DESK</h1>
      <p className="font-body text-xs text-text-on-bg-muted">
        Display the QR at your post. Teams auto check-in when they scan. Check them out when they
        leave.
      </p>

      {myStation?.checkin_token ? (
        <StationDeskPanel
          stationId={myStation.id}
          stationNumber={myStation.number}
          stationName={myStation.name}
          checkinToken={myStation.checkin_token}
        />
      ) : (
        <div className="space-y-4">
          <Card>
            <p className="font-body text-sm text-text-on-surface">
              {assignment?.assignment_kind === 'station'
                ? 'Your station is not configured yet. Ask admin.'
                : 'Select a station to manage (roaming / general crew).'}
            </p>
          </Card>
          {stations?.map((s) =>
            s.checkin_token ? (
              <div key={s.id}>
                <StationDeskPanel
                  stationId={s.id}
                  stationNumber={s.number}
                  stationName={s.name}
                  checkinToken={s.checkin_token}
                />
              </div>
            ) : null
          )}
        </div>
      )}
    </main>
  );
}
