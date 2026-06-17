#!/usr/bin/env bash
# TinyPlan liveness + error backstop. Designed to run from cron every minute.
#
# This is a LOCAL backstop, not a full monitoring stack. For REAL paging (incl.
# the "box is down / cron itself is dead" case a local script can never catch),
# set HEALTHCHECK_PING_URL to a free Healthchecks.io (or BetterUptime) check URL:
# the script pings <url> when healthy and <url>/fail on trouble, so a MISSING
# ping also alerts. Also keep an external HTTP uptime monitor on
# https://tinyplan.org/ and enable Stripe Dashboard webhook-failure alerts.
#
# Install:
#   chmod +x /root/parentpath/deploy/health-check.sh
#   ( crontab -l 2>/dev/null | grep -v health-check.sh; \
#     echo '* * * * * HEALTHCHECK_PING_URL= /root/parentpath/deploy/health-check.sh >> /root/backups/health-cron.log 2>&1' ) | crontab -
set -u

LOG=/root/backups/health.log
PING="${HEALTHCHECK_PING_URL:-}"
ts() { date -u +%FT%TZ; }

# 1) Liveness — the app answers on the loopback (Caddy proxies to :3002).
if ! curl -fsS -o /dev/null --max-time 8 http://127.0.0.1:3002/; then
  echo "$(ts) DOWN: tinyplan did not answer on 127.0.0.1:3002" >> "$LOG"
  [ -n "$PING" ] && curl -fsS -m 8 "${PING}/fail" --data-raw "tinyplan DOWN" >/dev/null 2>&1
  exit 1
fi

# 2) Error backstop — surface recent in-app errors that still return 200
#    (broken checkout/webhook handler, OOM, unhandled rejection).
ERRS=$(journalctl -u tinyplan --since "-2min" --no-pager 2>/dev/null \
  | grep -ciE 'error handling|signature verification failed|FATAL|UnhandledPromiseRejection|out of memory|Checkout adopt error|Checkout error' || true)
if [ "${ERRS:-0}" -gt 0 ]; then
  echo "$(ts) WARN: ${ERRS} tinyplan error line(s) in the last 2min" >> "$LOG"
  [ -n "$PING" ] && curl -fsS -m 8 "${PING}/fail" --data-raw "tinyplan errors: ${ERRS}" >/dev/null 2>&1
  exit 0
fi

# Healthy — send the heartbeat (dead-man's switch).
[ -n "$PING" ] && curl -fsS -m 8 "$PING" >/dev/null 2>&1
exit 0
