# TinyPlan — Deployment & Operations

How TinyPlan is hosted at **https://tinyplan.org**, and how to operate, redeploy, and recover it.

> **Why a VPS and not Vercel?** TinyPlan stores all data in a local SQLite file (`data/tinyplan.db`, WAL mode, opened by `src/lib/db/index.ts`). That needs a persistent filesystem, which serverless platforms don't provide. The DB is single-node and local — run exactly **one** instance against it.

---

## Current production topology

TinyPlan runs on a **shared Linux VPS** that also hosts other apps — do not disturb them.

| | |
|---|---|
| **Host** | Hostinger VPS, Ubuntu 24.04, `srv1460578.hstgr.cloud`, public IP `187.124.27.137` |
| **App directory** | `/root/parentpath` (git branch `deploy/tinyplan-org`) |
| **Process** | systemd unit `tinyplan.service` → `next start -H 0.0.0.0 -p 3002` (runs as `root`) |
| **Port** | **3002** (3000 is taken by another app on this box) |
| **Env file** | `/root/parentpath/.env.production` (chmod 600; loaded by both `next build` and `next start`) |
| **Database** | `/root/parentpath/data/tinyplan.db` (+ `-wal`/`-shm` sidecars) |
| **TLS / proxy** | **shared** Caddy (`/etc/caddy/Caddyfile`) — a `tinyplan.org` vhost proxies to `127.0.0.1:3002`; `www` → apex redirect. Let's Encrypt auto-cert. |
| **Auth** | Clerk **production** instance for tinyplan.org (keys in `.env.production`; DNS CNAMEs on Namecheap) |
| **Other apps on this box** | `keloapp.xyz` (:3000, pm2), `alinakobzar.com` (static), `partner-network`, `susurra-preview` (:3003) |

The Clerk integration, the `:3002` service, and the appended Caddy vhost are the only TinyPlan-owned pieces. Everything else on the box belongs to other projects.

---

## DNS (Namecheap)

`tinyplan.org` uses Namecheap BasicDNS (`dns1/dns2.registrar-servers.com`). Required records:

| Type | Host | Value |
|---|---|---|
| A | `@` | `187.124.27.137` |
| A | `www` | `187.124.27.137` |
| CNAME | `clerk` | (from Clerk dashboard, e.g. `frontend-api.clerk.services`) |
| CNAME | `accounts` | `accounts.clerk.services` |
| CNAME | `clkmail` | `mail.<id>.clerk.services` |
| CNAME | `clk._domainkey` | `dkim1.<id>.clerk.services` |
| CNAME | `clk2._domainkey` | `dkim2.<id>.clerk.services` |

The Clerk CNAME targets are **instance-specific** — copy the exact values from the Clerk dashboard → Domains. The `clerk.`/`accounts.` subdomains are needed for browser sign-in to work.

