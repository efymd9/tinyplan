#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// TinyPlan — operator data-deletion tool (GDPR / CCPA / PIPEDA / COPPA)
//
// Deletes ALL of a single user's data from the local SQLite database
// (data/tinyplan.db) in foreign-key-safe order, across every user-keyed table.
//
// Usage:
//   node scripts/delete-user.mjs --email user@example.com [--dry-run]
//   node scripts/delete-user.mjs --user-id <uuid>          [--dry-run]
//
// Prefer the wrapper: deploy/delete-user.sh --email ... --dry-run
//
//   --dry-run   Resolve the user and COUNT every row that would be deleted,
//               but make NO changes. ALWAYS run this first.
//   --db <path> Override the database path (default: data/tinyplan.db
//               relative to the repo root, regardless of cwd).
//   --yes       Skip the interactive confirmation prompt on a real delete
//               (e.g. for non-interactive/scripted runs).
//
// IMPORTANT — this tool deletes the LOCAL application data only. Clerk holds a
// PARALLEL identity (the user's email + auth credentials). To fully honor a
// deletion request you MUST ALSO delete the user in Clerk (dashboard or Backend
// API). See DEPLOY.md → "Honoring data-deletion requests".
// ─────────────────────────────────────────────────────────────────────────────

import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import url from 'node:url';
import readline from 'node:readline';

// ── Argument parsing ─────────────────────────────────────────────────────────
function parseArgs(argv) {
  const out = { dryRun: false, yes: false, email: null, userId: null, db: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--dry-run':
        out.dryRun = true;
        break;
      case '--yes':
      case '-y':
        out.yes = true;
        break;
      case '--email':
        out.email = argv[++i];
        break;
      case '--user-id':
        out.userId = argv[++i];
        break;
      case '--db':
        out.db = argv[++i];
        break;
      case '--help':
      case '-h':
        out.help = true;
        break;
      default:
        // Allow `--email=foo` / `--user-id=foo` style too.
        if (a.startsWith('--email=')) out.email = a.slice('--email='.length);
        else if (a.startsWith('--user-id=')) out.userId = a.slice('--user-id='.length);
        else if (a.startsWith('--db=')) out.db = a.slice('--db='.length);
        else {
          console.error(`Unknown argument: ${a}`);
          out.error = true;
        }
    }
  }
  return out;
}

function usage() {
  console.log(`
TinyPlan data-deletion tool

  node scripts/delete-user.mjs --email <email>   [--dry-run] [--yes] [--db <path>]
  node scripts/delete-user.mjs --user-id <uuid>  [--dry-run] [--yes] [--db <path>]

ALWAYS run with --dry-run first to preview the row counts, then re-run without
it to perform the deletion. Deletes the LOCAL database record only — you must
ALSO delete the user in Clerk to fully honor a GDPR/CCPA request.
`);
}

// ── Default DB path: repo-root/data/tinyplan.db, independent of cwd ──────────
function defaultDbPath() {
  const here = path.dirname(url.fileURLToPath(import.meta.url)); // .../scripts
  const repoRoot = path.resolve(here, '..');
  return path.join(repoRoot, 'data', 'tinyplan.db');
}

