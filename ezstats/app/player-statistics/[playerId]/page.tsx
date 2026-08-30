"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import PositionBadge from "@/components/PositionBadge";
import { getPlayers, getMatches, getMatchPlayerStats } from "@/lib/api";
import { useTeamContext } from "@/lib/TeamContext";
import type { Player } from "@/lib/types";

interface MatchStatRow {
  matchId: string;
  opponent: string;
  date: string | null;
  touches: number;
  passes: number;
  shots: number;
  distancePx: number;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-border px-5 py-4">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-2xl font-bold text-text-primary mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

export default function PlayerDetailPage() {
  const params = useParams<{ playerId: string }>();
  const { selectedTeamId, loading: teamsLoading } = useTeamContext();

  const [player, setPlayer] = useState<Player | null>(null);
  const [rows, setRows] = useState<MatchStatRow[]>([]);
  const [dataTeamId, setDataTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTeamId) return;
    let cancelled = false;

    getPlayers(selectedTeamId)
      .then(list => { if (!cancelled) setPlayer(list.find(p => p.id === params.playerId) ?? null); })
      .catch(() => { if (!cancelled) setPlayer(null); });

    // Walk every match the team has played and pull out this player's line,
    // if the match has been analyzed and this player has been mapped in it.
    getMatches(selectedTeamId)
      .then(async matches => {
        const results = await Promise.allSettled(
          matches.map(async m => ({ match: m, stats: await getMatchPlayerStats(m.id) })),
        );
        if (cancelled) return;
        const built: MatchStatRow[] = [];
        for (const r of results) {
          if (r.status !== "fulfilled") continue;
          const stat = r.value.stats.players.find(p => p.playerId === params.playerId);
          if (!stat) continue;
          built.push({
            matchId: r.value.match.id,
            opponent: r.value.match.opponent ?? "Unknown",
            date: r.value.match.date,
            touches: stat.touches,
            passes: stat.passes,
            shots: stat.shots,
            distancePx: stat.distancePx,
          });
        }
        built.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
        setRows(built);
        setDataTeamId(selectedTeamId);
      })
      .catch(() => { if (!cancelled) { setRows([]); setDataTeamId(selectedTeamId); } });

    return () => { cancelled = true; };
  }, [selectedTeamId, params.playerId]);

  const loading = teamsLoading || (!!selectedTeamId && dataTeamId !== selectedTeamId);

  const totals = useMemo(() => rows.reduce((acc, r) => ({
    touches: acc.touches + r.touches,
    passes: acc.passes + r.passes,
    shots: acc.shots + r.shots,
    distancePx: acc.distancePx + r.distancePx,
  }), { touches: 0, passes: 0, shots: 0, distancePx: 0 }), [rows]);

  return (
    <div className="min-h-screen bg-bg-secondary p-5">
      <Link
        href="/player-statistics"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary no-underline mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Player Statistics
      </Link>

      {loading ? (
        <div className="flex items-center justify-center mt-20">
          <p className="text-sm text-text-muted">Loading player…</p>
        </div>
      ) : !player ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-16">
          <p className="text-sm font-medium text-text-secondary">Player not found</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6">
            <UserCircle2 size={56} className="text-gray-300 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-text-primary m-0">{player.name}</h1>
                <PositionBadge position={player.position} />
              </div>
              <p className="text-xs text-text-secondary mt-1">
                #{player.jerseyNumber ?? "—"} · {rows.length} match{rows.length === 1 ? "" : "es"} played
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Touches" value={totals.touches} />
            <StatCard label="Total Passes" value={totals.passes} />
            <StatCard label="Total Shots" value={totals.shots} />
            <StatCard label="Total Distance (px)" value={Math.round(totals.distancePx)} />
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-sm font-medium text-text-secondary">No match data yet</p>
                <p className="text-xs text-text-muted mt-1">Stats appear once a match analysis maps this player</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary-bg border-b border-border text-left">
                      <th className="px-6 py-3.5 font-semibold text-text-primary">Opponent</th>
                      <th className="px-4 py-3.5 font-semibold text-text-primary">Date</th>
                      <th className="px-4 py-3.5 font-semibold text-text-primary">Touches</th>
                      <th className="px-4 py-3.5 font-semibold text-text-primary">Passes</th>
                      <th className="px-4 py-3.5 font-semibold text-text-primary">Shots</th>
                      <th className="px-4 py-3.5 font-semibold text-text-primary">Distance (px)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.matchId} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 transition-colors">
                        <td className="px-6 py-3 font-medium">
                          <Link href={`/match-statistics/${r.matchId}`} className="text-text-primary hover:text-primary no-underline">
                            vs {r.opponent}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{r.date ? new Date(r.date).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-text-secondary">{r.touches}</td>
                        <td className="px-4 py-3 text-text-secondary">{r.passes}</td>
                        <td className="px-4 py-3 text-text-secondary">{r.shots}</td>
                        <td className="px-4 py-3 text-text-secondary">{Math.round(r.distancePx)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
