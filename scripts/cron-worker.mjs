// Worker cron sederhana: memanggil /api/cron/run pada interval tetap.
// Jalankan: npm run cron:worker  (butuh CRON_BASE_URL & CRON_SECRET di env)

import { readFileSync } from 'node:fs';

// Muat .env manual (tanpa dependency).
try {
  const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
} catch {
  // .env opsional; env bisa datang dari shell.
}

const BASE = process.env.CRON_BASE_URL || 'http://localhost:3000';
const SECRET = process.env.CRON_SECRET;
const INTERVAL = Number(process.env.CRON_INTERVAL_SECONDS || '60') * 1000;
const RUN_ON_START = process.env.CRON_RUN_ON_START === 'true';

if (!SECRET) {
  console.error('[cron-worker] CRON_SECRET belum diisi. Berhenti.');
  process.exit(1);
}

async function tick() {
  try {
    const res = await fetch(`${BASE}/api/cron/run`, {
      method: 'POST',
      headers: { 'x-cron-secret': SECRET },
    });
    const json = await res.json();
    const t = json.total ?? {};
    console.log(
      `[cron-worker] ${new Date().toISOString()} ok=${json.ok} sent=${t.sent ?? 0} failed=${t.failed ?? 0}`
    );
  } catch (e) {
    console.error('[cron-worker] gagal:', e.message);
  }
}

console.log(`[cron-worker] mulai. target=${BASE} interval=${INTERVAL / 1000}s`);
if (RUN_ON_START) tick();
setInterval(tick, INTERVAL);
