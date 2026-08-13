"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getTeams } from "./api";

export type ContextTeam = Awaited<ReturnType<typeof getTeams>>[number];

const STORAGE_KEY = "ezstats:selectedTeamId";

interface TeamContextValue {
  teams: ContextTeam[];
  selectedTeamId: string;
  selectedTeam: ContextTeam | undefined;
  setSelectedTeamId: (id: string) => void;
  loading: boolean;
  refresh: () => Promise<ContextTeam[]>;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<ContextTeam[]>([]);
  const [selectedTeamId, setSelectedTeamIdState] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const apiTeams = await getTeams();
      setTeams(apiTeams);
      setSelectedTeamIdState(prev => {
        if (prev && apiTeams.some(t => t.id === prev)) return prev;
        const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (stored && apiTeams.some(t => t.id === stored)) return stored;
        return apiTeams[0]?.id ?? "";
      });
      return apiTeams;
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSelectedTeamId = (id: string) => {
    setSelectedTeamIdState(id);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, id);
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <TeamContext.Provider value={{ teams, selectedTeamId, selectedTeam, setSelectedTeamId, loading, refresh }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeamContext() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeamContext must be used within a TeamProvider");
  return ctx;
}
