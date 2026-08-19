import type { MatchReport } from "@/lib/types";
import { buildStatRows, formatDuration, getPossessionSplit } from "./types";

interface Props {
  report?: MatchReport;
}

export default function MatchSummaryCard({ report }: Props) {
  const duration = formatDuration(report?.duration_s);
  const playerCount = report?.players.length ?? 0;
  const eventCount = report?.events.length ?? 0;
  const { home, away } = getPossessionSplit(report?.possession);
  const rows = buildStatRows(report?.summary);

  return (
    <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
      <h2 className="font-semibold text-text-primary text-base">Match Summary</h2>

      <div className="flex items-center gap-6 text-sm text-text-secondary">
        <span>
          Duration: <span className="font-semibold text-red-500">{duration}</span>
        </span>
        <span>
          Players <span className="font-semibold text-red-500">{playerCount}</span>
        </span>
        <span>
          Events <span className="font-semibold text-red-500">{eventCount}</span>
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-text-secondary">Possession</p>
        <div className="flex w-full rounded-full overflow-hidden h-9 text-sm font-semibold text-white">
          <div className="bg-red-500 flex items-center justify-end pr-3" style={{ width: `${home}%` }}>
            {home}%
          </div>
          <div className="bg-blue-600 flex items-center justify-start pl-3" style={{ width: `${away}%` }}>
            {away}%
          </div>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border">
        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm text-text-secondary">Duration:</span>
          <span className="text-sm font-semibold text-red-500">{duration}</span>
        </div>
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-text-secondary">{row.label}:</span>
            <span className="text-sm font-semibold text-red-500">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
