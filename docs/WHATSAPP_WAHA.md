# WhatsApp login via WAHA

Route all incoming WhatsApp messages from your **WAHA** instance to the app. When a user sends the login message, the app confirms the code and **replies on WhatsApp** with a one-tap link.

## Webhook URL (set in WAHA)

**Production:**

```
https://entripreneurship.fun/api/auth/whatsapp/waha
```

**Local (use ngrok or similar):**

```
https://YOUR_TUNNEL/api/auth/whatsapp/waha
```

Health check: `GET` the same URL returns `{ "ok": true, ... }`.

## Environment variables (server `.env` / VPS)

| Variable | Example | Purpose |
|----------|---------|---------|
| `WAHA_BASE_URL` | `https://waha-….sumopod.my.id` | WAHA server (no trailing slash) |
| `WAHA_API_KEY` | *(from WAHA dashboard)* | `X-Api-Key` for `POST /api/sendText` |
| `WAHA_SESSION` | `N8N` | Session name (must match WAHA session) |
| `NEXT_PUBLIC_APP_URL` | `https://entripreneurship.fun` | Magic link redirect |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Supabase)* | Confirm login + create user |

Do **not** commit real API keys to git. Set them only on the server.

## Configure WAHA session webhooks

In WAHA dashboard or API, for session **`N8N`** (or your session name):

```json
{
  "name": "N8N",
  "config": {
    "webhooks": [
      {
        "url": "https://entripreneurship.fun/api/auth/whatsapp/waha",
        "events": ["message"]
      }
    ]
  }
}
```

Or update an existing session:

```
PUT /api/sessions/N8N
```

(with the same `config.webhooks` body)

## Flow

1. User opens **Login** → enters WhatsApp number → gets code + “Open WhatsApp”.
2. User sends: `Hi Connext! Let me login to entripreneurship.fun (XXXXXX)`.
3. WAHA `POST`s the message to `/api/auth/whatsapp/waha`.
4. App validates code in Supabase → marks challenge **confirmed**.
5. App calls WAHA `POST /api/sendText` with the **finish link**.
6. User taps the link (or browser polling completes) → logged in.

## WAHA send API (used by the app)

```
POST {WAHA_BASE_URL}/api/sendText
X-Api-Key: {WAHA_API_KEY}
Content-Type: application/json

{
  "chatId": "628978073890@c.us",
  "text": "✅ You're verified...",
  "session": "N8N"
}
```

`chatId` is the sender’s JID from the webhook (`payload.from`), e.g. `628978073890@c.us`.

## Incoming webhook shape (WAHA)

```json
{
  "event": "message",
  "session": "N8N",
  "payload": {
    "from": "628978073890@c.us",
    "body": "Hi Connext! Let me login to entripreneurship.fun (K7M2P4)",
    "fromMe": false
  }
}
```

Messages with `fromMe: true` are ignored. Random chat messages without `entripreneurship.fun` or a `(XXXXXX)` code are ignored (no reply).

## Deploy checklist

1. Set env vars on VPS (`WAHA_*`, Supabase, `NEXT_PUBLIC_APP_URL`).
2. `git pull && npm ci && npm run build && pm2 restart entrip`
3. Point WAHA webhooks to `/api/auth/whatsapp/waha`.
4. Test: start login on web → send WhatsApp message → receive reply with link.

## Optional: n8n

You can still use `/api/auth/whatsapp/webhook` with `x-api-key` if needed. With WAHA wired directly, n8n is not required for login.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No WhatsApp reply | Check `WAHA_BASE_URL`, `WAHA_API_KEY`, `WAHA_SESSION` on server; `pm2 logs entrip` |
| Webhook never hits app | Confirm WAHA webhook URL and session is **WORKING** |
| 404 on confirm | Code expired, typo, or phone not on registration list |
| Link opens but no session | Add `https://entripreneurship.fun/**` to Supabase Auth redirect URLs |
