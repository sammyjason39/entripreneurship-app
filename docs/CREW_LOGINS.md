# Premade crew & admin logins

Use **email + password** on the login page under **Crew / admin login** (participants use WhatsApp).

## Admin vs crew

| | **Admin** (`/admin`) | **Crew** (`/crew`) |
|--|---------------------|-------------------|
| Who | `admin@entripreneurship.fun` | All other crew emails |
| Jury dashboard, full participant list, manage crew | No |
| Review all submissions, all teams | No |
| Live map, leaderboard | Yes |
| Add/deduct EnCoins (scan, QR, deduct) | Yes |
| Register form participants | Only `registration@` desk |
| Logout | Top-right on admin nav | Top-right on crew header |

Crew accounts **cannot** open `/admin`. Admins use the jury console, not the crew phone UI.

**Change these passwords after the event** if the repo is shared.

## Passwords

| Role | Password |
|------|----------|
| Admin | `EntripAdmin2026!` |
| All crew accounts | `EntripCrew2026!` |

## Crew transaction PIN (EnCoin pay / deduct)

After `npm run db:seed-crew`, all **crew** accounts use this **6-digit PIN** when confirming rewards or deductions (not the participant’s PIN):

| | Value |
|--|--------|
| Crew transaction PIN | `888888` |

Change it in production if this doc is public. Re-run `db:seed-crew` to reset PINs on seeded accounts.

## Shared desk accounts

| Email | Name | Access |
|-------|------|--------|
| `admin@entripreneurship.fun` | Event Admin | `/admin`, `/admin/crew`, full crew tools |
| `bank@entripreneurship.fun` | Bank Desk | `/crew` — rewards, QR, scan |
| `jury@entripreneurship.fun` | Jury / MC | `/crew` — submissions, leaderboard |
| `registration@entripreneurship.fun` | Registration Desk | `/crew` |
| `roaming@entripreneurship.fun` | Roaming Crew | `/crew` |

## Station crew (4 per Pos)

Pattern: `station{pos}{a|b|c|d}@entripreneurship.fun` — password `EntripCrew2026!`, transaction PIN `888888`, assigned to that Pos in crew assignments.

| Pos | Email |
|-----|--------|
| **1** | `station1a@` `station1b@` `station1c@` `station1d@` |
| **2** | `station2a@` … `station2d@` |
| **3** | `station3a@` … `station3d@` |
| **4** | `station4a@` … `station4d@` |
| **5** | `station5a@` … `station5d@` |
| **6** | `station6a@` … `station6d@` |
| **7** | `station7a@` … `station7d@` |

Full addresses use domain `@entripreneurship.fun` (e.g. `station3b@entripreneurship.fun` → **Station 3 Crew B**, Pos 3).

## Create or reset accounts

```bash
npm run db:seed-crew
```

Dry run (no API calls):

```bash
npx tsx scripts/seed-crew-accounts.ts --dry-run
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

Safe to re-run — updates passwords and profiles to match this doc.

**Total seeded:** 1 admin + 4 desk + 28 station = **33 accounts**.

## Quick test

1. Open https://entripreneurship.fun/auth/login  
2. Expand **Crew / admin login**  
3. `station2a@entripreneurship.fun` / `EntripCrew2026!`  
4. You should land on `/crew` with Pos 2 assignment
