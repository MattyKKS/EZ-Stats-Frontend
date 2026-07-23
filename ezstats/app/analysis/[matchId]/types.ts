import type { Match, MatchReport, Team } from "@/lib/types";

export type MatchWithTeam = Match & { team: Team };

export interface StatRowData {
  label: string;
  value: number;
}

export function buildStatRows(summary: MatchReport["summary"] | undefined): StatRowData[] {
  if (!summary) return [];
  return [
    { label: "Touches",       value: summary.total_touches },
    { label: "Passes",        value: summary.total_passes },
    { label: "Long Balls",    value: summary.total_long_balls },
    { label: "Shots",         value: summary.total_shots },
    { label: "Goals",         value: summary.total_goals },
    { label: "Clearances",    value: summary.total_clearances },
    { label: "Interceptions", value: summary.total_interceptions },
  ];
}

export function formatDuration(seconds: number | undefined): string {
  if (!seconds && seconds !== 0) return "00:00";
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function getPossessionSplit(possession: Record<string, number> | undefined): { home: number; away: number } {
  if (!possession) return { home: 50, away: 50 };
  const values = Object.values(possession);
  if (values.length < 2) return { home: 50, away: 50 };
  const [home, away] = values;
  const total = home + away || 1;
  return { home: Math.round((home / total) * 100), away: Math.round((away / total) * 100) };
}

export const eventLabels: Record<string, string> = {
  touch:        "Touch",
  pass:         "Pass",
  long_ball:    "Long Ball",
  clearance:    "Clearance",
  interception: "Interception",
  shot:         "Shot",
  goal:         "Goal",
};
