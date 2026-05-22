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
2. Run SQL from `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Create Storage bucket `submissions` (public read for crew review)
4. Enable Realtime on `submissions`, `teams`, `location_pings`
5. Create crew users in Auth, then set `profiles.app_role = 'crew'` in Table Editor

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

## Routes

| Path | Role |
|------|------|
| `/auth/login`, `/auth/register` | Public |
| `/onboarding` | New users |
| `/home`, `/bank`, `/missions`, `/map`, `/learn`, `/prizes`, `/profile` | Participant |
| `/crew/*` | Crew / admin |

## Event checklist

- [ ] Run migration + seed stations/content
- [ ] Upload real map to `public/map/dago-map.svg` (or `.png`)
- [ ] Replace sponsor logos in `public/brands/`
- [ ] Create crew accounts (`app_role = crew`)
- [ ] Test: register → team → submit → crew approve → EnCoins
- [ ] Test QR: crew reward + participant transfer

## License

Private — BINUS Entrepreneurship Center event use.
