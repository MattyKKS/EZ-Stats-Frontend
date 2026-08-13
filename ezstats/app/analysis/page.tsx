"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { Search, Video } from "lucide-react";
import { getMatches } from "@/lib/api";
import { useTeamContext } from "@/lib/TeamContext";
import type { Match } from "@/lib/types";

type Result = "WIN" | "DRAW" | "LOSE";

interface AnalysisCard {
  id: string;
  title: string;
  opponent: string;
  date: string;
  result: Result;
  status?: string;
}

const RESULT_STYLE: Record<Result, string> = {
  WIN:  "border-green-500 text-green-600 bg-white",
  DRAW: "border-yellow-400 text-yellow-600 bg-white",
  LOSE: "border-red-400 text-red-500 bg-white",
};

const RESULT_LABEL: Record<Result, string> = { WIN: "Win", DRAW: "Draw", LOSE: "Lose" };

const STATUS_STYLE: Record<string, { text: string; border: string; label: string }> = {
  CREATED:    { border: "border-gray-300",   text: "text-gray-600",   label: "Created" },
  UPLOADED:   { border: "border-blue-300",   text: "text-blue-700",   label: "Uploaded" },
  QUEUED:     { border: "border-yellow-300", text: "text-yellow-700", label: "Queued" },
  PROCESSING: { border: "border-blue-300",   text: "text-blue-700",   label: "Processing" },
  COMPLETED:  { border: "border-green-500",  text: "text-green-600",  label: "Completed" },
  FAILED:     { border: "border-red-400",    text: "text-red-500",    label: "Failed" },
};

// Sample cards so the page has something to show while match results aren't
// tracked by the backend yet — swap out once win/draw/loss data is real.
const MOCK_CARDS: AnalysisCard[] = [
  { id: "mock-6", title: "League Match Round 6", opponent: "MMIT City", date: "Aug 17 2025", result: "WIN" },
  { id: "mock-5", title: "League Match Round 5", opponent: "MMIT City", date: "Aug 12 2025", result: "WIN" },
  { id: "mock-4", title: "League Match Round 4", opponent: "MMIT City", date: "Aug 2 2025",  result: "DRAW" },
  { id: "mock-3", title: "League Match Round 3", opponent: "MMIT City", date: "Jul 25 2025", result: "LOSE" },
  { id: "mock-2", title: "League Match Round 2", opponent: "MMIT City", date: "Jul 20 2025", result: "DRAW" },
  { id: "mock-1", title: "League Match Round 1", opponent: "MMIT City", date: "Jul 12 2025", result: "WIN" },
];

export default function AnalysisPage() {
  const { selectedTeamId, selectedTeam, loading: teamsLoading } = useTeamContext();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [query, setQuery] = useState("");

  // Reload matches whenever the globally selected team changes.
  useEffect(() => {
    if (!selectedTeamId) { setMatches([]); setLoadingMatches(false); return; }
    let cancelled = false;
    setLoadingMatches(true);
    getMatches(selectedTeamId)
      .then(rows => { if (!cancelled) setMatches(rows); })
      .catch(() => { if (!cancelled) setMatches([]); })
      .finally(() => { if (!cancelled) setLoadingMatches(false); });
    return () => { cancelled = true; };
  }, [selectedTeamId]);

  const loading = teamsLoading || loadingMatches;

  const cards: AnalysisCard[] = useMemo(() => {
    if (matches.length === 0) return MOCK_CARDS;
    const sorted = [...matches].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    return sorted.map(m => ({
      id: m.id,
      title: selectedTeam?.name ?? "Team",
      opponent: m.opponent ?? "Unknown",
      date: m.date ? new Date(m.date).toLocaleDateString() : "No date set",
      result: "DRAW",
      status: m.status,
    }));
  }, [matches, selectedTeam]);

  const filtered = cards.filter(c =>
    `${c.title} ${c.opponent}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-secondary p-5">
      <Header title="Analysis" description="All match analyses" />

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Analysis videos"
            className="w-full border border-border rounded-full pl-10 pr-4 py-2.5 text-sm bg-white placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <p className="text-sm text-text-secondary whitespace-nowrap">Total Analysis: {cards.length}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center mt-20">
          <p className="text-sm text-text-muted">Loading matches…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-16">
          <p className="text-sm font-medium text-text-secondary">No match analyses found</p>
          <p className="text-xs text-text-muted mt-1">Upload match footage to start your first analysis</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => {
            const s = c.status ? STATUS_STYLE[c.status] ?? STATUS_STYLE.CREATED : null;
            return (
              <Link
                key={c.id}
                href={`/analysis/${c.id}`}
                className="bg-white rounded-xl border border-border overflow-hidden no-underline hover:border-primary transition-colors"
              >
                <div className="relative aspect-video bg-bg-secondary flex items-center justify-center">
                  <Video size={40} className="text-text-muted/60" strokeWidth={1.5} />
                  <span
                    className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full border bg-white ${
                      s ? `${s.border} ${s.text}` : RESULT_STYLE[c.result]
                    }`}
                  >
                    {s ? s.label : RESULT_LABEL[c.result]}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-text-primary">{c.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-text-secondary">vs {c.opponent}</p>
                    <p className="text-xs text-text-muted">{c.date}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
