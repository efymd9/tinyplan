# Deploying TinyPlan to tinyplan.org

A from-scratch production deploy to a single Linux VPS, keeping the local SQLite
database, with **Clerk** auth and **Caddy** for automatic HTTPS.

> **Why a VPS and not Vercel?** TinyPlan stores data in a local SQLite file
> (`data/tinyplan.db`, WAL mode, opened by `src/lib/db/index.ts`). That needs a
> persistent filesystem, which serverless platforms don't provide. The DB is
> single-node and local — run exactly **one** instance against it.

## Architecture

```
Internet ──HTTPS(443)──▶ Caddy (TLS, www→apex, HSTS) ──HTTP(127.0.0.1:3000)──▶ next start (systemd)
                                                                                  │
                                                                          ./data/tinyplan.db (SQLite, persistent disk)
Auth: Clerk (hosted)   Payments: Stripe (deferred)   Email: Clerk only (Resend dropped)
```

## What only you can do (accounts/secrets)

- A VPS (Hetzner / DigitalOcean / etc.), Ubuntu 24.04 LTS recommended.
- Namecheap DNS access for **tinyplan.org**.
- A **Clerk** account (production instance for tinyplan.org).
- `ADMIN_EMAILS` = the email you'll sign into Clerk with (for `/admin`).

---

## Step 1 — Provision the VPS

1. Create an Ubuntu 24.04 server (1–2 vCPU / 2 GB RAM is plenty for launch). Note its **public IPv4** → `<SERVER_IP>`.
2. SSH in and do basic hardening:
   ```bash
   adduser deploy && usermod -aG sudo deploy        # a sudo user (skip if your image made one)
   ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
   ```
3. Create the unprivileged service user that will own the app and DB:
   ```bash
   sudo useradd --system --create-home --home-dir /srv/tinyplan --shell /usr/sbin/nologin tinyplan
   ```

## Step 2 — Point the domain at the server (Namecheap)

Namecheap → **Domain List** → tinyplan.org → **Manage** → **Advanced DNS**.
Delete the default "parking" / CNAME records, then add:

| Type     | Host  | Value         | TTL       |
| -------- | ----- | ------------- | --------- |
| A Record | `@`   | `<SERVER_IP>` | Automatic |
| A Record | `www` | `<SERVER_IP>` | Automatic |

