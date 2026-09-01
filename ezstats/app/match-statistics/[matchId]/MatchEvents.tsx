import type { MatchReport } from "@/lib/types";
import { eventLabels } from "./types";

interface Props {
  events?: MatchReport["events"];
}

const typeDot: Record<string, string> = {
  goal:         "bg-red-500",
  shot:         "bg-orange-400",
  pass:         "bg-blue-500",
  long_ball:    "bg-purple-500",
  clearance:    "bg-teal-500",
  interception: "bg-yellow-500",
  touch:        "bg-gray-400",
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function MatchEvents({ events }: Props) {
  const list = events ?? [];

  return (
    <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-4">
      <h2 className="font-semibold text-text-primary text-base">Recent Events</h2>

      {list.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-text-muted">No events recorded yet</p>
        </div>
      ) : (
        // Show ~5 events; the rest scroll within this box.
        <div className="flex flex-col gap-1 overflow-y-auto max-h-[13rem]">
          {list.slice(-20).reverse().map((e, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${typeDot[e.type] ?? "bg-gray-400"}`} />
              <span className="text-xs text-text-muted w-12 flex-shrink-0 tabular-nums">{formatTime(e.time_s)}</span>
              <span className="text-sm text-text-primary font-medium">{eventLabels[e.type] ?? e.type}</span>
              <span className="text-sm text-text-secondary truncate">
                — {e.actor_label}
                {e.target_label ? ` → ${e.target_label}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
