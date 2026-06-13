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
const retentionDays = Number(process.env.ANALYTICS_RETENTION_DAYS || '180');
const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
const result = db
  .prepare('DELETE FROM analytics_events WHERE created_at IS NOT NULL AND created_at < ?')
  .run(cutoffMs);
db.pragma('wal_checkpoint(TRUNCATE)');

if (result.changes > 0) {
  console.log(`[analytics-prune] deleted=${result.changes} retention_days=${retentionDays}`);
}
