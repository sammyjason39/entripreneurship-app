# Deployment guide — Ubuntu VPS

Production domain: **https://entripreneurship.fun** (Traefik + Let’s Encrypt via Coolify proxy).

## Prerequisites

- Ubuntu 22.04+ VPS
- Node.js 20 LTS (`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs`)
- Ports **80/443** handled by Coolify **Traefik** (`coolify-proxy`) — not standalone Nginx
- DNS **A** records for `entripreneurship.fun` and `www` → your VPS IP
- Supabase project configured (see README)

## Steps

### 1. Clone and configure

```bash
cd /var/www
sudo git clone https://github.com/sammyjason39/entripreneurship-app.git
sudo chown -R $USER:$USER entripreneurship-app
cd entripreneurship-app
cp .env.example .env.local
nano .env.local
```

### 2. Build

```bash
npm ci
npm run build
npm test
```

### 3. Process manager (PM2)

Port **3002** is used because Docker already binds **3000**.

```bash
sudo npm install -g pm2
PORT=3002 pm2 start npm --name entrip -- start
pm2 startup
pm2 save
```

### 4. Traefik + HTTPS (Let’s Encrypt)

Copy `deploy/traefik/entripreneurship.yaml` to `/data/coolify/proxy/dynamic/` on the VPS. See `deploy/traefik/README.md`.

Traefik terminates TLS and proxies to `http://host.docker.internal:3002`. HTTP redirects to HTTPS automatically.

### 5. Updates on event day

```bash
cd /var/www/entripreneurship-app
git pull
npm ci
npm run build
PORT=3002 pm2 restart entrip
```

## Scaling (~100 users)

- Supabase handles DB connection pooling — use pooler URL if needed
- Single Next.js instance on 2GB RAM VPS is sufficient for 100 concurrent mobile clients
- Enable Supabase Realtime only on required tables
- Location pings: 1/min/user — already throttled client-side
