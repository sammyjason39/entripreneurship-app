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

## Accounts

| Email | Name | Access |
|-------|------|--------|
| `admin@entripreneurship.fun` | Event Admin | `/admin`, `/admin/crew`, full crew tools |
| `bank@entripreneurship.fun` | Bank Desk | `/crew` — rewards, QR, scan |
| `jury@entripreneurship.fun` | Jury / MC | `/crew` — submissions, leaderboard |
| `registration@entripreneurship.fun` | Registration Desk | `/crew` |
| `roaming@entripreneurship.fun` | Roaming Crew | `/crew` |
| `station1@entripreneurship.fun` | Station 1 Judge | `/crew` — Pos 1 |
| `station2@entripreneurship.fun` | Station 2 Judge | `/crew` — Pos 2 |
| `station3@entripreneurship.fun` | Station 3 Judge | `/crew` — Pos 3 |
| `station4@entripreneurship.fun` | Station 4 Judge | `/crew` — Pos 4 |
| `station5@entripreneurship.fun` | Station 5 Judge | `/crew` — Pos 5 |
| `station6@entripreneurship.fun` | Station 6 Judge | `/crew` — Pos 6 |
| `station7@entripreneurship.fun` | Station 7 Judge | `/crew` — Pos 7 |

## Create or reset accounts

```bash
npm run db:seed-crew
```

Safe to re-run — updates passwords and profiles to match this doc.

## Quick test

1. Open https://entripreneurship.fun/auth/login  
2. Expand **Crew / admin login**  
3. `bank@entripreneurship.fun` / `EntripCrew2026!`  
4. You should land on `/crew`
