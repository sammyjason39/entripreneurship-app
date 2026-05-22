# Deployment guide — Ubuntu VPS

## Prerequisites

- Ubuntu 22.04+ VPS
- Node.js 20 LTS (`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs`)
- Nginx + Certbot for HTTPS
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

```bash
sudo npm install -g pm2
pm2 start npm --name entrip -- start
pm2 startup
pm2 save
```

### 4. Nginx

```nginx
server {
    listen 80;
    server_name app.entripreneurship.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.entripreneurship.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/app.entripreneurship.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.entripreneurship.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo certbot --nginx -d app.entripreneurship.yourdomain.com
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Updates on event day

```bash
cd /var/www/entripreneurship-app
git pull
npm ci
npm run build
pm2 restart entrip
```

## Scaling (~100 users)

- Supabase handles DB connection pooling — use pooler URL if needed
- Single Next.js instance on 2GB RAM VPS is sufficient for 100 concurrent mobile clients
- Enable Supabase Realtime only on required tables
- Location pings: 1/min/user — already throttled client-side
