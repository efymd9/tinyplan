import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clientIp } from '../src/lib/request-ip';

const h = (obj: Record<string, string>) => new Headers(obj);

test('takes the rightmost X-Forwarded-For entry (the trusted proxy hop)', () => {
  assert.equal(clientIp(h({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })), '5.6.7.8');
});

test('a spoofed leftmost XFF cannot mint a fresh identity per request', () => {
  // Caddy appends the real client IP last, so two attacker-supplied leftmost
  // values resolve to the SAME identity — the rate limiter is not bypassable.
  const a = clientIp(h({ 'x-forwarded-for': 'evil-a, 9.9.9.9' }));
  const b = clientIp(h({ 'x-forwarded-for': 'evil-b, 9.9.9.9' }));
  assert.equal(a, '9.9.9.9');
  assert.equal(a, b);
});

test('a single entry is returned as-is', () => {
  assert.equal(clientIp(h({ 'x-forwarded-for': '9.9.9.9' })), '9.9.9.9');
});

test('no forwarding header returns "unknown"', () => {
  assert.equal(clientIp(h({})), 'unknown');
});
