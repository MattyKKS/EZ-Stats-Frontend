"use client";

import { ChevronDown, Plus } from "lucide-react";
import { Team, TEAM_COLORS, getAbbr } from "./types";
import TeamBadge from "./TeamBadge";

interface Props {
  teams: Team[];
  selectedTeam: Team;
  showDropdown: boolean;
  showAddTeam: boolean;
  newTeamName: string;
  newTeamColor: string;
  onToggleDropdown: () => void;
  onSelectTeam: (id: string) => void;
  onToggleAddTeam: () => void;
  onNewTeamNameChange: (val: string) => void;
  onNewTeamColorChange: (val: string) => void;
  onAddTeam: () => void;
  onCancelAdd: () => void;
}

export default function TeamSelector({
  teams, selectedTeam, showDropdown, showAddTeam,
  newTeamName, newTeamColor,
  onToggleDropdown, onSelectTeam, onToggleAddTeam,
  onNewTeamNameChange, onNewTeamColorChange,
  onAddTeam, onCancelAdd,
}: Props) {
  const hasTeams = teams.length > 0;

  return (
    <div className="col-span-6 md:col-span-2 w-full bg-white rounded-xl border border-border p-5 flex flex-col gap-3">
      {hasTeams && (
        <>
          <p className="text-sm font-semibold text-text-primary text-center">Select Your Team</p>

          <div className="relative">
            <button
              onClick={onToggleDropdown}
              className="w-full flex items-center justify-between gap-2 border border-border rounded-lg px-3 py-2 text-sm hover:bg-bg-secondary transition-colors"
            >
              <div className="flex items-center gap-2">
                <TeamBadge team={selectedTeam} size="sm" />
                <span className="font-medium text-text-primary">{selectedTeam.name}</span>
              </div>
              <ChevronDown size={16} className="text-text-muted flex-shrink-0" />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                {teams.map(t => (
                  <button key={t.id}
                    onClick={() => onSelectTeam(t.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-secondary transition-colors ${t.id === selectedTeam.id ? "bg-primary-bg" : ""}`}
                  >
                    <TeamBadge team={t} size="sm" />
                    <span className={t.id === selectedTeam.id ? "text-primary font-medium" : "text-text-primary"}>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showAddTeam ? (
        <div className="flex flex-col gap-2 border border-dashed border-primary rounded-lg p-4 bg-primary-bg/40">
          <input
            className="w-full border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            placeholder="Team name"
            value={newTeamName}
            onChange={e => onNewTeamNameChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onAddTeam()}
            autoFocus
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            {TEAM_COLORS.map(c => (
              <button key={c} onClick={() => onNewTeamColorChange(c)}
                className="w-6 h-6 rounded-md flex-shrink-0 transition-transform hover:scale-110"
                style={{ backgroundColor: c, outline: newTeamColor === c ? `2px solid ${c}` : "none", outlineOffset: 2 }}
              />
            ))}
            {newTeamName && (
              <span className="ml-auto w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: newTeamColor }}>
                {getAbbr(newTeamName)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onCancelAdd} className="flex-1 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-bg-secondary transition-colors">Cancel</button>
            <button onClick={onAddTeam} className="flex-1 py-1.5 text-xs font-medium bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors">Add</button>
          </div>
        </div>
      ) : (
        <button
          onClick={onToggleAddTeam}
          className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-primary border border-dashed border-primary rounded-lg py-2 hover:bg-primary-bg transition-colors"
        >
          <Plus size={15} /> {hasTeams ? "Add New Team" : "Create Team"}
        </button>
      )}
    </div>
  );
}