> **Namecheap gotcha:** a leftover **URL Redirect Record** on `@` silently overrides any A record (the apex stays on Namecheap's `192.64.119.x` forwarding IP). Delete the URL Redirect Record first, then add the A record, and click the green ✓ to save each row. Verify from the source: `dig +short @dns1.registrar-servers.com tinyplan.org A` should return `187.124.27.137`.

---

## Configuration: `/root/parentpath/.env.production`

`next build` **and** `next start` both load this file (Next loads `.env.production` when `NODE_ENV=production`). `NEXT_PUBLIC_*` values are **inlined at build time** — changing them requires a rebuild. Keep it `chmod 600`. The required set:

```ini
NEXT_PUBLIC_APP_URL=https://tinyplan.org
NODE_ENV=production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_…     # Clerk production
CLERK_SECRET_KEY=sk_live_…                       # Clerk production (runtime)
AUTH_SECRET=…                                    # openssl rand -hex 48
ADMIN_EMAILS=you@example.com                     # the email you sign into Clerk with
STRIPE_SECRET_KEY=sk_live_…                       # LIVE billing — real charges (gate enforced)
STRIPE_WEBHOOK_SECRET=whsec_…                     # signing secret of the LIVE webhook endpoint
# DEV_BYPASS_PAYWALL is intentionally ABSENT — its presence with a live key aborts startup
```

See [`.env.example`](.env.example) for the full annotated list. **Never** copy a dev `.env.local` here — Next ranks `.env.local` *above* `.env.production`, so it would silently override prod config.

The repo's startup guards will stop a misconfigured deploy loudly: `next.config.ts` fails the build unless `NEXT_PUBLIC_APP_URL` is `https://` and the Clerk key is `pk_…`; `src/instrumentation.ts` aborts startup if `CLERK_SECRET_KEY` is missing while Clerk is enabled. (Bypass for a one-off non-prod build with `SKIP_ENV_VALIDATION=1`.)

---

## Operations

### Redeploy after code changes
```bash
cd /root/parentpath
git pull                 # or apply changes
npm ci                   # only if dependencies changed
npm run build            # loads .env.production; rebuild is REQUIRED for any NEXT_PUBLIC_* change
systemctl restart tinyplan
```
Verify: `curl -sI https://tinyplan.org/` → `307` to `/es`, valid TLS.

> Always **build then restart**. A running `next start` reads content-hashed chunks from `.next` lazily; rebuilding underneath it makes live clients hit `ChunkLoadError`. The restart loads the fresh build cleanly.

### Service management
```bash
systemctl status tinyplan        # state
systemctl restart tinyplan       # restart
journalctl -u tinyplan -f        # follow logs
journalctl -u tinyplan -n 50     # recent logs
curl -sI http://127.0.0.1:3002/  # health on the loopback (expect 307)
```
The unit lives at `/etc/systemd/system/tinyplan.service` (mirrored in [`deploy/tinyplan.service`](deploy/tinyplan.service)). After editing it: `systemctl daemon-reload && systemctl restart tinyplan`.

### Pushing to GitHub
The repo origin is `git@github.com:efymd9/tinyplan.git`. **The default SSH identity for `github.com` in `~/.ssh/config` is a READ-ONLY key belonging to another project on this shared box — do not change the config.** Push by pointing git at TinyPlan's dedicated write key explicitly:
```bash
cd /root/parentpath
GIT_SSH_COMMAND="ssh -i /root/.ssh/tinyplan_org_rw -o IdentitiesOnly=yes" git push
```
`/root/.ssh/tinyplan_org_rw` is a write-access **deploy key** (added 2026-06-03) for this repo only. `-o IdentitiesOnly=yes` forces that key instead of the config default. Production work lives on branch `deploy/tinyplan-org`.

### GeoIP database (locale tiebreak)
When a visitor's `Accept-Language` matches neither locale, `src/proxy.ts` tiebreaks on the client IP's country via a **local** MaxMind-format lookup — the IP is not stored and never leaves the server (no third-party geo API, consistent with the privacy policy). The database is gitignored; fetch it on a fresh box (and optionally refresh monthly — DB-IP publishes on the 1st):
```bash
mkdir -p /root/parentpath/data/geoip
curl -sL "https://download.db-ip.com/free/dbip-country-lite-$(date +%Y-%m).mmdb.gz" \
  | gunzip > /root/parentpath/data/geoip/dbip-country-lite.mmdb
systemctl restart tinyplan   # the reader is cached per-process
```
If the file is absent the geo step silently disables itself (language-only detection). Attribution (CC BY 4.0): this product includes IP-geolocation data by [DB-IP](https://db-ip.com).

### Editing the shared Caddy config — carefully
`/etc/caddy/Caddyfile` serves **multiple sites**. Never overwrite it. To change TinyPlan's vhost:
```bash
cp -a /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak.$(date +%F-%H%M%S)   # backup first
# edit the tinyplan.org / www.tinyplan.org blocks only
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile          # MUST pass before reload
systemctl reload caddy            # graceful; if it sticks in "reloading", systemctl restart caddy
```
TinyPlan's blocks (see [`deploy/Caddyfile`](deploy/Caddyfile)):
```caddy
tinyplan.org {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3002
  header Strict-Transport-Security "max-age=31536000; includeSubDomains"
  header X-Content-Type-Options "nosniff"
  header Referrer-Policy "strict-origin-when-cross-origin"
}
www.tinyplan.org {
  redir https://tinyplan.org{uri} permanent
}
```
> **Caddy gotcha:** do **not** add a `log { output file … }` block pointing at a new file — the `caddy` user can append to existing files in `/var/log/caddy` but cannot create new ones, so the reload fails with `permission denied` and the new config never applies. TinyPlan logs to journald (`journalctl -u caddy`).

### Backups
The DB is a single SQLite file. Use a WAL-safe online backup (never a raw `cp` of just the `.db`):
```bash
# manual
sqlite3 /root/parentpath/data/tinyplan.db ".backup '/root/backups/tinyplan-$(date +%F).db'"
```
[`deploy/backup-db.sh`](deploy/backup-db.sh) does this with rotation (keeps 14). **Status (2026-06-08):** `/root/backups` exists, one backup taken, and a restore drill passed (gunzip → open → row counts matched live → `PRAGMA integrity_check = ok`). Still TODO: install the nightly cron (left to the operator — `crontab` edits aren't automated), an **off-box** copy, and a backup of `.env.production` (its secrets — Clerk live, Stripe, AUTH_SECRET — are regenerable but losing them is painful).
```bash
chmod +x /root/parentpath/deploy/backup-db.sh
# install the nightly job (no existing root crontab to preserve):
( crontab -l 2>/dev/null | grep -v backup-db.sh; \
  echo '0 3 * * * /root/parentpath/deploy/backup-db.sh >> /root/backups/backup.log 2>&1' ) | crontab -
# off-box (pick one): rclone copy /root/backups remote:tinyplan-backups   # or scp to another host
```
Copy backups off-box periodically. `analytics_events` grows unbounded — prune/rotate if it gets large.

### Port exposure / firewall
The app binds `0.0.0.0:3002` but the raw port is **not** publicly reachable: `ufw` default-incoming is `deny` and there is **no `3002` allow rule** (only 22/80/443 + other projects' 3003/3004), so external traffic to `:3002` is dropped while Caddy reaches it over loopback. **Do not add a `3002` allow rule**, and **do not** change `ExecStart` to bind `-H 127.0.0.1`: under Next 16, binding to loopback makes `proxy.ts` self-proxy to `https://localhost:3002` (it derives the scheme from Caddy's `X-Forwarded-Proto: https`) and every rendered route 500s with an `EPROTO` TLS error. The firewall is the correct control here.

### Honoring data-deletion requests (GDPR / CCPA / PIPEDA / COPPA)

The privacy policy commits to honoring deletion requests **within 30 days**. TinyPlan stores a parent's data in two systems, so a complete erasure is **two steps**:

1. **Local database** — the SQLite file (`data/tinyplan.db`): quiz answers, plans, day logs, check-ins, payments, analytics, and the `users` row.
2. **Clerk** — the parent's identity (email + auth credentials), held by Clerk, **not** in the local DB.

#### Step 1 — delete the local data with the operator tool

[`deploy/delete-user.sh`](deploy/delete-user.sh) (wrapping [`scripts/delete-user.mjs`](scripts/delete-user.mjs)) removes **all** of one user's rows from the local DB, in foreign-key-safe order, inside a single transaction.

**Always preview with `--dry-run` first** (read-only, makes no changes), confirm the counts look right, then re-run for real:

```bash
cd /root/parentpath

# 1) Preview — read-only, no changes:
deploy/delete-user.sh --email parent@example.com --dry-run

# 2) Delete for real — prompts you to retype the email to confirm:
deploy/delete-user.sh --email parent@example.com

# You can target by user id instead of email:
deploy/delete-user.sh --user-id <uuid> --dry-run
```

Useful flags: `--yes` skips the confirmation prompt (for scripted runs); `--db <path>` points at a different DB file. A real delete runs `wal_checkpoint(TRUNCATE)` afterward so the change is reflected in the main `.db` file (and the next backup) immediately. Take a [backup](#backups) before a live delete if you want a rollback point.

**What it covers** — every user-keyed table, deleted in this order:

| Table | Matched by |
|---|---|
| `plan_day_logs` | the user's `plans` (`plan_id`) |
| `weekly_checkins` | `user_id` |
| `plans` | `user_id` |
| `quiz_sessions` | `user_id` **and** transitively via `plans.quiz_session_id` — in the anonymous quiz→checkout funnel `quiz_sessions.user_id` is often `NULL`, so following the plan link is what actually catches the parent's quiz answers |
| `payments` | `user_id` |
| `partner_network_events` | `external_payment_id` — the user's Stripe invoice ids (from `payments.stripe_session_id`), gathered before `payments` is deleted |
| `analytics_events` | `user_id` (anonymous, `session_id`-only events have no `user_id` and are not PII) |
| `auth_tokens` | `user_id` (legacy magic-link) |
| `users` | the row itself, deleted last |

`stripe_events` is **not** in this list by design: raw webhook bodies are **PII-redacted at write time** (payer email/name/address stripped in `src/lib/payments/stripe-events.ts`), so the audit log holds no personal data to erase. Its growth is capped by retention pruning (below), not by per-user deletion.

If the email/id resolves to no `users` row, the tool exits cleanly with a note — a parent who quizzed but never signed in may have only an **anonymous** plan/session that cannot be tied back to them.

**Retention pruning.** [`scripts/prune-analytics.mjs`](scripts/prune-analytics.mjs) (run it on a cron) deletes aged rows from `analytics_events` (`ANALYTICS_RETENTION_DAYS`, default 180), `stripe_events` (`STRIPE_EVENTS_RETENTION_DAYS`, default 90), and already-delivered `partner_network_events` (`PARTNER_EVENTS_RETENTION_DAYS`, default 365; pending retries are kept). This bounds data retention independent of individual deletion requests.

#### Step 2 — delete the user in Clerk (REQUIRED — not done by the tool)

> **Do not skip this.** The local tool cannot touch Clerk. Until you remove the user in Clerk, their **email and auth identity still exist** and the request is **not** fully honored.

Delete them via **Clerk Dashboard → Users → (search the email) → Delete user**, or via the [Clerk Backend API](https://clerk.com/docs/reference/backend-api) (`DELETE /v1/users/{user_id}` with the production `CLERK_SECRET_KEY`). Clerk also sends/holds the auth email, so this is the only place that identity lives once Step 1 is done.

Completing both steps satisfies the 30-day deletion commitment in the privacy policy.

---

## Going live with real billing — LIVE since 2026-06-16

Billing is **LIVE and enforced** as of 2026-06-16: real Stripe keys (`sk_live_…`),
no `DEV_BYPASS_PAYWALL`, so the `requireActiveSubscription` gate redirects
non-subscribers to `/pricing`. The historical postures (for reference / rollback):

| Posture | Config | Checkout | Gate |
|---|---|---|---|
| Mock (original soft launch) | `DEV_BYPASS_PAYWALL=true`, no `STRIPE_SECRET_KEY` | mock pass-through to success | open |
| Sandbox rehearsal (2026-06-03 → 06-16) | `DEV_BYPASS_PAYWALL=true` + `sk_test_…` + `whsec_…` | **real Stripe TEST page** (test cards only, e.g. 4242…, no real charges) | open |
| **Live (current, since 2026-06-16)** | no bypass + `sk_live_…` + `whsec_…` | **real charges** | **enforced** |

**Live wiring (as deployed):** account `acct_1TeDDpCTFWUpZUq0` ("Tiny Plan", GB,
`charges_enabled`/`card_payments: active`). Live webhook endpoint
`we_1Tj0TjCTFWUpZUq0YjKYD3LU` → `https://tinyplan.org/api/webhooks/stripe`
(events: checkout.session.completed, customer.subscription.{created,updated,deleted},
invoice.{paid,payment_failed}, charge.refunded, charge.dispute.created — the last
two drive the affiliate clawbacks). The deployed server's `STRIPE_WEBHOOK_SECRET`
was verified to match by posting a live-signed event and getting `200 {received:true}`.

**Step 5 (the anonymous-buyer race) is CLOSED in code:** `requireActiveSubscription`
now calls `reconcileSubscriptionFromStripe` (`src/lib/auth/subscription-sync.ts`) —
when a just-signed-up buyer's row is still `free` and their webhook hasn't landed,
the gate looks them up in Stripe by email and grants `trial`/`active` synchronously
(best-effort; fail-safe to the pricing redirect; scoped to rows < 1h old so it never
hits Stripe for established free users).

The preflight allows the test-key+bypass combo (warns `SANDBOX BILLING REHEARSAL`) but **throws** on a live key + bypass. The gate stays open during rehearsal deliberately: webhook events for anonymous checkouts arrive **before** the buyer's local user exists (they sign up after paying), so enforcing the gate now would lock fresh buyers out as `free` — that sync gap must be solved before going live (see step 5). The current test-mode webhook endpoint is `we_1TeJutFou4z0rzpRLwlgPgrD`.

`isBillingEnforced()` returns `false` while the bypass is on, so the `requireActiveSubscription()` gate in the dashboard layout is a no-op. The webhook is already implemented at `POST /api/webhooks/stripe` — it verifies the signature with `STRIPE_WEBHOOK_SECRET`, writes idempotent `payments` rows (keyed on the Stripe invoice id), and maps Stripe statuses onto our enum (`trialing → trial`; `active`/`past_due → active`; `canceled`/`unpaid`/`incomplete_expired → cancelled`), resolving the user by `metadata.userId` then lowercased email.

The `$1-for-7-days → $14.99/month` model was **validated in Stripe test mode** with a test clock: $1.00 charged at checkout (the `subscription_create` invoice), $14.99 at trial end (`subscription_cycle`), then the subscription goes `active`.

What the 2026-06-16 go-live did:
1. ✅ Set `STRIPE_SECRET_KEY=sk_live_…` **and** `STRIPE_WEBHOOK_SECRET=whsec_…` in `.env.production`; **removed** `DEV_BYPASS_PAYWALL`. (The startup preflight throws if the Stripe key is set without the webhook secret, and throws on LIVE key + `DEV_BYPASS_PAYWALL=true`.)
2. ✅ Registered the LIVE webhook endpoint `we_1Tj0TjCTFWUpZUq0YjKYD3LU` → `https://tinyplan.org/api/webhooks/stripe` and put its signing secret in `STRIPE_WEBHOOK_SECRET`. Verified the deployed secret matches (live-signed event → `200 {received:true}`).
3. ✅ `npm run build && systemctl restart tinyplan` — clean boot, no preflight throw.
5. ✅ Anonymous-buyer race closed in code (see `reconcileSubscriptionFromStripe`, above).

**Remaining operator action — the one thing left:**
4. ⏳ **Re-verify the charge timeline on the LIVE account with a real run** before relying on the first organic customer: complete one real anonymous quiz → checkout (a real card; the up-front charge is only **$1**) → Clerk sign-up → confirm the dashboard is reachable (gate passes) and that the `$14.99` renewal lands at trial end (use a real card you control, or a Stripe **test clock is TEST-mode only** so it can't validate the live account). Then refund the $1 from the Stripe dashboard if desired.

> **Rollback:** to revert to sandbox/soft-launch, restore `.env.production` from `.env.production.bak.golive.*`, `npm run build && systemctl restart tinyplan`. (The live webhook endpoint can stay; it simply stops receiving once the key changes.)

---

## Disaster recovery — stand it up again

On a fresh Ubuntu box (or after a wipe):
1. Install: `Node 22` (NodeSource), `build-essential python3` (for the better-sqlite3 native build), `sqlite3`, and `caddy`.
2. `git clone` the repo to the app dir; `cp` your saved `.env.production` in (and restore the latest DB backup to `data/tinyplan.db`).
3. `npm ci && npm run build`.
4. Install `deploy/tinyplan.service` → `/etc/systemd/system/`, adjust `WorkingDirectory`/port if needed, `systemctl enable --now tinyplan`.
5. Add the `tinyplan.org` vhost from `deploy/Caddyfile` to your Caddyfile, `caddy validate`, `systemctl reload caddy`.
6. Point DNS (apex + www A records, Clerk CNAMEs) at the new IP.

`npm ci` rebuilds the `better-sqlite3` native addon for the box's Node/arch — do **not** copy `node_modules` from another machine.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Every page 500s | Clerk keys invalid/mismatched, or `CLERK_SECRET_KEY` missing → `journalctl -u tinyplan -e`. Both keys must be from the **same** Clerk production instance. |
| Service crash-loops on restart | The build was made with wrong/placeholder Clerk env. Rebuild with the real `.env.production`, then restart. |
| `npm run build` throws about `NEXT_PUBLIC_APP_URL`/Clerk key | Intended guard — fix `.env.production` (or `SKIP_ENV_VALIDATION=1` to bypass). |
| Links/emails point at localhost or the wrong host | Rebuilt without the right `NEXT_PUBLIC_APP_URL`; rebuild. |
| `tinyplan.org` TLS "internal error" | Caddy has no cert yet — check the apex A record points here and `journalctl -u caddy | grep -i tinyplan`. |
| Caddy stuck "reloading" after an edit | A bad block (often a `log` file permission). Fix the config, `caddy validate`, then `systemctl restart caddy`. |
| Clerk sign-in fails in the browser | Clerk production domain not verified, or the `clerk.`/`accounts.` CNAMEs not propagated. |
| Data disappeared after a restart | `WorkingDirectory` isn't the app root, so `./data` resolved elsewhere. It must be `/root/parentpath`. |
| `/admin` redirects you away | Your Clerk email isn't in `ADMIN_EMAILS` (fail-closed). |
