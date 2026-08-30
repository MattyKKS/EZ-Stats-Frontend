"use client";

import { useState } from "react";
import type { MatchReport } from "@/lib/types";
import { buildStatRows, formatDuration, getPossessionSplit } from "./types";
import RadarChart from "@/components/RadarChart";

interface Props {
  report?: MatchReport;
  teamColor: string;
  opponentColor: string;
}

type View = "text" | "chart";

// Radar axis order (matches the reference layout), independent of the
// top-to-bottom order used in the text view.
const RADAR_ORDER = ["Passes", "Shots", "Touches", "Interceptions", "Clearances", "Long Balls"];

export default function MatchSummaryCard({ report, teamColor, opponentColor }: Props) {
  const [view, setView] = useState<View>("text");
  const duration = formatDuration(report?.duration_s);
  const playerCount = report?.players.length ?? 0;
  const goalCount = report?.summary?.total_goals ?? 0;
  const { home, away } = getPossessionSplit(report?.possession);
  const rows = buildStatRows(report?.summary);
  const radarData = RADAR_ORDER
    .map(label => rows.find(r => r.label === label))
    .filter((r): r is NonNullable<typeof r> => !!r);

  return (
    <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
      <h2 className="font-semibold text-text-primary text-base">Match Summary</h2>

      <div className="flex items-center gap-6 text-sm text-text-secondary">
        <span>
          Duration: <span className="font-semibold text-text-primary">{duration}</span>
        </span>
        <span>
          Players <span className="font-semibold text-text-primary">{playerCount}</span>
        </span>
        <span>
          Goals <span className="font-semibold text-text-primary">{goalCount}</span>
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-text-secondary">Possession</p>
        <div className="flex w-full rounded-full overflow-hidden h-9 text-sm font-semibold text-white">
          <div
            className="flex items-center justify-end pr-3"
            style={{ width: `${home}%`, backgroundColor: teamColor }}
          >
            {home}%
          </div>
          <div
            className="flex items-center justify-start pl-3"
            style={{ width: `${away}%`, backgroundColor: opponentColor }}
          >
            {away}%
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-1 bg-bg-secondary border border-border rounded-lg p-1 w-fit">
        <button
          onClick={() => setView("text")}
          className={`text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors ${
            view === "text" ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Text
        </button>
        <button
          onClick={() => setView("chart")}
          className={`text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors ${
            view === "chart" ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Chart
        </button>
      </div>

      {view === "text" ? (
        <div className="flex flex-col divide-y divide-border">
          {rows.map(row => (
            <div key={row.label} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-text-secondary">{row.label}:</span>
              <span className="text-sm font-semibold text-text-primary">{row.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <RadarChart data={radarData} color={teamColor} />
      )}
    </div>
  );
}
