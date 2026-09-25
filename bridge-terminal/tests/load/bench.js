'use strict';
/**
 * Preregistered local workload (series I053), corrected for hermit.vws.v2.
 * Loopback only; measures THIS machine, not a deployment.
 *   W1 keystroke echo round-trip latency
 *   W2 bulk output throughput + exact application-frame overhead (7-byte v2 header/frame)
 *   W3 concurrent sessions + backend-aware memory telemetry
 */
const os = require('node:os');
const { startGateway, Client, sleep } = require('../helpers');
const pct = (a, p) => a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))];
const statsMiB = (vals) => vals.length ? ({ samples: vals.length, min: +(Math.min(...vals)/1048576).toFixed(2), max: +(Math.max(...vals)/1048576).toFixed(2), mean: +(vals.reduce((a,b)=>a+b,0)/vals.length/1048576).toFixed(2) }) : ({ samples: 0, min: null, max: null, mean: null });

(async () => {
  const S = parseInt(process.env.BENCH_SESSIONS || '8', 10);
  if (!Number.isInteger(S) || S < 1 || S > 256) throw new Error('BENCH_SESSIONS must be an integer in 1..256');
  // One client connection per session, same principal: raise BOTH session and connection policy ceilings.
  const g = await startGateway({ maxSessions: S, maxSessionsPerPrincipal: S, maxConnectionsPerPrincipal: S, msgRate: 5000 });
  const out = { scope: 'loopback, single host, in-process gateway; not a deployment measurement', protocol: 'hermit.vws.v2', workerBackend: g.cfg.workerBackend, requestedSessions: S, admittedSessionCap: g.gw.registry.sessionCap, node: process.version, platform: `${os.platform()} ${os.release()}`, cpus: os.cpus().length, cpuModel: os.cpus()[0] && os.cpus()[0].model, date: new Date().toISOString() };
  if (S > g.gw.registry.sessionCap) throw new Error(`host memory plan admits ${g.gw.registry.sessionCap} sessions, benchmark requested ${S}`);

  const c = await new Client(g.url, g.tokens.alice).open(); const lat = [];
  for (let i = 0; i < 300; i++) { const n = c.type('terminal.output').length; const t0 = process.hrtime.bigint(); c.input('x'); await c.until(() => c.type('terminal.output').length > n, 5000); lat.push(Number(process.hrtime.bigint() - t0) / 1e6); if (i % 50 === 49) { c.input('\x15'); await sleep(20); } }
  out.W1_echo_roundtrip_ms = { samples: lat.length, p50: +pct(lat, 0.5).toFixed(3), p95: +pct(lat, 0.95).toFixed(3), p99: +pct(lat, 0.99).toFixed(3), max: +Math.max(...lat).toFixed(3) };
  c.input('\x15');

  const before = c.out.length; const frames0 = c.outputs.length; const t0 = Date.now();
  c.input('seq 1 400000; seq 1 400000; echo BULK-END\r');
  await c.until(() => /400000\r\nBULK-END\r\n/.test(c.out.subarray(Math.max(before, c.out.length - 96)).toString()), 120000);
  const bytes = c.out.length - before, frames = c.outputs.length - frames0, secs = (Date.now() - t0) / 1000;
  const appFrameBytes = bytes + frames * 7;
  out.W2_bulk_output = { rawBytes: bytes, frames, seconds: +secs.toFixed(2), MiBps: +(bytes / 1048576 / secs).toFixed(2), applicationProtocolBytes: appFrameBytes, applicationProtocolExpansion: +(appFrameBytes / bytes).toFixed(6), dataHeaderBytesPerFrame: 7, note: 'v2 binary data frames; expansion is exact at the Harbor application-frame layer and excludes RFC6455/TCP/TLS overhead' };
  c.close(); await sleep(300);

  const base = process.memoryUsage().rss; const opens = []; const clients = [];
  for (let i = 0; i < S; i++) { const t = Date.now(); clients.push(await new Client(g.url, g.tokens.alice).open()); opens.push(Date.now() - t); }
  // Trigger worker pings now rather than waiting for the periodic 5s telemetry interval.
  for (const conn of g.gw.registry.conns) if (typeof conn._pingWorker === 'function') conn._pingWorker();
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline && [...g.gw.registry.conns].some((x) => !x.usage || !x.usage.memory)) await sleep(25);
  const mem = [...g.gw.registry.conns].map((x) => x.usage && x.usage.memory).filter(Boolean);
  const heapUsed = mem.map((m)=>m.heapUsedBytes).filter(Number.isFinite);
  const workerRss = mem.map((m)=>m.rssBytes).filter(Number.isFinite);
  out.W3_concurrency = {
    sessions: S,
    open_ms: { p50: pct(opens, 0.5), max: Math.max(...opens) },
    workerMemory: g.cfg.workerBackend === 'thread'
      ? { metric: 'per-worker isolate heapUsedMiB', scope: 'V8 isolate; RSS is shared by the gateway process and is intentionally not attributed per thread', ...statsMiB(heapUsed) }
      : { metric: 'per-worker process rssMiB', scope: 'child-process RSS', ...statsMiB(workerRss) },
    gatewayRssMiB: { before: +(base / 1048576).toFixed(1), withSessions: +(process.memoryUsage().rss / 1048576).toFixed(1), scope: g.cfg.workerBackend === 'thread' ? 'gateway process including worker threads' : 'gateway process excluding child-worker RSS' },
    note: 'gateway RSS also includes this benchmark harness and its in-process clients'
  };
  clients.forEach((x) => x.close()); await sleep(300); await g.stop();
  console.log(JSON.stringify(out, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