// ── Interactive confirmation ─────────────────────────────────────────────────
function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    process.exit(0);
  }
  if (args.error) {
    usage();
    process.exit(2);
  }
  if (!args.email && !args.userId) {
    console.error('Error: provide exactly one of --email or --user-id.');
    usage();
    process.exit(2);
  }
  if (args.email && args.userId) {
    console.error('Error: provide --email OR --user-id, not both.');
    process.exit(2);
  }

  const dbPath = args.db ? path.resolve(args.db) : defaultDbPath();
  if (!fs.existsSync(dbPath)) {
    console.error(`Error: database not found at ${dbPath}`);
    process.exit(1);
  }

  // Open writable only when we actually intend to delete; readonly for dry-run.
  const db = new Database(dbPath, { readonly: args.dryRun });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  try {
    // ── Resolve the target user ─────────────────────────────────────────────
    // Email match is case-insensitive (emails are stored as entered, but
    // requests may differ in case).
    const user = args.userId
      ? db.prepare('SELECT id, email, subscription_status FROM users WHERE id = ?').get(args.userId)
      : db
          .prepare('SELECT id, email, subscription_status FROM users WHERE email = ? COLLATE NOCASE')
          .get(args.email);

    if (!user) {
      const ident = args.userId ? `user-id "${args.userId}"` : `email "${args.email}"`;
      console.error(`\nNo user found for ${ident}. Nothing to delete.`);
      console.error(
        'Note: if the person never signed in, they may have NO local user row at all — ' +
          'only an anonymous quiz_session/plan that cannot be tied back to them. ' +
          'If they DID sign in, also remember to remove them from Clerk.'
      );
      db.close();
      process.exit(1);
    }

    const userId = user.id;
    console.log(`\nMode:     ${args.dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE DELETE'}`);
    console.log(`Database: ${dbPath}`);
    console.log(`User:     ${user.email}`);
    console.log(`User ID:  ${userId}`);
    console.log(`Status:   ${user.subscription_status}\n`);

    // ── Gather the set of plan ids and quiz_session ids owned by this user ───
    // Plans are owned directly via plans.user_id. plan_day_logs hang off plans.
    const planRows = db.prepare('SELECT id, quiz_session_id FROM plans WHERE user_id = ?').all(userId);
    const planIds = planRows.map((r) => r.id);

    // quiz_sessions.user_id is frequently NULL in the anonymous funnel, so we
    // also follow plans.quiz_session_id transitively. Combine BOTH sources and
    // de-duplicate. Sessions linked only through a plan would otherwise be
    // left behind (they hold the parent's quiz answers — clearly their data).
    const sessionIds = new Set();
    for (const r of db.prepare('SELECT id FROM quiz_sessions WHERE user_id = ?').all(userId)) {
      sessionIds.add(r.id);
    }
    for (const r of planRows) {
      if (r.quiz_session_id) sessionIds.add(r.quiz_session_id);
    }
    const quizSessionIds = [...sessionIds];

    // ── Helpers to count / delete by an id list without giant IN() params ────
    // SQLite caps bound params (~999/32766). Our per-user sets are tiny, but
    // chunk anyway to stay correct for power users.
    const CHUNK = 400;
    function chunked(ids) {
      const chunks = [];
      for (let i = 0; i < ids.length; i += CHUNK) chunks.push(ids.slice(i, i + CHUNK));
      return chunks;
    }
    function countByIds(table, column, ids) {
      if (ids.length === 0) return 0;
      let total = 0;
      for (const chunk of chunked(ids)) {
        const placeholders = chunk.map(() => '?').join(',');
        const row = db
          .prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${column} IN (${placeholders})`)
          .get(...chunk);
        total += row.n;
      }
      return total;
    }
    function deleteByIds(table, column, ids) {
      if (ids.length === 0) return 0;
      let total = 0;
      for (const chunk of chunked(ids)) {
        const placeholders = chunk.map(() => '?').join(',');
        const info = db
          .prepare(`DELETE FROM ${table} WHERE ${column} IN (${placeholders})`)
          .run(...chunk);
        total += info.changes;
      }
      return total;
    }
    function countByValue(table, column, value) {
      return db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${column} = ?`).get(value).n;
    }

    // ── Pre-count every table (used for both dry-run output and live report) ─
    const counts = {
      plan_day_logs: countByIds('plan_day_logs', 'plan_id', planIds),
      weekly_checkins: countByValue('weekly_checkins', 'user_id', userId),
      plans: planIds.length,
      quiz_sessions: countByIds('quiz_sessions', 'id', quizSessionIds),
      payments: countByValue('payments', 'user_id', userId),
      analytics_events: countByValue('analytics_events', 'user_id', userId),
      auth_tokens: countByValue('auth_tokens', 'user_id', userId),
      users: 1,
    };

    const printCounts = (verb) => {
      console.log(`Rows ${verb}:`);
      // Print in deletion order so the operator sees the FK-safe sequence.
      const order = [
        'plan_day_logs',
        'weekly_checkins',
        'plans',
        'quiz_sessions',
        'payments',
        'analytics_events',
        'auth_tokens',
        'users',
      ];
      let total = 0;
      for (const t of order) {
        console.log(`  ${t.padEnd(18)} ${String(counts[t]).padStart(6)}`);
        total += counts[t];
      }
      console.log(`  ${'TOTAL'.padEnd(18)} ${String(total).padStart(6)}\n`);
    };

    if (args.dryRun) {
      printCounts('that WOULD be deleted');
      console.log('Dry run complete. No data was changed.');
      console.log(
        'Re-run without --dry-run to delete, then ALSO remove this user from Clerk.\n'
      );
      db.close();
      process.exit(0);
    }

    // ── Live delete: show the plan, confirm, then run in one transaction ─────
    printCounts('that WILL be deleted');

    if (!args.yes) {
      const answer = await confirm(
        `Type the user's email (${user.email}) to confirm permanent deletion: `
      );
      if (answer !== String(user.email).toLowerCase()) {
        console.log('Confirmation did not match. Aborting — no data was deleted.');
        db.close();
        process.exit(1);
      }
    }

    // Transaction: all-or-nothing. Order respects FK references:
    //   plan_day_logs → plans → quiz_sessions, plus the standalone user-keyed
    //   tables, then the users row last.
    const runDelete = db.transaction(() => {
      const deleted = {};
      deleted.plan_day_logs = deleteByIds('plan_day_logs', 'plan_id', planIds);
      deleted.weekly_checkins = db
        .prepare('DELETE FROM weekly_checkins WHERE user_id = ?')
        .run(userId).changes;
      deleted.plans = db.prepare('DELETE FROM plans WHERE user_id = ?').run(userId).changes;
      deleted.quiz_sessions = deleteByIds('quiz_sessions', 'id', quizSessionIds);
      deleted.payments = db.prepare('DELETE FROM payments WHERE user_id = ?').run(userId).changes;
      deleted.analytics_events = db
        .prepare('DELETE FROM analytics_events WHERE user_id = ?')
        .run(userId).changes;
      deleted.auth_tokens = db
        .prepare('DELETE FROM auth_tokens WHERE user_id = ?')
        .run(userId).changes;
      deleted.users = db.prepare('DELETE FROM users WHERE id = ?').run(userId).changes;
      return deleted;
    });

    const deleted = runDelete();

    // Replace the pre-counts with actual deleted counts for the final report.
    Object.assign(counts, deleted);
    console.log('');
    printCounts('DELETED');

    // Best-effort: collapse the WAL back into the main db file so a subsequent
    // backup/copy reflects the deletion immediately.
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
    } catch {
      /* non-fatal */
    }

    console.log('Local deletion complete.');
    console.log(
      `\nREQUIRED NEXT STEP: delete this user in Clerk too (email: ${user.email}).\n` +
        'The local DB no longer holds their data, but Clerk still has their identity\n' +
        '(email + auth) until you remove them in the Clerk dashboard or Backend API.\n'
    );
    db.close();
    process.exit(0);
  } catch (err) {
    console.error('\nDeletion failed (transaction rolled back, no partial changes):');
    console.error(err);
    try {
      db.close();
    } catch {
      /* ignore */
    }
    process.exit(1);
  }
}

main();
