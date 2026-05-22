# Traefik (Coolify proxy) — entripreneurship.fun

The VPS already runs **Coolify’s Traefik** on ports 80/443 with **Let’s Encrypt** (HTTP challenge).

## DNS (required before HTTPS works)

At your domain registrar, add:

| Type | Name | Value |
|------|------|--------|
| A | `@` | `43.156.118.56` |
| A | `www` | `43.156.118.56` |

Wait for DNS to propagate (often 5–30 minutes).

## Install / update route

```bash
sudo cp deploy/traefik/entripreneurship.yaml /data/coolify/proxy/dynamic/entripreneurship.yaml
```

Traefik reloads automatically (`providers.file.watch=true`). Certificates are stored in `/data/coolify/proxy/acme.json`.

## App backend

PM2 serves Next.js on **host port 3002** (3000 is used by Docker). Traefik forwards to `http://host.docker.internal:3002`.

Set on the server before `npm run build`:

```
NEXT_PUBLIC_APP_URL=https://entripreneurship.fun
```

## Supabase Auth URLs

- Site URL: `https://entripreneurship.fun`
- Redirect URLs: `https://entripreneurship.fun/auth/callback`

## Verify

```bash
curl -sI -H "Host: entripreneurship.fun" http://43.156.118.56/api/health
# Expect 307 → https://entripreneurship.fun/...

curl -s https://entripreneurship.fun/api/health
# After DNS + cert: {"ok":true,...}
```
