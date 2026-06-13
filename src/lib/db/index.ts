import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.resolve(process.cwd(), 'data', 'tinyplan.db');

let _db: BetterSQLite3Database<typeof schema> | null = null;
let _sqlite: Database.Database | null = null;

function ensureDataDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createTables(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      locale TEXT DEFAULT 'en',
      stripe_customer_id TEXT,
      subscription_status TEXT DEFAULT 'free',
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS auth_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      token TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used INTEGER DEFAULT 0,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS quiz_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      answers_json TEXT NOT NULL,
      tags_json TEXT,
      play_profile TEXT,
      completed INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      age_min INTEGER,
      age_max INTEGER,
      goal_tags TEXT,
      play_style_tags TEXT,
      routine_moment_tags TEXT,
      time_minutes INTEGER,
      materials TEXT,
      location TEXT,
      energy_level TEXT,
      steps_json TEXT,
      parent_script TEXT,
      fallback_if_refuses TEXT,
      easier_version TEXT,
      harder_version TEXT,
      why_it_works TEXT,
      safety_note TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      quiz_session_id TEXT REFERENCES quiz_sessions(id),
      profile_name TEXT,
      goal TEXT,
      plan_json TEXT NOT NULL,
      week_number INTEGER DEFAULT 1,
      active INTEGER DEFAULT 1,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS plan_day_logs (
      id TEXT PRIMARY KEY,
      plan_id TEXT REFERENCES plans(id),
      day_number INTEGER,
      activity_id TEXT REFERENCES activities(id),
      status TEXT,
      completed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      stripe_session_id TEXT,
      stripe_subscription_id TEXT,
      amount_cents INTEGER,
      currency TEXT DEFAULT 'usd',
      status TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS stripe_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      livemode INTEGER DEFAULT 0,
      payload_json TEXT NOT NULL,
      processed_at INTEGER,
      error TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS partner_network_events (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      external_payment_id TEXT,
      payload_json TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      last_error TEXT,
      next_attempt_at INTEGER,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS weekly_checkins (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      plan_id TEXT REFERENCES plans(id),
      responses_json TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      session_id TEXT,
      event_name TEXT NOT NULL,
      properties_json TEXT,
      path TEXT,
      referrer TEXT,
      user_agent TEXT,
      created_at INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
    CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_session_id_unique
      ON payments(stripe_session_id)
      WHERE stripe_session_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(type);
    CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at ON stripe_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_partner_network_events_status_next_attempt
      ON partner_network_events(status, next_attempt_at);
  `);
}

// Adds columns introduced after the initial schema to databases that already
// exist. CREATE TABLE IF NOT EXISTS never alters an existing table, so new
// columns must be backfilled explicitly. Each ALTER is a no-op once applied.
function migrateSchema(sqlite: Database.Database) {
  const analyticsColumns = sqlite
    .prepare(`PRAGMA table_info(analytics_events)`)
    .all() as { name: string }[];
  const existing = new Set(analyticsColumns.map((c) => c.name));

  const additions: Record<string, string> = {
    path: 'TEXT',
    referrer: 'TEXT',
    user_agent: 'TEXT',
  };

  for (const [column, type] of Object.entries(additions)) {
    if (!existing.has(column)) {
      sqlite.exec(`ALTER TABLE analytics_events ADD COLUMN ${column} ${type}`);
    }
  }
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (_db) return _db;

  ensureDataDir();

  _sqlite = new Database(DB_PATH);
  _sqlite.pragma('journal_mode = WAL');
  _sqlite.pragma('foreign_keys = ON');

  createTables(_sqlite);
  migrateSchema(_sqlite);

  _db = drizzle(_sqlite, { schema });
  return _db;
}

export function closeDb() {
  if (_sqlite) {
    _sqlite.close();
    _sqlite = null;
    _db = null;
  }
}

export { schema };
