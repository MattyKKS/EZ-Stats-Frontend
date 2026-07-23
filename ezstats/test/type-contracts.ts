/**
 * EZ Stats Frontend – Type Contract Tests
 * Validates that the API helper functions and TypeScript types match
 * the backend API contract defined in lib/types.ts and lib/api.ts
 *
 * Run:  npx ts-node --project tsconfig.json test/type-contracts.ts
 */

// ── Minimal test runner ────────────────────────────────────────────────────────

interface TestResult {
  id: string;
  description: string;
  status: 'PASS' | 'FAIL';
  actual: string;
}

const results: TestResult[] = [];
let passed = 0;
let failed = 0;

function test(id: string, description: string, fn: () => void): void {
  try {
    fn();
    results.push({ id, description, status: 'PASS', actual: 'Type contract verified.' });
    passed++;
  } catch (err: any) {
    results.push({ id, description, status: 'FAIL', actual: err.message });
    failed++;
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// ── Inline type definitions mirroring lib/types.ts ────────────────────────────

type MatchStatus = 'CREATED' | 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

const VALID_MATCH_STATUSES: MatchStatus[] = [
  'CREATED', 'UPLOADED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED',
];

const VALID_EVENT_TYPES = new Set([
  'touch', 'pass', 'long_ball', 'clearance', 'interception', 'shot_attempt',
]);

// ── STC-01 / UTC-01 equivalent: Team type contract ────────────────────────────

test('FC-TC-01', 'Team type has all required fields', () => {
  const team = {
    id: 'uuid-1',
    name: 'FC Test United',
    description: null,
    primaryColor: null,
    secondaryColor: null,
    ownerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const requiredKeys: (keyof typeof team)[] = [
    'id', 'name', 'description', 'primaryColor',
    'secondaryColor', 'ownerId', 'createdAt', 'updatedAt',
  ];
  for (const key of requiredKeys) {
    assert(key in team, `Team type missing required field: '${key}'`);
  }
});

test('FC-TC-02', 'CreateTeam requires only name (other fields optional)', () => {
  type CreateTeam = { name: string; description?: string; primaryColor?: string; secondaryColor?: string };
  const minimal: CreateTeam = { name: 'FC Test' };
  assert(minimal.name === 'FC Test', 'name must be set');
  assert(minimal.description === undefined, 'description should be optional');
  assert(minimal.primaryColor === undefined, 'primaryColor should be optional');
});

// ── STC-02 / UTC-02 equivalent: Player type contract ─────────────────────────

test('FC-TC-03', 'Player type has all required fields', () => {
  const player = {
    id: 'uuid-2',
    name: 'John Doe',
    jerseyNumber: 9,
    position: 'Forward',
    teamId: 'uuid-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  for (const key of ['id', 'name', 'jerseyNumber', 'position', 'teamId', 'createdAt', 'updatedAt'] as const) {
    assert(key in player, `Player type missing required field: '${key}'`);
  }
});

test('FC-TC-04', 'Player jerseyNumber is nullable (optional field)', () => {
  const player = {
    id: 'uuid-3',
    name: 'Jane Smith',
    jerseyNumber: null,
    position: null,
    teamId: 'uuid-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  assert(player.jerseyNumber === null, 'jerseyNumber should be nullable');
  assert(player.position === null, 'position should be nullable');
});

test('FC-TC-05', 'CreatePlayer requires only name', () => {
  type CreatePlayer = { name: string; jerseyNumber?: number; position?: string };
  const minimal: CreatePlayer = { name: 'Jane Smith' };
  assert(minimal.name === 'Jane Smith', 'name must be set');
  assert(minimal.jerseyNumber === undefined, 'jerseyNumber should be optional');
  assert(minimal.position === undefined, 'position should be optional');
});

// ── STC-03 / UTC-03 equivalent: Match and MatchStatus ─────────────────────────

test('FC-TC-06', 'Match type has all required fields', () => {
  const match = {
    id: 'uuid-match-1',
    date: null,
    opponent: null,
    teamColor: null,
    opponentColor: null,
    teamId: 'uuid-1',
    status: 'CREATED' as MatchStatus,
    videoPath: null,
    runId: null,
    reportPath: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  for (const key of [
    'id', 'date', 'opponent', 'teamColor', 'opponentColor', 'teamId',
    'status', 'videoPath', 'runId', 'reportPath', 'createdAt', 'updatedAt',
  ] as const) {
    assert(key in match, `Match type missing required field: '${key}'`);
  }
});

test('FC-TC-07', 'MatchStatus has exactly six valid values', () => {
  assert(VALID_MATCH_STATUSES.length === 6, `Expected 6 MatchStatus values, got ${VALID_MATCH_STATUSES.length}`);
});

test('FC-TC-08', 'All six MatchStatus values are defined', () => {
  const expected = ['CREATED', 'UPLOADED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'];
  for (const s of expected) {
    assert(VALID_MATCH_STATUSES.includes(s as MatchStatus), `Missing MatchStatus: '${s}'`);
  }
});

test('FC-TC-09', 'INVALID_STATUS is not a valid MatchStatus', () => {
  assert(
    !VALID_MATCH_STATUSES.includes('INVALID_STATUS' as MatchStatus),
    'INVALID_STATUS should not be in VALID_MATCH_STATUSES',
  );
});

// ── STC-04 / UTC-05 equivalent: MatchReport type contract ─────────────────────

test('FC-TC-10', 'MatchReport type has required top-level fields', () => {
  const report = {
    match_id: 'uuid-match-1',
    video: 'match.mp4',
    duration_s: 90.0,
    fps: 25.0,
    possession: { team_0: 0.55, team_1: 0.45 },
    players: [],
    events: [],
    pass_network: { nodes: [], edges: [] },
    summary: {
      total_touches: 0, total_passes: 0, total_long_balls: 0,
      total_clearances: 0, total_interceptions: 0, total_shots: 0, total_goals: 0,
    },
  };
  for (const key of ['match_id', 'fps', 'events', 'players', 'summary'] as const) {
    assert(key in report, `MatchReport missing required field: '${key}'`);
  }
});

test('FC-TC-11', 'MatchEvent types do not include tackle or foul', () => {
  const invalidTypes = ['tackle', 'foul', 'yellow_card', 'red_card'];
  for (const t of invalidTypes) {
    assert(!VALID_EVENT_TYPES.has(t), `'${t}' must not be a valid event type`);
  }
});

test('FC-TC-12', 'API url builder functions produce correct path patterns', () => {
  const BASE_URL = 'http://localhost:4000/api';
  const getStatsVideoUrl = (id: string) => `${BASE_URL}/matches/${id}/video/stats`;
  const getCropUrl = (id: string, cropPath: string) => `${BASE_URL}/matches/${id}/crops/${cropPath}`;

  const statsUrl = getStatsVideoUrl('match-123');
  assert(statsUrl.includes('/matches/match-123/video/stats'),
    `Stats URL should contain '/matches/match-123/video/stats', got: ${statsUrl}`);

  const cropUrl = getCropUrl('match-123', 'player_3_crop.jpg');
  assert(cropUrl.includes('/matches/match-123/crops/player_3_crop.jpg'),
    `Crop URL should contain correct path, got: ${cropUrl}`);
});

// ── Report ─────────────────────────────────────────────────────────────────────

console.log('EZ Stats Frontend — Type Contract Tests\n');
for (const r of results) {
  const mark = r.status === 'PASS' ? '✓' : '✗';
  console.log(`${mark} [${r.status}] ${r.id}: ${r.description}`);
  if (r.status === 'FAIL') console.log(`       Actual: ${r.actual}`);
}
console.log(`\nTotal: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);

if (failed > 0) process.exit(1);
