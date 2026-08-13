"use client";

import { useState } from "react";
import { Shirt, ArrowUpDown, ChevronDown } from "lucide-react";
import { RosterPlayer } from "./types";

interface Props {
  videoUrl: string | null;
  teamName: string;
  teamColor: string;
  roster: RosterPlayer[];
  onGenerate: () => void;
}

const DETECTED_COUNT = 12;

// Fixed mock positions standing in for AI-detected player coordinates.
const MARKER_POSITIONS = [
  { top: "22%", left: "30%" }, { top: "18%", left: "62%" }, { top: "35%", left: "48%" },
  { top: "40%", left: "20%" }, { top: "45%", left: "72%" }, { top: "55%", left: "38%" },
  { top: "60%", left: "58%" }, { top: "30%", left: "82%" }, { top: "65%", left: "15%" },
  { top: "25%", left: "10%" }, { top: "50%", left: "90%" }, { top: "70%", left: "48%" },
];

const COLUMNS = ["Player Name (Num)", "Team (H/A)", "Touches", "Passes", "Shots", "Distance (px)"];

export default function PlayerReviewTable({ videoUrl, teamName, teamColor, roster, onGenerate }: Props) {
  const [assignments, setAssignments] = useState<string[]>(Array(DETECTED_COUNT).fill(""));

  const setAssignment = (i: number, playerId: string) =>
    setAssignments(a => a.map((v, idx) => (idx === i ? playerId : v)));

  return (
    <div className="flex flex-col gap-6">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        {videoUrl && (
          <video src={videoUrl} className="absolute inset-0 w-full h-full object-contain" muted playsInline />
        )}
        {MARKER_POSITIONS.map((pos, i) => (
          <span
            key={i}
            style={{ top: pos.top, left: pos.left, backgroundColor: teamColor }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg ring-2 ring-white/70"
          >
            {i + 1}
          </span>
        ))}
      </div>

      <div className="border text-xs font-medium rounded-lg px-4 py-2.5 border-red-200 bg-red-50/60 text-red-500">
        Note: Analysis accuracy depends on the quality of the video
      </div>

      <div>
        <h2 className="text-base font-bold text-text-primary mb-3">Player Stats</h2>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary text-left text-xs font-semibold text-text-secondary">
                <th className="px-4 py-3">Photo</th>
                {COLUMNS.map(col => (
                  <th key={col} className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      {col} <ArrowUpDown size={12} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.map((assigned, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary-bg flex items-center justify-center">
                      <Shirt size={18} className="text-primary" />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="relative w-44">
                      <select
                        value={assigned}
                        onChange={e => setAssignment(i, e.target.value)}
                        className={`w-full border rounded-lg pl-3 pr-8 py-1.5 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                          assigned ? "border-border text-text-primary" : "border-border/40 text-text-muted"
                        }`}
                      >
                        <option value="">Player Name</option>
                        {roster.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}{p.jerseyNumber != null ? ` (${p.jerseyNumber})` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-text-secondary whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: teamColor }} />
                      {teamName} (H)
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">0</td>
                  <td className="px-4 py-2.5 text-text-secondary">0</td>
                  <td className="px-4 py-2.5 text-text-secondary">0</td>
                  <td className="px-4 py-2.5 text-text-secondary">0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-3 rounded-xl transition-colors"
      >
        Generate Match Data
      </button>
    </div>
  );
}
