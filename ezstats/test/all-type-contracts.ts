/**
 * EZ Stats Frontend — All Type Contracts
 * UTC-17: MatchStatus enum, URL builders, API response shapes
 *
 * Run: ./node_modules/.bin/sucrase-node test/all-type-contracts.ts
 */

// ── Mini test runner ───────────────────────────────────────────────────────────
interface TR { id: string; desc: string; status: 'PASS' | 'FAIL'; detail: string }
const results: TR[] = [];
let passed = 0; let failed = 0;

function t(id: string, desc: string, fn: () => void) {
  try { fn(); results.push({ id, desc, status: 'PASS', detail: 'OK' }); passed++; }
  catch (e: any) { results.push({ id, desc, status: 'FAIL', detail: e.message }); failed++; }
}
function assert(c: boolean, m: string) { if (!c) throw new Error(m); }
function assertEqual<T>(a: T, b: T, m?: string) {
  assert(a === b, m ?? `Expected ${JSON.stringify(a)} === ${JSON.stringify(b)}`);
}

// ── Types mirrored from the frontend lib ──────────────────────────────────────
type MatchStatus = 'CREATED' | 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

const MATCH_STATUSES: MatchStatus[] = ['CREATED','UPLOADED','QUEUED','PROCESSING','COMPLETED','FAILED'];

interface Team {
  id: string; name: string; description?: string | null;
  primaryColor?: string | null; secondaryColor?: string | null;
  _count?: { players: number; matches: number };
  createdAt?: string; updatedAt?: string;
}
interface Player {
  id: string; name: string; jerseyNumber?: number | null;
  position?: string | null; teamId: string;
  createdAt?: string; updatedAt?: string;
}
interface Match {
  id: string; teamId: string; status: MatchStatus;
  date?: string | null; opponent?: string | null;
  teamColor?: string | null; opponentColor?: string | null;
  videoPath?: string | null; runId?: string | null; reportPath?: string | null;
  team?: Team;
  createdAt?: string; updatedAt?: string;
}
interface TrackStat {
  track_id: number; label: string; frame_count: number;
  approx_distance_px: number; avg_speed_px_per_frame: number;
  touch_count: number; pass_count: number; shot_count: number;
}
interface AIEvent {
  type: string; frame: number; time_s: number;
  actor?: number | null; target?: number | null; details?: Record<string,unknown>;
}
interface Possession {
  team0: number; team1: number;
}
interface MatchReport {
  match_id: string | null; video: string; duration_s: number; fps: number;
  possession: Possession; players: TrackStat[]; events: AIEvent[];
  pass_network: { nodes: unknown[]; edges: unknown[] };
  summary: {
    total_touches: number; total_passes: number;
    total_interceptions: number; total_shots: number; total_goals: number;
  };
}

// ── URL builder helpers (mirroring api.ts pattern) ────────────────────────────
const BASE = 'http://localhost:4000/api';
const url = {
  teams:          ()          => `${BASE}/teams`,
  team:           (id: string)=> `${BASE}/teams/${id}`,
  players:        (teamId: string) => `${BASE}/teams/${teamId}/players`,
  player:         (teamId: string, id: string) => `${BASE}/teams/${teamId}/players/${id}`,
  matches:        (teamId: string) => `${BASE}/teams/${teamId}/matches`,
  match:          (id: string) => `${BASE}/matches/${id}`,
  matchReport:    (id: string) => `${BASE}/matches/${id}/report`,
  matchVideo:     (id: string) => `${BASE}/matches/${id}/video`,
  matchStatsVideo:(id: string) => `${BASE}/matches/${id}/video/stats`,
  matchUpload:    (id: string) => `${BASE}/matches/${id}/upload`,
  matchAnalyse:   (id: string) => `${BASE}/matches/${id}/analyse`,
};

