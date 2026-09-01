"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, ArrowUpDown, UserCircle2 } from "lucide-react";
import PositionBadge from "@/components/PositionBadge";
import { getPlayers, getMatchPlayerStats } from "@/lib/api";
import type { MatchPlayerStat } from "@/lib/api";

type SortKey = "name" | "touches" | "passes" | "shots" | "distancePx";
type SortDir = "asc" | "desc";

interface Row {
  id: string;
  name: string;
  jerseyNumber: number | null;
  position: string | null;
  touches: number;
  passes: number;
  shots: number;
  distancePx: number;
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

interface Props {
  matchId: string;
  teamId?: string | null;
}

export default function MatchPlayerStats({ matchId, teamId }: Props) {
  const router = useRouter();

  const [players, setPlayers] = useState<MatchPlayerStat[]>([]);
  const [positions, setPositions] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    setLoading(true);
    setFailed(false);

    getMatchPlayerStats(matchId)
      .then(res => { if (!cancelled) setPlayers(res.players); })
      .catch(() => { if (!cancelled) { setPlayers([]); setFailed(true); } })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [matchId]);

  // Positions aren't returned per match, so pull them off the roster.
  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;

    getPlayers(teamId)
      .then(roster => {
        if (cancelled) return;
        const map: Record<string, string | null> = {};
        for (const p of roster) map[p.id] = p.position;
        setPositions(map);
      })
      .catch(() => { if (!cancelled) setPositions({}); });

    return () => { cancelled = true; };
  }, [teamId]);

  const rows: Row[] = useMemo(() => players.map(p => ({
    id: p.playerId,
    name: p.name,
    jerseyNumber: p.jerseyNumber,
    position: positions[p.playerId] ?? null,
    touches: p.touches,
    passes: p.passes,
    shots: p.shots,
    distancePx: p.distancePx,
  })), [players, positions]);

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
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold text-text-primary text-base">Player Statistics</h2>

      {loading ? (
        <div className="bg-white rounded-xl border border-border flex items-center justify-center py-16">
          <p className="text-sm text-text-muted">Loading player statistics…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-16">
          <p className="text-sm font-medium text-text-secondary">
            {failed ? "Player statistics unavailable for this match" : "No player statistics for this match yet"}
          </p>
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
