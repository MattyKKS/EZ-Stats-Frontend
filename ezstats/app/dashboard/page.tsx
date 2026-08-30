"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, UserCircle2 } from "lucide-react";
import Header from "@/components/Header";
import RadarChart from "@/components/RadarChart";
import { getMatches, getMatchReport, getPlayers, getMatchPlayerStats } from "@/lib/api";
import { useTeamContext } from "@/lib/TeamContext";
import type { Match, MatchReport } from "@/lib/types";

interface PlayerTotals {
  name: string;
  touches: number;
  passes: number;
  shots: number;
  distancePx: number;
  appearances: number;
}

interface LeaderboardRow {
  label: string;
  unit: string;
  playerName: string;
  value: number;
}

const RADAR_LABELS = ["Passes", "Shots", "Touches", "Interceptions", "Clearances", "Long Balls"];

// Placeholder shown until a team has enough analyzed matches for a real
// leaderboard — mirrors the target design's mockup data.
const MOCK_LEADERBOARD: Record<string, { name: string; value: number }> = {
  "Total Touches": { name: "Haaland", value: 10 },
  "Total Passes":  { name: "Haaland", value: 10 },
  "Avg Shots":     { name: "Haaland", value: 10 },
  "Avg Distance":  { name: "Haaland", value: 10 },
};

