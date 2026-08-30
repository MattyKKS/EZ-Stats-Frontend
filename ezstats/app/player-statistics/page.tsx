"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, ArrowUpDown, UserCircle2 } from "lucide-react";
import Header from "@/components/Header";
import PositionBadge from "@/components/PositionBadge";
import { getPlayers, getMatches, getMatchPlayerStats } from "@/lib/api";
import { useTeamContext } from "@/lib/TeamContext";
import type { Player } from "@/lib/types";

type SortKey = "name" | "touches" | "passes" | "shots" | "distancePx";
type SortDir = "asc" | "desc";

interface StatTotals {
  touches: number;
  passes: number;
  shots: number;
  distancePx: number;
}

interface PlayerRow extends StatTotals {
  id: string;
  name: string;
  jerseyNumber: number | null;
  position: string | null;
}

// Roster order when no column is sorted: goalkeepers first, then outfield
// positions front-to-back, jersey number ascending within each group.
const POSITION_ORDER: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FW: 3 };

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 font-semibold text-text-primary hover:text-primary transition-colors"
    >
      {label}
      {active ? (
        dir === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
      ) : (
        <ArrowUpDown size={14} className="text-text-muted" />
      )}
    </button>
  );
}

export default function PlayerStatisticsPage() {
  const router = useRouter();
  const { selectedTeamId, loading: teamsLoading } = useTeamContext();

  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<Record<string, StatTotals>>({});
  const [rosterTeamId, setRosterTeamId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    if (!selectedTeamId) return;
    let cancelled = false;

    getPlayers(selectedTeamId)
      .then(rows => { if (!cancelled) { setPlayers(rows); setRosterTeamId(selectedTeamId); } })
      .catch(() => { if (!cancelled) { setPlayers([]); setRosterTeamId(selectedTeamId); } });

    // Sum each roster player's stats across every match the team has played.
    // Matches that haven't been processed yet just contribute nothing.
    getMatches(selectedTeamId)
      .then(async matches => {
        const results = await Promise.allSettled(matches.map(m => getMatchPlayerStats(m.id)));
        if (cancelled) return;
        const totals: Record<string, StatTotals> = {};
        for (const r of results) {
          if (r.status !== "fulfilled") continue;
          for (const p of r.value.players) {
            const t = totals[p.playerId] ?? { touches: 0, passes: 0, shots: 0, distancePx: 0 };
            t.touches += p.touches;
            t.passes += p.passes;
            t.shots += p.shots;
            t.distancePx += p.distancePx;
            totals[p.playerId] = t;
          }
        }
        setStats(totals);
      })
      .catch(() => { if (!cancelled) setStats({}); });

    return () => { cancelled = true; };
  }, [selectedTeamId]);

  const loadingRoster = !!selectedTeamId && rosterTeamId !== selectedTeamId;
  const loading = teamsLoading || loadingRoster;

  const rows: PlayerRow[] = useMemo(() => players.map(p => ({
    id: p.id,
    name: p.name,
    jerseyNumber: p.jerseyNumber,
    position: p.position,
    touches: stats[p.id]?.touches ?? 0,
    passes: stats[p.id]?.passes ?? 0,
    shots: stats[p.id]?.shots ?? 0,
    distancePx: stats[p.id]?.distancePx ?? 0,
  })), [players, stats]);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    if (!sortKey) {
      copy.sort((a, b) => {
        const posDiff = (POSITION_ORDER[(a.position ?? "").toUpperCase()] ?? 99)
          - (POSITION_ORDER[(b.position ?? "").toUpperCase()] ?? 99);
        if (posDiff !== 0) return posDiff;
        return (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999);
      });
      return copy;
    }
    const dir = sortDir === "asc" ? 1 : -1;
    copy.sort((a, b) => sortKey === "name"
      ? a.name.localeCompare(b.name) * dir
      : (a[sortKey] - b[sortKey]) * dir);
    return copy;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-5">
      <Header title="Player Statistics" description="Per-player performance across matches" />

      {loading ? (
        <div className="flex items-center justify-center mt-20">
          <p className="text-sm text-text-muted">Loading player statistics…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-16">
          <p className="text-sm font-medium text-text-secondary">No players on the roster yet</p>
          <p className="text-xs text-text-muted mt-1">Add players in Team Profile to start tracking stats</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-bg border-b border-border text-left">
                  <th className="px-6 py-3.5">
                    <SortHeader label="Player Name" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-text-primary">Number</th>
                  <th className="px-4 py-3.5 font-semibold text-text-primary">Position</th>
                  <th className="px-4 py-3.5">
                    <SortHeader label="Touches" active={sortKey === "touches"} dir={sortDir} onClick={() => toggleSort("touches")} />
                  </th>
                  <th className="px-4 py-3.5">
                    <SortHeader label="Passes" active={sortKey === "passes"} dir={sortDir} onClick={() => toggleSort("passes")} />
                  </th>
                  <th className="px-4 py-3.5">
                    <SortHeader label="Shots" active={sortKey === "shots"} dir={sortDir} onClick={() => toggleSort("shots")} />
                  </th>
                  <th className="px-4 py-3.5">
                    <SortHeader label="Distance (px)" active={sortKey === "distancePx"} dir={sortDir} onClick={() => toggleSort("distancePx")} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map(row => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/player-statistics/${row.id}`)}
                    className="border-b border-border last:border-0 hover:bg-bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <UserCircle2 size={32} className="text-gray-300 flex-shrink-0" strokeWidth={1.5} />
                        <span className="font-medium text-text-primary">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{row.jerseyNumber ?? "—"}</td>
                    <td className="px-4 py-3"><PositionBadge position={row.position} /></td>
                    <td className="px-4 py-3 text-text-secondary">{row.touches}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.passes}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.shots}</td>
                    <td className="px-4 py-3 text-text-secondary">{Math.round(row.distancePx)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
