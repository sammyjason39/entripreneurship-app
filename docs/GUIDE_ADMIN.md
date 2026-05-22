# Admin / jury guide

For the event lead and jury using the **Jury dashboard** at `/admin`.

**Login:** https://entripreneurship.fun/auth/login → **CREW / ADMIN LOGIN** → `admin@entripreneurship.fun` / `EntripAdmin2026!` (change after event — see [CREW_LOGINS.md](./CREW_LOGINS.md)).

**Create/reset all staff accounts:**

```bash
npm run db:seed-crew
```

---

## What admin is for

| Function | Where |
|----------|--------|
| Event overview (teams, pending subs, points) | `/admin` |
| **Approve/reject** station submissions | `/crew/submissions` (admin-only layout) |
| **Manage crew** emails, roles, station assignments | `/admin/crew` |
| **Participant roster** (form list, add/edit, WhatsApp) | `/admin/participants` |
| Optional: same map/tracking as crew | Links from dashboard or `/crew/*` when logged in as admin |

Admin is **not** the primary UI for paying EnCoins at the bank desk — crew use `/crew/pay`.

---

## First-time setup (technical)

Run SQL migrations in order in Supabase SQL Editor:

1. `001_initial_schema.sql` — core tables, 7 stations, seed content  
2. `004_admin_crew_assignments.sql` — crew assignments, admin RLS  
3. `005_whatsapp_login.sql` — `event_registrations`, WhatsApp challenges  
4. `006_admin_registrations_rls.sql` — admin CRUD on roster  
5. `007_spend_balance_trigger.sql` — deduct reduces balance  
6. `008_station_visits.sql` — station QR tokens, visits  
7. `009_content_metadata.sql` — structured booklet content  
8. `010_transactions_insert_rls.sql` — crew pay, transfers, QR EnCoin inserts  

Then:

```bash
npm run db:import-registrations   # CSV → event_registrations
npm run db:seed-crew                # admin + crew accounts
npm run db:seed-content             # optional: sync booklet to DB
```

Promote a user to admin manually if needed:

```sql
UPDATE profiles SET app_role = 'admin' WHERE id = '<user-uuid>';
```

---

## Jury dashboard (`/admin`)

**Cards:**

- **Teams** — count of teams created in app  
- **Participants** — count of `team_members`  
- **Pending review** — submissions awaiting action  
- **Crew on roster** — seeded crew accounts  
- **Points distributed** — sum of `reward` transactions  
- **Form registrations** — total / how many linked to a login  

**Actions:**

- **Review submissions** → `/crew/submissions`  
- **Manage crew** → `/admin/crew`  
- **Participants** → `/admin/participants`  

**Pending list** — quick view of latest pending items with team + Pos number.

---

## Submission review

Path: **/crew/submissions** (requires **admin** session)

**Mechanism:**

1. CEO submits → row in `submissions` with `status: pending`, `form_data`, optional `image_url` in Storage bucket `submissions`.
2. Reviewer opens submission → **Approve** or **Reject** (with note).
3. **Approve** → `status: approved`, `reviewed_by` set, automatic `reward` transaction for `stations.point_reward` (e.g. 100 EC, Pos 7 = 150).
4. **Reject** → CEO sees note on mission page and can resubmit.

Uses `POST /api/submissions/review` (crew or admin role in API; UI is admin-only).

**Realtime:** page subscribes to `submissions` changes for live updates.

Filter: pending / approved / rejected / all.

---

## Manage crew (`/admin/crew`)

**Mechanism:** `crew_assignments` table links `user_id` → assignment kind + optional `station_id`.

| Kind | Typical account |
|------|-----------------|
| `bank` | bank@ |
| `jury` | jury@ |
| `registration` | registration@ |
| `roaming` | roaming@ |
| `station` | station1@ … station7@ |
| `general` | admin@ |

**Admin can:**

- Create crew user (email, name, password, assignment)
- Update assignment label / station
- List all crew with assignments

