import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidClickId } from '../src/lib/partner-click';

test('accepts well-formed affiliate click ids', () => {
  assert.equal(isValidClickId('abc-123_x.y'), true);
  assert.equal(isValidClickId('a'), true);
  assert.equal(isValidClickId('A'.repeat(128)), true);
});

test('rejects malformed / tampered click ids', () => {
  assert.equal(isValidClickId(''), false);
  assert.equal(isValidClickId(null), false);
  assert.equal(isValidClickId(undefined), false);
  assert.equal(isValidClickId('has space'), false);
  assert.equal(isValidClickId('a;b=c'), false);
  assert.equal(isValidClickId('<script>'), false);
  assert.equal(isValidClickId('A'.repeat(129)), false);
});
