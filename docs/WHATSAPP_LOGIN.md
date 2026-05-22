# WhatsApp login (n8n webhook)

Participants are pre-registered from the Microsoft Forms CSV. They **do not** sign up with email anymore.

## Flow

1. User opens **Login** and enters their WhatsApp number (same as on the form).
2. App checks `event_registrations` in Supabase.
3. App generates a 6-character code (example: `K7M2P4`) and shows:
   - Message to send: `Hi Connext! Let me login to entripreneurship.fun (K7M2P4)`
   - Button: **Open WhatsApp** (`https://wa.me/447441424421?text=...`)
4. User sends that message to your **AI WhatsApp bot number**.
5. **n8n** receives the message and calls our webhook with the sender phone + code.
6. App marks the challenge **confirmed**; the browser polls until it redirects to finish login.
7. User lands in onboarding (PIN, team, etc.) like before.

## Setup checklist

1. Run SQL migration: `supabase/migrations/005_whatsapp_login.sql` in Supabase SQL Editor.
2. Import roster:
   ```bash
   npx tsx scripts/import-registrations.ts
   ```
   (uses `data/registrations.csv`; requires `SUPABASE_SERVICE_ROLE_KEY` in env)
3. Set environment variables (see `.env.example`).
4. Configure n8n HTTP Request node (below).
5. Deploy app and test one login end-to-end.

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `WHATSAPP_WEBHOOK_API_KEY` | Server only | Secret n8n sends on every webhook call |
| `WHATSAPP_BOT_NUMBER` | Server | Digits only, e.g. `447441424421` (no `+`; default Connext bot) |
| `NEXT_PUBLIC_WHATSAPP_BOT_NUMBER` | Optional client | Same number if you need it in UI later |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Create users + confirm logins |
| `NEXT_PUBLIC_APP_URL` | Server | Magic link redirect after login |

Generate a random API key, for example:

```bash
openssl rand -hex 32
```

## Webhook endpoint

**URL (production):**

```
POST https://entripreneurship.fun/api/auth/whatsapp/webhook
```

**URL (local):**

```
POST http://localhost:3000/api/auth/whatsapp/webhook
```

### Authentication

Send the same secret on every request (pick one):

- Header: `x-api-key: YOUR_WHATSAPP_WEBHOOK_API_KEY`
- Or header: `Authorization: Bearer YOUR_WHATSAPP_WEBHOOK_API_KEY`

If the key is wrong or missing → `401 Unauthorized`.

### Request body (JSON)

**Recommended (easiest for n8n):**

```json
{
  "phone": "628978073890",
  "code": "K7M2P4"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `phone` | Yes* | Sender WhatsApp in international form without `+` (62…) |
| `code` | Yes* | 6-character code from the app screen |

\* Or send `message` instead and we parse the code:

```json
{
  "phone": "628978073890",
  "message": "Hi Connext! Let me login to entripreneurship.fun (K7M2P4)"
}
```

**Alternate field names** (n8n can map your bot variables to these):

| Our field | Aliases accepted |
|-----------|------------------|
| `phone` | `whatsapp`, `from`, `sender` |
| `code` | `otp` |
| `message` | Full text; must include `entripreneurship.fun (XXXXXX)` (6-char code in parentheses) |

### Example success response (`200`)

```json
{
  "ok": true,
  "challengeId": "uuid-of-challenge",
  "userId": "uuid-of-supabase-user"
}
```

### Example error responses

| Status | Body | Meaning |
|--------|------|---------|
| `401` | `{ "error": "Unauthorized" }` | Wrong API key |
| `400` | `{ "ok": false, "error": "invalid_payload" }` | Missing phone/code |
| `404` | `{ "ok": false, "error": "invalid_or_expired" }` | Wrong code, wrong phone, or expired (>10 min) |
| `503` | Webhook key not set on server | Fix server env |

## n8n workflow (sketch)

1. **Trigger** — WhatsApp message received (your bot / Evolution / Meta provider).
2. **IF** — Message contains `entripreneurship.fun` (optional).
3. **Set** — Map fields:
   - `phone` → sender number (digits only; Indonesian `08…` → `62…` if needed).
   - `code` → 6 characters inside `(...)` at end of message, **or** pass full `message`.
4. **HTTP Request**
   - Method: `POST`
   - URL: `https://entripreneurship.fun/api/auth/whatsapp/webhook`
   - Headers: `x-api-key` = `{{ $env.WHATSAPP_WEBHOOK_API_KEY }}`
   - Body: JSON as above
5. **Optional** — Reply on WhatsApp: “You’re logged in! Return to the browser.”

### Phone normalization tip

Indonesian numbers often arrive as `0897…` or `897…`. The app stores `628…`. In n8n:

- Remove non-digits
- If starts with `0`, replace with `62`
- If starts with `8` (no country code), prefix `62`

## Other API routes (for reference)

| Method | Path | Who calls | Purpose |
|--------|------|-----------|---------|
| `POST` | `/api/auth/whatsapp/start` | Browser | Start login, get code + `waUrl` |
| `GET` | `/api/auth/whatsapp/status?challengeId=` | Browser poll | `pending` / `confirmed` / `expired` |
| `POST` | `/api/auth/whatsapp/webhook` | **n8n** | Confirm OTP |
| `GET` | `/api/auth/whatsapp/finish?challengeId=` | Browser redirect | Supabase session (magic link) |

## Security notes

- Keep `WHATSAPP_WEBHOOK_API_KEY` only on the server and in n8n credentials — never in the browser.
- Codes expire after **10 minutes**.
- Only one pending code per phone at a time; starting again invalidates the old one.
- Roster table has no public RLS; only the service role (API routes) can read/write it.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Not on registration list” | Re-run import script; check phone matches form |
| Webhook 404 | Code typo, expired, or phone mismatch vs browser |
| WhatsApp button missing | Set `WHATSAPP_BOT_NUMBER` |
| Login loop after confirm | Check `NEXT_PUBLIC_APP_URL` matches live domain |
| n8n 401 | Match `x-api-key` to server `WHATSAPP_WEBHOOK_API_KEY` |
