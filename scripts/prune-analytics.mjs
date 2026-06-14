#!/usr/bin/env node
import path from 'node:path';
import Database from 'better-sqlite3';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
try {
  const fs = await import('node:fs');
  for (const line of fs.readFileSync(path.join(repoRoot, '.env.production'), 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
} catch {
  // .env.production is optional for local copies; defaults below still work.
}
const dbPath = process.env.DATABASE_PATH || path.join(repoRoot, 'data', 'tinyplan.db');
const DAY_MS = 24 * 60 * 60 * 1000;
const nowMs = Date.now();

// Retention windows (override via env). Note the differing time units: see below.
const analyticsRetentionDays = Number(process.env.ANALYTICS_RETENTION_DAYS || '180');
const stripeEventsRetentionDays = Number(process.env.STRIPE_EVENTS_RETENTION_DAYS || '90');
const partnerEventsRetentionDays = Number(process.env.PARTNER_EVENTS_RETENTION_DAYS || '365');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function tableExists(name) {
  return !!db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name);
}

function prune(table, sql, ...params) {
  if (!tableExists(table)) return 0;
  try {
    return db.prepare(sql).run(...params).changes;
  } catch (err) {
    console.error(`[prune] ${table} failed:`, err.message);
    return 0;
  }
}

// analytics_events.created_at is in MILLISECONDS (see CLAUDE.md).
const analyticsDeleted = prune(
  'analytics_events',
  'DELETE FROM analytics_events WHERE created_at IS NOT NULL AND created_at < ?',
  nowMs - analyticsRetentionDays * DAY_MS
);

// stripe_events.created_at and partner_network_events.created_at are in SECONDS.
// stripe_events payloads are PII-redacted at write time, but we still cap their
// retention so the audit log does not grow without bound.
const stripeDeleted = prune(
  'stripe_events',
  'DELETE FROM stripe_events WHERE created_at IS NOT NULL AND created_at < ?',
  Math.floor((nowMs - stripeEventsRetentionDays * DAY_MS) / 1000)
);

// Keep pending affiliate retries; only prune deliveries that already succeeded.
const partnerDeleted = prune(
  'partner_network_events',
  "DELETE FROM partner_network_events WHERE status = 'sent' AND created_at IS NOT NULL AND created_at < ?",
  Math.floor((nowMs - partnerEventsRetentionDays * DAY_MS) / 1000)
);

db.pragma('wal_checkpoint(TRUNCATE)');

const summary = [
  analyticsDeleted && `analytics=${analyticsDeleted}`,
  stripeDeleted && `stripe_events=${stripeDeleted}`,
  partnerDeleted && `partner_network_events=${partnerDeleted}`,
].filter(Boolean);
if (summary.length > 0) {
  console.log(`[prune] ${summary.join(' ')}`);
}
