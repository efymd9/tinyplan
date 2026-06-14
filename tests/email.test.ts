import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail } from '../src/lib/auth/email';

test('normalizeEmail lowercases and trims', () => {
  assert.equal(normalizeEmail('  Bob@Example.COM '), 'bob@example.com');
});

test('normalizeEmail returns empty string for blank/nullish input', () => {
  assert.equal(normalizeEmail(null), '');
  assert.equal(normalizeEmail(undefined), '');
  assert.equal(normalizeEmail('   '), '');
});

test('normalizeEmail is idempotent', () => {
  const once = normalizeEmail('A.User@Mail.com');
  assert.equal(normalizeEmail(once), once);
});
