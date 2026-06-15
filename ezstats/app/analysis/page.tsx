"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getTeams, getMatches } from "@/lib/api";
import type { Match } from "@/lib/types";

type MatchRow = Match & { teamName: string; teamColor: string | null };

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  CREATED:    { bg: "bg-gray-100",    text: "text-gray-600",   label: "Created" },
  UPLOADED:   { bg: "bg-blue-100",    text: "text-blue-700",   label: "Uploaded" },
  QUEUED:     { bg: "bg-yellow-100",  text: "text-yellow-700", label: "Queued" },
  PROCESSING: { bg: "bg-blue-100",    text: "text-blue-700",   label: "Processing" },
  COMPLETED:  { bg: "bg-green-100",   text: "text-green-700",  label: "Completed" },
  FAILED:     { bg: "bg-red-100",     text: "text-red-700",    label: "Failed" },
};

export default function AnalysisPage() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const teams = await getTeams();
        const rows: MatchRow[] = [];
        await Promise.all(
          teams.map(async team => {
            const teamMatches = await getMatches(team.id);
            teamMatches.forEach(m =>
              rows.push({ ...m, teamName: team.name, teamColor: team.primaryColor })
            );
          })
        );
        rows.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
        setMatches(rows);
      } catch {
        // backend not running — show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: 28 }}>
      <Header
        title="Analysis"
        description="All match analyses"
        action={
          <Link
            href="/upload"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: "#1a7a4a", color: "#fff",
              fontSize: 14, fontWeight: 500,
              padding: "10px 18px", borderRadius: 10,
              textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} />
            New Analysis
          </Link>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center mt-20">
          <p className="text-sm text-gray-400">Loading matches…</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-16 mt-4">
          <p className="text-sm font-medium text-text-secondary">No match analyses yet</p>
          <p className="text-xs text-text-muted mt-1">Upload match footage to start your first analysis</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          {matches.map(m => {
            const s = STATUS_STYLE[m.status] ?? STATUS_STYLE.CREATED;
            return (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-border px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: m.teamColor ?? "#6b7280" }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {m.teamName}
                      {m.opponent && (
                        <span className="font-normal text-text-secondary"> vs {m.opponent}</span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{m.date ?? "No date set"}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
