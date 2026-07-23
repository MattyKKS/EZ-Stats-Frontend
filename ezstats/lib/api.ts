import type {
  Team, Player, Match,
  CreateTeam, CreatePlayer, CreateMatch, UpdateMatchExtra,
  MatchReport,
} from "./types";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Teams ─────────────────────────────────────────────────────────────────────

export const getTeams = () =>
  request<(Team & { _count: { players: number; matches: number } })[]>("GET", "/teams");

export const getTeam = (id: string) =>
  request<Team & { players: Player[]; matches: Match[] }>("GET", `/teams/${id}`);

export const createTeam = (body: CreateTeam) =>
  request<Team>("POST", "/teams", body);

export const updateTeam = (id: string, body: Partial<CreateTeam>) =>
  request<Team>("PATCH", `/teams/${id}`, body);

export const deleteTeam = (id: string) =>
  request<Team>("DELETE", `/teams/${id}`);

// ── Players ───────────────────────────────────────────────────────────────────

export const getPlayers = (teamId: string) =>
  request<Player[]>("GET", `/teams/${teamId}/players`);

export const createPlayer = (teamId: string, body: CreatePlayer) =>
  request<Player>("POST", `/teams/${teamId}/players`, body);

export const updatePlayer = (id: string, body: Partial<CreatePlayer>) =>
  request<Player>("PATCH", `/players/${id}`, body);

export const deletePlayer = (id: string) =>
  request<Player>("DELETE", `/players/${id}`);

// ── Matches ───────────────────────────────────────────────────────────────────

export const getMatches = (teamId: string) =>
  request<Match[]>("GET", `/teams/${teamId}/matches`);

export const getMatch = (id: string) =>
  request<Match & { team: Team }>("GET", `/matches/${id}`);

export const createMatch = (teamId: string, body: CreateMatch) =>
  request<Match>("POST", `/teams/${teamId}/matches`, body);

export const updateMatch = (id: string, body: Partial<CreateMatch> & UpdateMatchExtra) =>
  request<Match>("PATCH", `/matches/${id}`, body);

export const deleteMatch = (id: string) =>
  request<Match>("DELETE", `/matches/${id}`);

// ── Team logo ─────────────────────────────────────────────────────────────────

export async function uploadTeamLogo(teamId: string, file: File): Promise<Team> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/teams/${teamId}/logo`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`logo upload → ${res.status}`);
  return res.json();
}

export async function deleteTeamLogo(teamId: string): Promise<void> {
  await fetch(`${BASE_URL}/teams/${teamId}/logo`, { method: "DELETE" });
}

// ── Health ────────────────────────────────────────────────────────────────────

export const getHealth = () =>
  request<{ status: "ok"; db: "up" | "down"; timestamp: string }>("GET", "/health");

// ── AI Worker Results (later milestone — NestJS does not serve these yet) ─────

export const getWorkerRuns = (): Promise<string[]> =>
  request<string[]>("GET", "/matches");

export const getMatchReport = (id: string): Promise<MatchReport> =>
  request<MatchReport>("GET", `/matches/${id}/report`);

export const getStatsVideoUrl = (id: string): string =>
  `${BASE_URL}/matches/${id}/video/stats`;

export const getSpatialVideoUrl = (id: string): string =>
  `${BASE_URL}/matches/${id}/video/spatial`;

export const getCropUrl = (id: string, cropPath: string): string =>
  `${BASE_URL}/matches/${id}/crops/${cropPath}`;
