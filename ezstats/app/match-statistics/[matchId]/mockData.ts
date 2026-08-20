import type { MatchReport, MatchPlayer, MatchEvent } from "@/lib/types";
import type { MatchWithTeam } from "./types";

// Placeholder data so the Analysis screen has something to show while the
// backend / AI worker report isn't wired up yet. Swap this out once
// getMatch / getMatchReport return real data.

export const MOCK_ROUND_LABEL = "League Match Round 6";

export const MOCK_MATCH: MatchWithTeam = {
  id: "mock-match-1",
  date: null,
  opponent: "MMIT City",
  teamColor: "#EF4444",
  opponentColor: "#3B82F6",
  teamId: "mock-team-1",
  status: "COMPLETED",
  videoPath: "mock-video",
  runId: null,
  reportPath: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  team: {
    id: "mock-team-1",
    name: "SE United",
    description: null,
    primaryColor: "#EF4444",
    secondaryColor: null,
    logoUrl: null,
    ownerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const mockPlayers: MatchPlayer[] = Array.from({ length: 26 }, (_, i) => ({
  track_id: i + 1,
  label: `P${i + 1}`,
  team_id: i < 13 ? 0 : 1,
  touches: 0,
  passes: 0,
  shots: 0,
  distance_px: 0,
  crop_path: "",
}));

const mockEvents: MatchEvent[] = Array.from({ length: 8 }, (_, i) => ({
  type: "touch",
  frame: i * 30,
  time_s: i * 3,
  actor: (i % 26) + 1,
  actor_label: `P${(i % 26) + 1}`,
  target: null,
  target_label: null,
  details: {},
}));

export const MOCK_REPORT: MatchReport = {
  match_id: MOCK_MATCH.id,
  video: "mock-video",
  duration_s: 30,
  fps: 30,
  possession: { "SE United": 50, "MMIT City": 50 },
  players: mockPlayers,
  events: mockEvents,
  pass_network: { nodes: [], edges: [] },
  summary: {
    total_touches: 0,
    total_passes: 0,
    total_long_balls: 0,
    total_clearances: 0,
    total_interceptions: 0,
    total_shots: 0,
    total_goals: 0,
  },
};

// A short public sample clip so the video panel has something playable
// while there's no real match footage/backend to point at.
export const MOCK_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
