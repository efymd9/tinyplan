#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
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
const dbPath = process.env.DATABASE_PATH || path.join(repoRoot, 'data', 'tinyplan.db');
const networkUrl = process.env.PN_NETWORK_URL || 'https://partnernetwork.space';
const offerKey = process.env.PN_OFFER_KEY || '';
const signingSecret = process.env.PN_SIGNING_SECRET || '';
const limit = Number(process.env.PN_RETRY_LIMIT || '25');
const maxAttempts = Number(process.env.PN_RETRY_MAX_ATTEMPTS || '10');

if (!offerKey || !signingSecret) {
  console.log('[partner-network-retry] PN credentials not configured; nothing to send.');
  process.exit(0);
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const now = Math.floor(Date.now() / 1000);
const rows = db.prepare(`
  SELECT * FROM partner_network_events
  WHERE status = 'pending'
    AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
  ORDER BY created_at ASC
  LIMIT ?
`).all(now, limit);

function signedHeaders(rawBody) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(12).toString('hex');
  const sig = crypto
    .createHmac('sha256', signingSecret)
    .update(`${ts}.${nonce}.${rawBody}`)
    .digest('hex');
  return {
    'Content-Type': 'application/json',
    'X-Offer-Key': offerKey,
    'X-Ingest-Timestamp': ts,
    'X-Ingest-Nonce': nonce,
    'X-Ingest-Signature': sig,
  };
}

function endpointFor(kind) {
  if (kind === 'conversion') return '/api/ingest/conversion';
  if (kind === 'refund') return '/api/ingest/refund';
  if (kind === 'chargeback') return '/api/ingest/chargeback';
  throw new Error(`unknown partner network event kind: ${kind}`);
}

let sent = 0;
let failed = 0;
let deadLettered = 0;

for (const row of rows) {
  const attempts = Number(row.attempts || 0) + 1;
  let permanent = false;
  let errMsg = '';
  try {
    const res = await fetch(`${networkUrl}${endpointFor(row.kind)}`, {
      method: 'POST',
      headers: signedHeaders(row.payload_json),
      body: row.payload_json,
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      db.prepare(`
        UPDATE partner_network_events
        SET status = 'sent', attempts = ?, last_error = NULL, next_attempt_at = NULL, updated_at = ?
        WHERE id = ?
      `).run(attempts, now, row.id);
      sent += 1;
      continue;
    }
    errMsg = `${res.status} ${await res.text().catch(() => '')}`.trim();
    // 4xx (except 429 Too Many Requests) means the request is rejected/malformed
    // — retrying won't help, so dead-letter it instead of looping forever.
    if (res.status >= 400 && res.status < 500 && res.status !== 429) permanent = true;
  } catch (err) {
    errMsg = err instanceof Error ? err.message : String(err);
  }

  if (permanent || attempts >= maxAttempts) {
    // Dead-letter: mark 'failed' so it leaves the retry queue. Operators can
    // inspect failed rows; last_error records why.
    db.prepare(`
      UPDATE partner_network_events
      SET status = 'failed', attempts = ?, last_error = ?, next_attempt_at = NULL, updated_at = ?
      WHERE id = ?
    `).run(attempts, errMsg, now, row.id);
    deadLettered += 1;
  } else {
    const delay = Math.min(24 * 60 * 60, 5 * 60 * Math.pow(2, Math.min(attempts - 1, 8)));
    db.prepare(`
      UPDATE partner_network_events
      SET attempts = ?, last_error = ?, next_attempt_at = ?, updated_at = ?
      WHERE id = ?
    `).run(attempts, errMsg, now + delay, now, row.id);
    failed += 1;
  }
}

if (rows.length || sent || failed || deadLettered) {
  console.log(`[partner-network-retry] scanned=${rows.length} sent=${sent} failed=${failed} dead_lettered=${deadLettered}`);
}
