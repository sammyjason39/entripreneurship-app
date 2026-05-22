# EnTripreneurship Vol. 02 — Participant PWA

Mobile-first Progressive Web App for the BINUS EnTripreneurship event (May 23, 2026). Teams earn and spend **EnCoins** across 7 Design Thinking stations.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth, Postgres, Storage, Realtime)
- **Tailwind CSS** + Cybercore design system
- **PWA** via `@ducanh2912/next-pwa`

## Quick start (local)

### 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. **Authentication → URL Configuration** — add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://entripreneurship.fun/auth/callback` (production)
3. Run SQL from `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Create Storage bucket `submissions` (public read for crew review)
4. Enable Realtime on `submissions`, `teams`, `location_pings`
5. Run `supabase/migrations/004_admin_crew_assignments.sql`
6. Promote your jury lead: set `profiles.app_role = 'admin'` for their user in Table Editor (or create via admin UI once one admin exists)

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Styles look broken (plain white buttons, huge logos)?** The Tailwind CSS bundle failed to load — usually a stale `.next` cache. Stop the dev server, then:

```bash
rm -rf .next && npm run dev
```

Hard-refresh the browser (`Cmd+Shift+R`). In DevTools → Network, `/_next/static/css/app/layout.css` should return **200**.

### 4. Test

```bash
npm test
npm run lint
npm run build
```

## Deployment

### Vercel (recommended in PRD)

1. Push repo to GitHub
2. Import project in Vercel
3. Add environment variables (same as `.env.local`)
4. Set custom domain: `app.entripreneurship.vercel.app`
5. Deploy

### Ubuntu VPS (self-hosted)

```bash
# On server
git clone https://github.com/sammyjason39/entripreneurship-app.git
cd entripreneurship-app
cp .env.example .env.local
# edit .env.local with production values

npm ci
npm run build

# PM2
npm install -g pm2
pm2 start npm --name entrip -- start
pm2 save

# Nginx reverse proxy (port 3000)
# server { listen 443 ssl; server_name app.yourdomain.com;
#   location / { proxy_pass http://127.0.0.1:3000; } }
```

Use Node 20+, enable HTTPS, and set `NEXT_PUBLIC_APP_URL` to your public URL.

## Documentation (end-to-end)

| Audience | Guide |
|----------|--------|
| Participants | [docs/GUIDE_PARTICIPANT.md](docs/GUIDE_PARTICIPANT.md) |
| Crew | [docs/GUIDE_CREW.md](docs/GUIDE_CREW.md) |
| Admin / jury | [docs/GUIDE_ADMIN.md](docs/GUIDE_ADMIN.md) |
| Index + testing | [docs/README.md](docs/README.md), [docs/TESTING.md](docs/TESTING.md) |

## Routes

| Path | Role |
|------|------|
| `/auth/login` | Public — WhatsApp OTP (pre-registered roster) |
| `/auth/register` | Info only (form registration already done) |
| `/onboarding` | New users |
| `/home`, `/bank`, `/missions`, `/map`, `/learn`, `/prizes`, `/profile` | Participant |
| `/crew/*` | Crew (station judges, bank desk, etc.) |
| `/admin`, `/admin/participants`, `/admin/crew` | Super admin / jury console |

## Event checklist

- [ ] Run migration + seed stations/content
- [ ] Upload real map to `public/map/dago-map.svg` (or `.png`)
- [x] Sponsor logos in `public/brands/` (sourced from official sites)
- [ ] Create first admin (`profiles.app_role = admin`)
- [ ] Use `/admin/crew` to create crew logins and assignments
- [ ] Run `005_whatsapp_login.sql` + `npm run db:import-registrations` (see [docs/WHATSAPP_LOGIN.md](docs/WHATSAPP_LOGIN.md))
- [ ] Configure n8n webhook + `WHATSAPP_BOT_NUMBER` / `WHATSAPP_WEBHOOK_API_KEY`
- [ ] Run `npm run db:seed-crew` — premade crew logins ([docs/CREW_LOGINS.md](docs/CREW_LOGINS.md))
- [ ] Test: WhatsApp login → onboarding → team → submit → crew approve → EnCoins
- [ ] Test QR: crew reward + participant transfer

## License

Private — BINUS Entrepreneurship Center event use.
