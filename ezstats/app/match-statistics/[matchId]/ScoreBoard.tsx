import type { MatchWithTeam } from "./types";
import type { MatchSummary as MatchSummaryStats } from "@/lib/types";

interface Props {
  match: MatchWithTeam;
  summary?: MatchSummaryStats;
  roundLabel?: string;
  teamColor: string;
  opponentColor: string;
}

function TeamDot({ color }: { color: string }) {
  return (
    <span
      className="w-9 h-9 rounded-full flex-shrink-0 border border-black/5"
      style={{ backgroundColor: color }}
    />
  );
}

export default function ScoreBoard({ match, summary, roundLabel, teamColor, opponentColor }: Props) {
  const homeGoals = summary?.total_goals ?? 0;
  // Only the merged AI report currently returns a single goal total, so the
  // opponent score falls back to 0 until the backend reports it per side.
  const awayGoals = 0;

  return (
    <div className="flex flex-col gap-2">
      {roundLabel && <p className="text-sm text-text-secondary">{roundLabel}</p>}
      <div className="bg-white rounded-xl border border-border px-6 py-5">
        <div className="flex items-center justify-center gap-6">
          <span className="text-base font-semibold text-text-primary">{match.team.name}</span>
          <TeamDot color={teamColor} />
          <span className="text-2xl font-bold text-text-primary tabular-nums">
            {homeGoals} - {awayGoals}
          </span>
          <TeamDot color={opponentColor} />
          <span className="text-base font-semibold text-text-primary">
            {match.opponent ?? "Opponent"}
          </span>
        </div>
      </div>
    </div>
  );
}
