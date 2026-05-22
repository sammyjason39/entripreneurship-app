# Crew guide

For event staff: station judges, bank desk, registration, roaming crew, and MC/jury helpers using the **crew phone UI** at `/crew`.

**Not for:** Full jury console → use [GUIDE_ADMIN.md](./GUIDE_ADMIN.md) (`/admin`).

**Login:** https://entripreneurship.fun/auth/login → expand **CREW / ADMIN LOGIN** → your crew email + password.

Account list and passwords: [CREW_LOGINS.md](./CREW_LOGINS.md).

---

## Crew vs admin

| | Crew (`/crew`) | Admin (`/admin`) |
|--|----------------|------------------|
| Station QR, checkout, tracking | ✓ | Uses crew pages when needed |
| EnCoin add/deduct | ✓ | — |
| Live map & leaderboard | ✓ | — |
| Register walk-ins | **registration@** only | Full roster CRUD |
| Review submissions (UI) | ✗ | ✓ (`/crew/submissions`) |
| Manage crew accounts | ✗ | ✓ |

If you log in as **admin**, you are sent to `/admin`, not `/crew`.

---

## Crew home (`/crew`)

After login you see your **assignment** (e.g. “Station 3 — Pos 3 Ideate” or “Bank Desk”) and buttons:

| Link | Who uses it |
|------|-------------|
| **Station QR & check-out** | Station-assigned crew |
| **Team movement tracker** | All crew |
| **EnCoins — add / deduct** | All crew (bank, roaming, etc.) |
| **Team locations (live map)** | All crew |
| **Live leaderboard** | All crew |
| **Register participant** | **registration@** only |

**Logout:** top of crew header.

---

## Station desk — QR & checkout

Path: **/crew/station**

**Mechanism:**

1. Each station has a unique `checkin_token` in the database (migration `008`).
2. QR encodes `{ type: "station", token, stationId }`.
3. When a participant scans at `/missions/scan`, API creates a **station_visit** row (`status: active`).
4. Scanning a **new** station auto–checks out the previous active visit.
5. Crew can **CHECK OUT** manually when the team leaves the physical post.

**Your job:**

- Display the QR full-screen or print it at your Pos.
- Watch the list of teams **currently checked in**.
- Tap **CHECK OUT** when they leave (optional but helps tracking).

Participants must check in before the CEO can submit for that Pos.

Detail: [STATION_QR.md](./STATION_QR.md).

**Station accounts:** `station1@` … `station7@` are tied to Pos 1–7 in crew assignments (for labeling; same tools unless you only use the station page).

---

## Team movement tracker

Path: **/crew/tracking**

- See which team is at which Pos, how long, and recent check-outs.
- Use for MC announcements and flow control.

---

## EnCoins — pay desk

Path: **/crew/pay**

### Add points

1. **Scan participant QR** — `/crew/scan`
   - Participant opens **Bank → Show My QR** (creates a session QR).
   - Or scan static team token if implemented.
2. Enter amount and note.
3. Enter **your crew transaction PIN** (6 digits) — **not** the participant’s PIN.

**Mechanism:** `POST /api/transactions/reward` verifies **logged-in crew profile’s** `pin_hash`, then inserts a `reward` transaction; trigger updates `teams.balance`.

### Show reward QR

Path: **/crew/qr**

- Preset amount QR for participants to scan and receive coins (session-based).

### Deduct points

Path: **/crew/pay/deduct`

- Shop purchases, penalties, corrections.
- Select team, amount, note → **crew PIN**.
- **Mechanism:** `spend` transaction reduces team balance (migration `007`).

### Important: crew PIN

Crew must enter **their own** 6-digit PIN when confirming pay/deduct — not the participant’s.

- Seeded crew accounts (`npm run db:seed-crew`) get transaction PIN **`888888`** (see [CREW_LOGINS.md](./CREW_LOGINS.md)).
- If reward returns **“Incorrect PIN”**, re-run seed or set PIN once while logged in as crew via the same API participants use (`/api/onboarding/pin`).

Participants set their PIN during onboarding; that is separate from crew PIN.

---

## Live map

Path: **/crew/map`

- Station pins from check-ins (and fallbacks from GPS pings).
- Helps find teams on campus.

---

## Leaderboard

Path: **/crew/leaderboard`

- Read-only view for MC screens.

---

## Registration desk

Path: **/crew/register**

**Account:** `registration@entripreneurship.fun` only (assignment kind `registration`).

- Add walk-in participants to `event_registrations` so they can WhatsApp-login.
- Does not create Supabase auth users by itself — participant still completes WhatsApp flow.

Full roster edit/delete: **admin** → [GUIDE_ADMIN.md](./GUIDE_ADMIN.md).

---

## Submission review (crew vs admin)

- **Approving/rejecting** station submissions is done in **/crew/submissions**, which requires **admin** login (jury lead).
- API allows `crew` or `admin` role, but the review **screen** is admin-gated.
- On approve, API sets submission `approved` and inserts a **reward** transaction for that station’s `point_reward`.

Station judges typically validate teams physically; jury lead approves in the admin-linked review UI.

---

## What crew should not do

- Do not use participant WhatsApp login for crew work.
- Do not share `EntripCrew2026!` publicly after the event (rotate passwords).
- Do not use `/admin` unless you are the designated jury lead account.

---

## Day-of checklist (crew)

**Station judge**

- [ ] Log in, open **Station QR**
- [ ] QR visible at post
- [ ] Check teams appear when they scan
- [ ] Check out when they leave
- [ ] Remind: **CEO submits** in app after check-in

**Bank**

- [ ] Set crew PIN for each desk staff
- [ ] Test scan one participant QR + small reward
- [ ] Deduct flow tested for shop

**Registration**

- [ ] Add late registrants before they WhatsApp login

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Redirected to `/home` | You used a participant account |
| Redirected to `/admin` | You used admin@ — use station/bank email |
| Cannot register participants | Use registration@ account |
| Reward PIN fails | Set crew PIN; use crew PIN not student PIN |
| No teams on station list | Participants must scan **station** QR, not bank QR |
