// ── NestJS Backend Types (Feature #2 — Team Management) ─────────────────────
// Source: C:\Users\kaung\EZStatsBackend\docs\FRONTEND_API_INTEGRATION.md
// Dates are ISO strings. Color fields must be valid hex (e.g. "#1E40AF").

export type Team = {
  id: string;
  name: string;
  description: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Player = {
  id: string;
  name: string;
  jerseyNumber: number | null;
  position: string | null;
  teamId: string;
  createdAt: string;
  updatedAt: string;
};

export type MatchStatus =
  | "CREATED" | "UPLOADED" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type Match = {
  id: string;
  date: string | null;
  opponent: string | null;
  teamColor: string | null;
  opponentColor: string | null;
  teamId: string;
  status: MatchStatus;
  videoPath: string | null;
  runId: string | null;
  reportPath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTeam = {
  name: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

export type CreatePlayer = {
  name: string;
  jerseyNumber?: number;
  position?: string;
};

export type CreateMatch = {
  date?: string;
  opponent?: string;
  teamColor?: string;
  opponentColor?: string;
};

export type UpdateMatchExtra = {
  status?: MatchStatus;
  videoPath?: string;
  runId?: string;
  reportPath?: string;
};

// ── AI Worker Result Types (later milestone — not served by NestJS yet) ───────
// Source: EZ Stats AI Worker — match_report_merged.json contract

export interface MatchPlayer {
  track_id: number;
  label: string;
  team_id: number;
  touches: number;
  passes: number;
  shots: number;
  distance_px: number;
  crop_path: string;
}

export interface MatchEvent {
  type: "touch" | "pass" | "long_ball" | "clearance" | "interception" | "shot" | "goal";
  frame: number;
  time_s: number;
  actor: number;
  actor_label: string;
  target: number | null;
  target_label: string | null;
  details: Record<string, unknown>;
}

export interface PassNetworkNode {
  id: number;
  label: string;
  team_id: number;
}

export interface PassNetworkEdge {
  from: number;
  to: number;
  count: number;
}

export interface MatchSummary {
  total_touches: number;
  total_passes: number;
  total_long_balls: number;
  total_clearances: number;
  total_interceptions: number;
  total_shots: number;
  total_goals: number;
}

export interface MatchReport {
  match_id: string;
  video: string;
  duration_s: number;
  fps: number;
  possession: Record<string, number>;
  players: MatchPlayer[];
  events: MatchEvent[];
  pass_network: {
    nodes: PassNetworkNode[];
    edges: PassNetworkEdge[];
  };
  summary: MatchSummary;
}
