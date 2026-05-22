# Station QR check-in / movement tracking

## Flow

1. **Crew** opens `/crew/station` — shows the **station QR** (print or display on a tablet).
2. **Any team member** scans that QR at `/missions/scan` (or home → Scan station).
3. System records **check-in** timestamp; team is **eligible to submit** at that Pos (CEO only).
4. When the team scans the **next** station QR, the previous visit is **auto checked-out**.
5. **Crew** taps **CHECK OUT** when the team physically leaves (manual confirmation).

## Crew tools

| Page | Purpose |
|------|---------|
| `/crew/station` | Station QR + list of teams currently here + checkout |
| `/crew/tracking` | All teams — who is at which Pos, left previous Pos X min ago |
| `/crew/map` | Map pins from active check-ins (fallback: GPS pings) |

## Database

Run `supabase/migrations/008_station_visits.sql` in Supabase SQL Editor.

## QR payload format

```json
{ "type": "station", "token": "st1_abc123", "stationId": "uuid" }
```

Each row in `stations` gets a unique `checkin_token` when the migration runs.