API: `/api/admin/crew`, `/api/admin/crew/[userId]`.

Crew users get `app_role = 'crew'` and `onboarding_complete = true` from seed script.

---

## Participants (`/admin/participants`)

**Mechanism:** `event_registrations` holds pre-event form data (WhatsApp normalized to `628…`).

**Admin can:**

- View/search roster  
- Add new participant (name, WhatsApp, optional student fields)  
- Edit/delete entries  
- See **linked** vs not yet logged in (`user_id` set when WhatsApp login succeeds)

API: `/api/admin/registrations`, `/api/admin/registrations/[id]`.

**Import bulk:**

```bash
npm run db:import-registrations
```

Uses `data/registrations.csv`.

WhatsApp flow: [WHATSAPP_LOGIN.md](./WHATSAPP_LOGIN.md).

---

## Content (case studies & innovation cards)

Booklet text lives in **`lib/event-content.ts`** (always available in app).

Optional DB sync:

```bash
npm run db:seed-content
```

Requires migration `009`.

| Type | Station | Companies |
|------|---------|-----------|
| `case_study` | Pos 1 | Tesla, Netflix, OpenAI, Uniqlo, RON88 |
| `innovation_card` | Pos 3 | Same five |

Participants see these on mission pages 1 & 3 and under **Learn**.

---

## Role routing (security model)

| `profiles.app_role` | After login |
|---------------------|-------------|
| `participant` | `/home` (after onboarding) |
| `crew` | `/crew` |
| `admin` | `/admin` |

Middleware sends unauthenticated users to `/auth/login`.

Crew **cannot** call admin registration APIs (smoke-tested: 401/403).

Admin visiting `/crew` is redirected to `/admin` by `requireCrewMember`.

---

## EnCoins oversight

- **Distribution:** approval rewards + manual crew rewards at bank  
- **Deduction:** crew deduct page (`spend` type)  
- **Transfers:** participant scan QR (peer-to-peer sessions)  

Team balance is authoritative on `teams.balance`; transactions are the audit log.

---

## Monitoring during the event

| Check | How |
|-------|-----|
| Stuck logins | Participants table — WhatsApp linked? |
| Queue at Pos | Crew tracking + station active list |
| Pending backlog | Admin dashboard count → submissions page |
| Points economy | Dashboard “points distributed” + leaderboard |

```bash
npm run verify:supabase
```

---

## Admin day-of checklist

- [ ] Migrations 001–009 applied  
- [ ] Registrations imported or maintained in admin UI  
- [ ] `npm run db:seed-crew` run; passwords communicated securely  
- [ ] WhatsApp webhook + API key tested ([WHATSAPP_LOGIN.md](./WHATSAPP_LOGIN.md))  
- [ ] Storage bucket `submissions` exists (public read for images)  
- [ ] One test team: login → Pos 1 check-in → submit → approve → balance increases  
- [ ] Station QRs printed or on tablets ([STATION_QR.md](./STATION_QR.md))  
- [ ] Change default passwords after event if repo is shared  

---

## Troubleshooting

| Issue | Action |
|-------|--------|
| Cannot access `/admin` | Set `app_role = 'admin'` on your profile |
| Submissions page 403 | Must be logged in as admin, not station@ crew |
| Approve but no coins | Check `stations.point_reward` and transactions RLS |
| Registration API 403 | User is not admin |
| Crew cannot review | Expected — use admin account for review UI |
| WhatsApp login fails | Roster phone format, webhook key, n8n workflow |

---

## Related docs

- [README.md](./README.md) — doc index  
- [TESTING.md](./TESTING.md) — automated verification  
- [CREW_LOGINS.md](./CREW_LOGINS.md) — account table  
- [GUIDE_PARTICIPANT.md](./GUIDE_PARTICIPANT.md) — student-facing flows  
- [GUIDE_CREW.md](./GUIDE_CREW.md) — field staff flows  