export default function DashboardPage() {
  const { selectedTeamId, loading: teamsLoading } = useTeamContext();

  const [matches, setMatches] = useState<Match[]>([]);
  const [reports, setReports] = useState<MatchReport[]>([]);
  const [playerTotals, setPlayerTotals] = useState<Record<string, PlayerTotals>>({});
  const [dataTeamId, setDataTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTeamId) return;
    let cancelled = false;

    getMatches(selectedTeamId)
      .then(async list => {
        if (cancelled) return;
        setMatches(list);

        // Reports back the possession/chart averages; player-stats back the
        // leaderboard — both are best-effort per match (skip unanalyzed ones).
        const [reportResults, statResults] = await Promise.all([
          Promise.allSettled(list.map(m => getMatchReport(m.id))),
          Promise.allSettled(list.map(m => getMatchPlayerStats(m.id))),
        ]);
        if (cancelled) return;

        setReports(
          reportResults
            .filter((r): r is PromiseFulfilledResult<MatchReport> => r.status === "fulfilled")
            .map(r => r.value),
        );

        const totals: Record<string, PlayerTotals> = {};
        for (const r of statResults) {
          if (r.status !== "fulfilled") continue;
          for (const p of r.value.players) {
            const t = totals[p.playerId] ?? { name: p.name, touches: 0, passes: 0, shots: 0, distancePx: 0, appearances: 0 };
            t.touches += p.touches;
            t.passes += p.passes;
            t.shots += p.shots;
            t.distancePx += p.distancePx;
            t.appearances += 1;
            totals[p.playerId] = t;
          }
        }
        setPlayerTotals(totals);
        setDataTeamId(selectedTeamId);
      })
      .catch(() => {
        if (!cancelled) { setMatches([]); setReports([]); setPlayerTotals({}); setDataTeamId(selectedTeamId); }
      });

    // Roster isn't needed directly — player names/ids come back on each
    // match's player-stats — but keeping teams in sync avoids a stale fetch
    // firing after the user switches teams mid-load.
    getPlayers(selectedTeamId).catch(() => {});

    return () => { cancelled = true; };
  }, [selectedTeamId]);

  const loading = teamsLoading || (!!selectedTeamId && dataTeamId !== selectedTeamId);

  const totalAnalysis = matches.length;

  const avgPossession = useMemo(() => {
    if (reports.length === 0) return 0;
    const fractions = reports.map(r => {
      const values = Object.values(r.possession ?? {});
      if (values.length < 2) return 0.5;
      const [home, away] = values;
      const total = home + away || 1;
      return home / total;
    });
    return Math.round((fractions.reduce((a, b) => a + b, 0) / fractions.length) * 100);
  }, [reports]);

  const avgPlayerDistance = useMemo(() => {
    const totals = Object.values(playerTotals);
    if (totals.length === 0) return 0;
    const perAppearance = totals.map(t => t.distancePx / Math.max(1, t.appearances));
    return Math.round(perAppearance.reduce((a, b) => a + b, 0) / perAppearance.length);
  }, [playerTotals]);

  // Win/loss isn't tracked by the backend yet — matches don't record an
  // opponent score, only the team's own goal count — so this stays
  // unavailable rather than being guessed from incomplete data.
  const avgWinRate: number | null = null;

  const radarData = useMemo(() => {
    if (reports.length === 0) return RADAR_LABELS.map(label => ({ label, value: 0 }));
    const n = reports.length;
    const avg = (fn: (s: MatchReport["summary"]) => number) =>
      Math.round(reports.reduce((acc, r) => acc + fn(r.summary), 0) / n);
    return [
      { label: "Passes",        value: avg(s => s.total_passes) },
      { label: "Shots",         value: avg(s => s.total_shots) },
      { label: "Touches",       value: avg(s => s.total_touches) },
      { label: "Interceptions", value: avg(s => s.total_interceptions) },
      { label: "Clearances",    value: avg(s => s.total_clearances) },
      { label: "Long Balls",    value: avg(s => s.total_long_balls) },
    ];
  }, [reports]);

  const leaderboard: LeaderboardRow[] = useMemo(() => {
    const totals = Object.values(playerTotals);
    const topBy = (fn: (t: PlayerTotals) => number) =>
      totals.reduce<PlayerTotals | null>((best, t) => (!best || fn(t) > fn(best) ? t : best), null);

    const topTouches = topBy(t => t.touches);
    const topPasses = topBy(t => t.passes);
    const topShots = topBy(t => t.shots / Math.max(1, t.appearances));
    const topDistance = topBy(t => t.distancePx / Math.max(1, t.appearances));

    const rows: { label: string; unit: string; playerName: string | null; value: number }[] = [
      { label: "Total Touches", unit: "",   playerName: topTouches?.name ?? null, value: topTouches?.touches ?? 0 },
      { label: "Total Passes",  unit: "",   playerName: topPasses?.name ?? null,  value: topPasses?.passes ?? 0 },
      {
        label: "Avg Shots", unit: "", playerName: topShots?.name ?? null,
        value: topShots ? Math.round((topShots.shots / Math.max(1, topShots.appearances)) * 10) / 10 : 0,
      },
      {
        label: "Avg Distance", unit: "px", playerName: topDistance?.name ?? null,
        value: topDistance ? Math.round(topDistance.distancePx / Math.max(1, topDistance.appearances)) : 0,
      },
    ];

    // Fill in with placeholder data until there's enough analyzed matches.
    return rows.map(row => ({
      ...row,
      playerName: row.playerName ?? MOCK_LEADERBOARD[row.label].name,
      value: row.playerName ? row.value : MOCK_LEADERBOARD[row.label].value,
    }));
  }, [playerTotals]);

  return (
    <div className="min-h-screen bg-bg-secondary p-5">
      <Header title="Dashboard" />

      {loading ? (
        <div className="flex items-center justify-center mt-20">
          <p className="text-sm text-text-muted">Loading dashboard…</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Analysis" value={totalAnalysis} unit="Uploads" />
            <StatCard label="Avg Win Rate" value={avgWinRate} unit="" suffix="%" />
            <StatCard label="Avg Possession" value={avgPossession} unit="/ Match" suffix="%" />
            <StatCard label="Avg Player Distance" value={avgPlayerDistance} unit="px / Match" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-text-secondary tracking-wide uppercase">Avg Statistics Chart</p>
              <div className="bg-white rounded-xl border border-border p-2">
                {reports.length > 0 ? (
                  <RadarChart data={radarData} color="#05714B" size={360} maxWidth={560} />
                ) : (
                  <p className="text-sm text-text-muted text-center py-16">No match statistics yet</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-secondary tracking-wide uppercase">Player Leaderboard</p>
                <Link
                  href="/player-statistics"
                  title="View player statistics"
                  className="text-text-muted hover:text-primary transition-colors"
                >
                  <ChevronRight size={18} />
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {leaderboard.map(row => (
                  <div key={row.label} className="bg-white rounded-xl border border-border p-5">
                    <p className="text-xs font-semibold text-text-secondary tracking-wide uppercase mb-3">{row.label}</p>
                    <div className="flex items-center gap-3">
                      <UserCircle2 size={32} className="text-gray-300 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-sm font-medium text-text-primary whitespace-nowrap">{row.playerName}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: "100%" }} />
                      </div>
                      <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                        {row.value}{row.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, unit, suffix = "",
}: {
  label: string;
  value: number | null;
  unit: string;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-2">
      <p className="text-xs font-semibold text-text-secondary tracking-wide uppercase">{label}</p>
      <p className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-primary">
          {value === null ? "—" : `${value}${suffix}`}
        </span>
        {unit && <span className="text-xs text-text-muted">{unit}</span>}
      </p>
    </div>
  );
}
