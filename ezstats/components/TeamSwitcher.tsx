"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTeamContext } from "@/lib/TeamContext";

function getAbbr(name: string) {
  return name.split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 3);
}

function Badge({ name, color }: { name: string; color: string | null }) {
  return (
    <span
      className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
      style={{ backgroundColor: color ?? "#6B7280" }}
    >
      {getAbbr(name)}
    </span>
  );
}

// Global team switcher shown in every page header. Changing the team here
// updates TeamContext, which every page reads from to scope its data.
export default function TeamSwitcher() {
  const { teams, selectedTeam, setSelectedTeamId, loading } = useTeamContext();
  const [open, setOpen] = useState(false);

  if (loading && teams.length === 0) return null;
  if (!loading && teams.length === 0) return null;
  if (!selectedTeam) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-48 flex items-center justify-between gap-1.5 bg-white border border-border rounded-lg px-2.5 py-1.5 text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors"
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <Badge name={selectedTeam.name} color={selectedTeam.primaryColor} />
          <span className="truncate">{selectedTeam.name}</span>
        </span>
        <ChevronDown size={14} className="text-text-muted flex-shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-border rounded-lg shadow-lg z-20 overflow-hidden">
            {teams.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelectedTeamId(t.id); setOpen(false); }}
                className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 text-sm hover:bg-bg-secondary transition-colors ${
                  t.id === selectedTeam.id ? "bg-primary-bg" : ""
                }`}
              >
                <Badge name={t.name} color={t.primaryColor} />
                <span className={t.id === selectedTeam.id ? "text-primary font-medium" : "text-text-primary"}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