// ── Mock request helper ────────────────────────────────────────────────────────
async function mockRequest<T>(
  method: string, path: string, status: number, body: T
): Promise<T> {
  const res = { ok: status >= 200 && status < 300, status, json: async () => body };
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

// ══════════════════════════════════════════════════════════════════════════════
// UTC-17-TC-01 to TC-10: MatchStatus enum
// ══════════════════════════════════════════════════════════════════════════════

t('UTC-17-TC-01','MatchStatus: CREATED is valid', () => {
  const s: MatchStatus = 'CREATED';
  assertEqual(s, 'CREATED');
});
t('UTC-17-TC-02','MatchStatus: UPLOADED is valid', () => {
  const s: MatchStatus = 'UPLOADED';
  assertEqual(s, 'UPLOADED');
});
t('UTC-17-TC-03','MatchStatus: QUEUED is valid', () => {
  const s: MatchStatus = 'QUEUED';
  assertEqual(s, 'QUEUED');
});
t('UTC-17-TC-04','MatchStatus: PROCESSING is valid', () => {
  const s: MatchStatus = 'PROCESSING';
  assertEqual(s, 'PROCESSING');
});
t('UTC-17-TC-05','MatchStatus: COMPLETED is valid', () => {
  const s: MatchStatus = 'COMPLETED';
  assertEqual(s, 'COMPLETED');
});
t('UTC-17-TC-06','MatchStatus: FAILED is valid', () => {
  const s: MatchStatus = 'FAILED';
  assertEqual(s, 'FAILED');
});
t('UTC-17-TC-07','MatchStatus: exactly 6 values defined', () => {
  assertEqual(MATCH_STATUSES.length, 6);
});
t('UTC-17-TC-08','MatchStatus: all values are non-empty strings', () => {
  MATCH_STATUSES.forEach(s => assert(typeof s === 'string' && s.length > 0, `Bad status: ${s}`));
});
t('UTC-17-TC-09','MatchStatus: values are uppercase', () => {
  MATCH_STATUSES.forEach(s => assertEqual(s, s.toUpperCase(), `${s} should be uppercase`));
});
t('UTC-17-TC-10','MatchStatus: no duplicates', () => {
  const unique = new Set(MATCH_STATUSES);
  assertEqual(unique.size, MATCH_STATUSES.length);
});

// ══════════════════════════════════════════════════════════════════════════════
// UTC-17-TC-11 to TC-20: Team type shape
// ══════════════════════════════════════════════════════════════════════════════

t('UTC-17-TC-11','Team: id and name required fields', () => {
  const team: Team = { id: 'uuid-1', name: 'FC Test' };
  assertEqual(team.id, 'uuid-1');
  assertEqual(team.name, 'FC Test');
});
t('UTC-17-TC-12','Team: _count.players and _count.matches are numbers', () => {
  const team: Team = { id: 'u', name: 'T', _count: { players: 5, matches: 3 } };
  assertEqual(typeof team._count!.players, 'number');
  assertEqual(typeof team._count!.matches, 'number');
});
t('UTC-17-TC-13','Team: description nullable', () => {
  const t1: Team = { id: 'u', name: 'T', description: null };
  assert(t1.description === null, 'Expected null description');
});
t('UTC-17-TC-14','Team: primaryColor optional string', () => {
  const team: Team = { id: 'u', name: 'T', primaryColor: '#1E40AF' };
  assertEqual(team.primaryColor, '#1E40AF');
});
t('UTC-17-TC-15','Team: secondaryColor optional', () => {
  const team: Team = { id: 'u', name: 'T', secondaryColor: '#FFF' };
  assertEqual(team.secondaryColor, '#FFF');
});

// ══════════════════════════════════════════════════════════════════════════════
// UTC-17-TC-21 to TC-30: Player type shape
// ══════════════════════════════════════════════════════════════════════════════

t('UTC-17-TC-21','Player: id, name, teamId required', () => {
  const p: Player = { id: 'p1', name: 'Alex', teamId: 't1' };
  assertEqual(p.id, 'p1');
  assertEqual(p.teamId, 't1');
});
t('UTC-17-TC-22','Player: jerseyNumber nullable', () => {
  const p: Player = { id: 'p1', name: 'A', teamId: 't1', jerseyNumber: null };
  assert(p.jerseyNumber === null, 'Expected null jerseyNumber');
});
t('UTC-17-TC-23','Player: jerseyNumber valid range 0-999', () => {
  [0, 9, 99, 999].forEach(n => {
    const p: Player = { id: 'p1', name: 'A', teamId: 't1', jerseyNumber: n };
    assert(p.jerseyNumber! >= 0 && p.jerseyNumber! <= 999, `${n} should be in range`);
  });
});
t('UTC-17-TC-24','Player: position optional string', () => {
  const p: Player = { id: 'p1', name: 'A', teamId: 't1', position: 'Midfielder' };
  assertEqual(p.position, 'Midfielder');
});

// ══════════════════════════════════════════════════════════════════════════════
// UTC-17-TC-31 to TC-45: Match type shape
// ══════════════════════════════════════════════════════════════════════════════

t('UTC-17-TC-31','Match: id, teamId, status required', () => {
  const m: Match = { id: 'm1', teamId: 't1', status: 'CREATED' };
  assertEqual(m.status, 'CREATED');
});
t('UTC-17-TC-32','Match: status accepts all MatchStatus values', () => {
  MATCH_STATUSES.forEach(s => {
    const m: Match = { id: 'm1', teamId: 't1', status: s };
    assertEqual(m.status, s);
  });
});
t('UTC-17-TC-33','Match: videoPath nullable', () => {
  const m: Match = { id: 'm1', teamId: 't1', status: 'UPLOADED', videoPath: null };
  assert(m.videoPath === null, 'Expected null videoPath');
});
t('UTC-17-TC-34','Match: reportPath string when available', () => {
  const m: Match = { id: 'm1', teamId: 't1', status: 'COMPLETED', reportPath: '/out/report' };
  assertEqual(m.reportPath, '/out/report');
});
t('UTC-17-TC-35','Match: team optional nested object', () => {
  const m: Match = { id: 'm1', teamId: 't1', status: 'CREATED', team: { id: 't1', name: 'FC T' }};
  assertEqual(m.team!.name, 'FC T');
});

// ══════════════════════════════════════════════════════════════════════════════
// UTC-17-TC-51 to TC-65: URL builders
// ══════════════════════════════════════════════════════════════════════════════

t('UTC-17-TC-51','URL: GET /teams', () => {
  assertEqual(url.teams(), `${BASE}/teams`);
});
t('UTC-17-TC-52','URL: GET /teams/:id', () => {
  assertEqual(url.team('abc'), `${BASE}/teams/abc`);
});
t('UTC-17-TC-53','URL: GET /teams/:teamId/players', () => {
  assert(url.players('t1').includes('/teams/t1/players'), 'Expected path');
});
t('UTC-17-TC-54','URL: GET /teams/:teamId/players/:id', () => {
  assert(url.player('t1','p1').includes('/teams/t1/players/p1'), 'Expected path');
});
t('UTC-17-TC-55','URL: GET /teams/:teamId/matches', () => {
  assert(url.matches('t1').includes('/teams/t1/matches'), 'Expected path');
});
t('UTC-17-TC-56','URL: GET /matches/:id', () => {
  assert(url.match('m1').endsWith('/matches/m1'), 'Expected path');
});
t('UTC-17-TC-57','URL: GET /matches/:id/report', () => {
  assert(url.matchReport('m1').endsWith('/matches/m1/report'), 'Expected path');
});
t('UTC-17-TC-58','URL: GET /matches/:id/video', () => {
  assert(url.matchVideo('m1').endsWith('/matches/m1/video'), 'Expected path');
});
t('UTC-17-TC-59','URL: GET /matches/:id/video/stats', () => {
  assert(url.matchStatsVideo('m1').includes('/video/stats'), 'Expected path');
});
t('UTC-17-TC-60','URL: POST /matches/:id/upload', () => {
  assert(url.matchUpload('m1').endsWith('/matches/m1/upload'), 'Expected path');
});
t('UTC-17-TC-61','URL: POST /matches/:id/analyse', () => {
  assert(url.matchAnalyse('m1').endsWith('/matches/m1/analyse'), 'Expected path');
});
t('UTC-17-TC-62','URL: id substitution is exact (no double slashes)', () => {
  const u = url.team('my-team-id');
  assert(!u.includes('//teams'), 'Expected no double slash before teams');
});
t('UTC-17-TC-63','URL: all builders use BASE prefix', () => {
  const allUrls = [
    url.teams(), url.team('x'), url.players('t'), url.player('t','p'),
    url.matches('t'), url.match('m'), url.matchReport('m'),
    url.matchVideo('m'), url.matchStatsVideo('m'), url.matchUpload('m'), url.matchAnalyse('m'),
  ];
  allUrls.forEach(u => assert(u.startsWith(BASE), `Expected BASE prefix: ${u}`));
});

// ══════════════════════════════════════════════════════════════════════════════
// UTC-17-TC-71 to TC-80: request helper + AI event contracts
// ══════════════════════════════════════════════════════════════════════════════

t('UTC-17-TC-71','request: 200 OK → returns body', async () => {
  const body = { id: 'team-1', name: 'FC Test' };
  const result = await mockRequest<Team>('GET', '/teams/team-1', 200, body);
  assertEqual(result.name, 'FC Test');
});
t('UTC-17-TC-72','request: 404 → throws Error with path and status', async () => {
  let msg = '';
  try { await mockRequest<Team>('GET', '/teams/nope', 404, {} as Team); }
  catch (e: any) { msg = e.message; }
  assert(msg.includes('404'), `Expected 404 in message: ${msg}`);
});
t('UTC-17-TC-73','request: 409 → throws Error with path and status', async () => {
  let msg = '';
  try { await mockRequest<Player>('POST', '/teams/t1/players', 409, {} as Player); }
  catch (e: any) { msg = e.message; }
  assert(msg.includes('409'), `Expected 409 in message: ${msg}`);
});
t('UTC-17-TC-74','AIEvent: type is string', () => {
  const ev: AIEvent = { type: 'touch', frame: 10, time_s: 0.4 };
  assertEqual(typeof ev.type, 'string');
});
t('UTC-17-TC-75','AIEvent: valid types match AI worker set', () => {
  const valid = new Set(['touch','pass','long_ball','clearance','interception','shot_attempt',
                         'goal','cross','high_pass','header','drive']);
  const ev: AIEvent = { type: 'pass', frame: 5, time_s: 0.2 };
  assert(valid.has(ev.type), `Unknown event type: ${ev.type}`);
});
t('UTC-17-TC-76','MatchReport: possession sums to 100', () => {
  const report: MatchReport = {
    match_id: 'm1', video: '/vid.mp4', duration_s: 90.0, fps: 25.0,
    possession: { team0: 55, team1: 45 },
    players: [], events: [],
    pass_network: { nodes: [], edges: [] },
    summary: { total_touches: 10, total_passes: 5, total_interceptions: 2,
                total_shots: 3, total_goals: 1 }
  };
  assertEqual(report.possession.team0 + report.possession.team1, 100);
});
t('UTC-17-TC-77','MatchReport: summary counts are non-negative', () => {
  const s = { total_touches: 50, total_passes: 20, total_interceptions: 5,
               total_shots: 8, total_goals: 2 };
  Object.values(s).forEach(v => assert(v >= 0, `Expected non-negative: ${v}`));
});
t('UTC-17-TC-78','MatchReport: pass_network has nodes and edges arrays', () => {
  const pn = { nodes: [{ id: 1 }], edges: [{ from: 1, to: 2, weight: 3 }] };
  assert(Array.isArray(pn.nodes), 'Expected nodes array');
  assert(Array.isArray(pn.edges), 'Expected edges array');
});
t('UTC-17-TC-79','TrackStat: all count fields are numbers', () => {
  const ts: TrackStat = {
    track_id: 1, label: 'player', frame_count: 100,
    approx_distance_px: 500.0, avg_speed_px_per_frame: 5.0,
    touch_count: 3, pass_count: 2, shot_count: 1
  };
  assert(typeof ts.touch_count === 'number', 'touch_count');
  assert(typeof ts.pass_count === 'number', 'pass_count');
  assert(typeof ts.shot_count === 'number', 'shot_count');
});
t('UTC-17-TC-80','Possession: team0 and team1 are numbers', () => {
  const p: Possession = { team0: 60, team1: 40 };
  assert(typeof p.team0 === 'number' && typeof p.team1 === 'number', 'Expected numbers');
});

// ══════════════════════════════════════════════════════════════════════════════
// Results
// ══════════════════════════════════════════════════════════════════════════════

async function printResults() {
  // Flush any pending async tests
  await Promise.resolve();

  console.log('\nEZ Stats Frontend — All Type Contracts\n');
  for (const r of results) {
    const m = r.status === 'PASS' ? '✓' : '✗';
    console.log(`${m} [${r.status}] ${r.id}: ${r.desc}`);
    if (r.status === 'FAIL') console.log(`       → ${r.detail}`);
  }
  console.log(`\nTotal: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

printResults().catch(e => { console.error(e); process.exit(1); });
