"use client";

import { ChevronDown } from "lucide-react";
import { inputCls } from "./types";
import type { Team } from "@/lib/types";

interface Props {
  teams: Team[];
  teamId: string;
  isHome: boolean;
  onTeamChange: (id: string) => void;
  onToggleHome: () => void;
}

export default function TeamHomeAwaySelect({ teams, teamId, isHome, onTeamChange, onToggleHome }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-1.5">Select Team</label>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <select
            className={`${inputCls} pr-9 appearance-none`}
            value={teamId}
            onChange={e => onTeamChange(e.target.value)}
          >
            <option value="">Choose Your team</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={onToggleHome}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <span className={`relative w-9 h-5 rounded-full transition-colors ${isHome ? "bg-primary" : "bg-border"}`}>
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                isHome ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
          <span className="text-sm font-medium text-text-primary w-12 text-left">{isHome ? "Home" : "Away"}</span>
        </button>
      </div>
    </div>
  );
}
