#!/usr/bin/env node
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3002';

async function check(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`not ok - ${name}`);
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}

async function request(path, init) {
  return fetch(`${base}${path}`, { redirect: 'manual', ...init });
}

await check('root redirects or serves a locale', async () => {
  const res = await request('/');
  if (![200, 307, 308].includes(res.status)) {
    throw new Error(`expected 200/307/308, got ${res.status}`);
  }
});

await check('Spanish landing page is reachable', async () => {
  const res = await request('/es');
  if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
});

await check('English landing page is reachable', async () => {
  const res = await request('/en');
  if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
});

await check('dashboard is auth-gated', async () => {
  const res = await request('/es/dashboard');
  if (![302, 307, 308].includes(res.status)) {
    throw new Error(`expected auth redirect, got ${res.status}`);
  }
  const location = res.headers.get('location') || '';
  if (!location.includes('sign-in')) {
    throw new Error(`expected redirect to sign-in, got ${location || '(none)'}`);
  }
});

await check('chat endpoint accepts a simple coaching request', async () => {
  const res = await request('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'bedtime meltdown', locale: 'en' }),
  });
  if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
  const json = await res.json();
  if (!json.response) throw new Error('missing response payload');
});

await check('analytics rejects malformed event payloads', async () => {
  const res = await request('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (res.status !== 400) throw new Error(`expected 400, got ${res.status}`);
});

if (process.exitCode) process.exit(process.exitCode);
console.log(`Smoke tests passed against ${base}`);
