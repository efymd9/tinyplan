import { test } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { migrateUserEmailsToLowercase } from '../src/lib/db/index';

function freshUsersDb() {
  const db = new Database(':memory:');
  db.exec(`CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL);`);
  return db;
}

function emailOf(db: Database.Database, id: string): string {
  return (db.prepare('select email from users where id = ?').get(id) as { email: string }).email;
}

test('lowercases historical mixed-case emails', () => {
  const db = freshUsersDb();
  db.prepare('insert into users (id, email) values (?, ?)').run('1', 'Bob@Example.com');
  db.prepare('insert into users (id, email) values (?, ?)').run('2', 'already@lower.com');

  migrateUserEmailsToLowercase(db);

  assert.equal(emailOf(db, '1'), 'bob@example.com');
  assert.equal(emailOf(db, '2'), 'already@lower.com');
  db.close();
});

test('skips rows whose lowercased email would collide, without throwing', () => {
  const db = freshUsersDb();
  db.prepare('insert into users (id, email) values (?, ?)').run('1', 'Bob@Example.com');
  db.prepare('insert into users (id, email) values (?, ?)').run('2', 'bob@example.com');

  assert.doesNotThrow(() => migrateUserEmailsToLowercase(db));

  // The already-lowercase row is intact; the colliding mixed-case row is left
  // untouched for manual reconciliation rather than crashing the migration.
  assert.equal(emailOf(db, '2'), 'bob@example.com');
  db.close();
});
