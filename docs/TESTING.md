# Testing & verification

Documentation in this repo was written **after** running automated smoke tests against a local dev server and Supabase.

## Commands

| Command | What it validates |
|---------|-------------------|
| `npm run test:e2e` | Public pages, health API, full **participant** path: signup → PIN → create team → onboarding → verify PIN → QR session |
| `npm run test:smoke-docs` | Content model, auth redirects, participant + **crew login** + **admin APIs** + role separation |
| `npm run verify:supabase` | Tables seeded (stations, content, etc.) |
| `npm run build` | TypeScript + Next.js production build |

**Prerequisite:** `npm run dev` (usually port 3000; if busy, Next uses **3001** — smoke tests auto-detect both) and `.env.local` with Supabase keys.

## Latest smoke run (local)

**E2E (`test:e2e`):** 14/14 passed — participant onboarding and bank QR session creation.

**Docs smoke (`test:smoke-docs`):** 23/24 passed.

| Check | Result |
|-------|--------|
| 5 companies × case study + innovation card | ✓ |
| `/learn` requires login (307) | ✓ |
| Participant create team, CEO role, QR session | ✓ |
| Stations Pos 1 and Pos 3 exist | ✓ |
| `bank@` crew login + `app_role = crew` | ✓ |
| `admin@` login + registrations + crew APIs | ✓ |
| `registration@` blocked from admin API | ✓ |
| Crew reward API | ✓ (uses crew PIN `888888` after `POST /api/onboarding/pin` or `db:seed-crew`) |

If `GET /auth/login` returns **500**, the dev server is still compiling — re-run after `npm run dev` is ready, or the smoke script will retry automatically.

### Manual checks recommended

These are not fully automated but should be done once on a real phone:

1. **WhatsApp login** — number on roster → send code to bot → land on onboarding.
2. **Theme toggle** — Profile → light/dark for outdoor readability.
3. **Station QR** — Crew displays QR; participant scans → check-in → CEO submits.
4. **Learn materials** — Pos 1 case study + Pos 3 innovation card for same company (e.g. Tesla).
5. **Crew pay** — Scan participant “Show my QR”; crew enters **crew PIN** (must be set on profile; see crew guide).
6. **Admin** — Approve a pending submission → team balance increases by station `point_reward`.

## Mimicking a participant (manual script)

1. Open `/auth/login` on a phone (or DevTools mobile viewport).
2. Enter a WhatsApp number that exists in `event_registrations` (or add one in Admin → Participants).
3. Complete WhatsApp confirmation (or use n8n webhook in staging).
4. Onboarding: set 6-digit **transaction PIN** → create team (you become **CEO**) or join with code + role.
5. **Home** — balance, quick actions.
6. **Missions** → open Pos 1 → read case study → scan station QR → CEO submits summary.
7. **Learn** — optional deep read of all five companies.
8. **Bank** — Show My QR for crew; Scan QR to pay another team (enter your PIN).

## Mimicking crew

1. Login → expand **CREW / ADMIN LOGIN** → `bank@entripreneurship.fun` / `EntripCrew2026!` (see [CREW_LOGINS.md](./CREW_LOGINS.md)).
2. Land on `/crew` — open Pay, Station QR, Tracking, Map.
3. Do **not** expect `/admin` or `/crew/submissions` (admin-only).

## Mimicking admin

1. Login → `admin@entripreneurship.fun` / `EntripAdmin2026!`.
2. Land on `/admin` — stats, links to review submissions, manage crew, participants.
3. Open **Review submissions** → `/crew/submissions` (admin-gated UI).