(The apex `@` can't be a CNAME, so `www` uses an A record too; Caddy redirects www→apex.)

Verify propagation (can take 5–30 min):
```bash
dig +short tinyplan.org      # should print <SERVER_IP>
dig +short www.tinyplan.org  # should print <SERVER_IP>
```

> Keep the **Clerk CNAMEs from Step 3** in mind — you'll add them to this same
> Advanced DNS page.

## Step 3 — Set up the Clerk production instance

1. In [dashboard.clerk.com](https://dashboard.clerk.com), create/select your app and switch to a **Production** instance.
2. Set the production domain to **tinyplan.org**.
3. Clerk shows a set of DNS records to add (they are **instance-specific — copy the exact host/target from your dashboard**, don't hardcode). They typically look like:

   | Type  | Host (Namecheap)      | Value (from Clerk)            |
   | ----- | --------------------- | ----------------------------- |
   | CNAME | `clerk`               | `frontend-api.clerk.services` |
   | CNAME | `accounts`            | `accounts.clerk.services`     |
   | CNAME | `clkmail`             | `mail.…clerk.services`        |
   | CNAME | `clk._domainkey`      | `dkim1.…clerk.services`       |
   | CNAME | `clk2._domainkey`     | `dkim2.…clerk.services`       |

   Add each on the Namecheap **Advanced DNS** page (Host = the left label, no domain suffix). Wait until Clerk marks the domain **Verified**.
4. In Clerk → **Paths**, set Sign-in = `/sign-in`, Sign-up = `/sign-up`, and the after-auth redirect to `/dashboard/today`. Add `https://tinyplan.org` as an allowed origin.
5. From **API Keys**, copy the production **`pk_live_…`** and **`sk_live_…`** — you'll paste them into `.env.production` (Step 5).

## Step 4 — Install the runtime

```bash
# Node 22 (matches the build ABI for better-sqlite3) via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Build tools (fallback if no better-sqlite3 prebuilt binary matches) + sqlite3 CLI for backups
sudo apt-get install -y build-essential python3 sqlite3 git

# Caddy (automatic HTTPS)
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy

node -v   # expect v22.x
```

## Step 5 — Get the code and configure env

```bash
sudo -u tinyplan -H bash
cd /srv/tinyplan
git clone <YOUR_REPO_URL> .          # or rsync your repo here
cp .env.example .env.production
chmod 600 .env.production
nano .env.production
```

Fill in `.env.production` (see comments in the file). At minimum for this deploy:

```ini
NEXT_PUBLIC_APP_URL=https://tinyplan.org
NODE_ENV=production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_…   # from Clerk
CLERK_SECRET_KEY=sk_live_…                     # from Clerk
AUTH_SECRET=…                                  # openssl rand -base64 48
ADMIN_EMAILS=you@tinyplan.org                  # the email you sign into Clerk with
DEV_BYPASS_PAYWALL=true                        # soft launch: mock checkout, no real charges
```

> `NEXT_PUBLIC_*` values are **baked into the build** — they must be correct
> *before* `npm run build`. Next loads `.env.production` automatically for both
> build and start, so having this file in place is enough.

> ⚠️ **Do NOT copy your dev `.env.local` to the server.** Next ranks `.env.local`
> *above* `.env.production`, so a stray dev file (with `http://…` URLs and
> `DEV_BYPASS_*=true`) would silently override production config and open the
> paywall / break links. A clean `git clone` won't include it (it's gitignored) —
> just don't rsync it. Verify on the server: `ls -la .env.local` should be "No such file".

## Step 6 — Build and run under systemd

```bash
# As the tinyplan user, in /srv/tinyplan:
npm ci            # installs deps AND compiles better-sqlite3 for THIS server's Node
npm run build     # fails fast if NEXT_PUBLIC_APP_URL/Clerk key are missing (by design)
exit              # back to your sudo user

# Install the service
sudo cp /srv/tinyplan/deploy/tinyplan.service /etc/systemd/system/tinyplan.service
sudo systemctl daemon-reload
sudo systemctl enable --now tinyplan
sudo systemctl status tinyplan      # should be active (running)
curl -I http://127.0.0.1:3000/      # should return a redirect to /es
```

If the service fails to start, the most common cause is a missing `CLERK_SECRET_KEY`
(the app aborts on purpose — see `src/instrumentation.ts`). Check `journalctl -u tinyplan -e`.

## Step 7 — TLS and the reverse proxy (Caddy)

```bash
sudo cp /srv/tinyplan/deploy/Caddyfile /etc/caddy/Caddyfile
sudo sed -i 's/you@example.com/your-real-email@example.com/' /etc/caddy/Caddyfile
sudo mkdir -p /var/log/caddy
sudo systemctl reload caddy
journalctl -u caddy -f              # watch it obtain the Let's Encrypt cert
```

Caddy needs the apex A record (Step 2) already pointing here to get the cert.

## Step 8 — Verify the deploy

```bash
curl -I https://tinyplan.org/                 # 200/308 → /es, valid TLS
curl -sI https://tinyplan.org/ | grep -i strict-transport   # HSTS present
curl -I https://www.tinyplan.org/             # 301 → https://tinyplan.org
```

Then in a browser:
- `https://tinyplan.org` → redirects to `/es`, landing page loads.
- Take the quiz → result → pricing → "checkout" returns to the success page (mock, soft launch).
- `https://tinyplan.org/sign-in` → Clerk sign-in renders. Sign up, then `/dashboard/today` loads.
- `https://tinyplan.org/admin` → reachable only when signed in as an `ADMIN_EMAILS` address; everyone else is redirected.

Confirm the production build didn't bake in a wrong URL:
```bash
grep -r "localhost:3000\|187\.124\.27\.137" /srv/tinyplan/.next/server | head   # expect no output
```

## Step 9 — Backups

```bash
sudo chmod +x /srv/tinyplan/deploy/backup-db.sh
sudo -u tinyplan crontab -e
# add:
0 3 * * *  /srv/tinyplan/deploy/backup-db.sh >> /srv/tinyplan/backups/backup.log 2>&1
```

This takes a WAL-safe nightly snapshot to `/srv/tinyplan/backups`, keeping 14. Copy them off-box periodically.

---

## Redeploying after code changes

```bash
sudo -u tinyplan -H bash -c '
  cd /srv/tinyplan &&
  git pull &&
  npm ci &&
  npm run build
'
sudo systemctl restart tinyplan
```

Rebuild is **required** whenever any `NEXT_PUBLIC_*` value changes (they're frozen at build time).

## Turning on real billing later (currently deferred)

When you're ready to charge:
1. Set `STRIPE_SECRET_KEY=sk_live_…` in `.env.production` and **remove** `DEV_BYPASS_PAYWALL`.
2. Implement the Stripe **webhook route** (not built yet) so paid users get `subscription_status` updated — `verifyWebhookSignature()` already exists in `src/lib/payments/stripe.ts`; it just needs a `POST /api/webhooks/stripe` handler. Then set `STRIPE_WEBHOOK_SECRET=whsec_…`.
3. Register `https://tinyplan.org/api/webhooks/stripe` in the Stripe dashboard.
4. `npm run build && sudo systemctl restart tinyplan`.

## (Optional) Working contact email

`hello@tinyplan.org` (shown in the footer/terms/privacy) won't receive mail until
you set it up. Easiest: Namecheap → Domain → **Email Forwarding**, forward
`hello@tinyplan.org` to your inbox.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Every page 500s | Clerk keys invalid/mismatched. Check `pk_live`/`sk_live` are from the **same** Clerk production instance. |
| Service won't start, log says `CLERK_SECRET_KEY is required` | Add it to `.env.production`, `systemctl restart tinyplan`. |
| `npm run build` throws about `NEXT_PUBLIC_APP_URL`/Clerk key | Intended guard — set them in `.env.production` (or `SKIP_ENV_VALIDATION=1` to bypass). |
| Emails/links point at localhost | Rebuild — `NEXT_PUBLIC_APP_URL` was wrong at build time. |
| Clerk sign-in shows a domain error | The Clerk production domain isn't Verified yet, or the CNAMEs aren't propagated. |
| Data disappeared after a restart | `WorkingDirectory` in the systemd unit isn't the repo root, so `./data` resolved elsewhere. |
| `/admin` redirects you away | Your Clerk email isn't in `ADMIN_EMAILS` (fail-closed by design). |
