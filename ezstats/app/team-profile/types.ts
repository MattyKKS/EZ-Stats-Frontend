export interface Player {
  id: number;
  name: string;
  number: number | string;
  position: string;
  nationality: string;
  photo?: string;
}

export interface Team {
  id: number;
  name: string;
  color: string;
  logo?: string;
  players: Player[];
}

export const TEAM_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6",
];

export const DEFAULT_PLAYERS: Player[] = [
  { id: 1,  name: "Raya",             number: 1,  position: "GK",  nationality: "Thailand" },
  { id: 2,  name: "Donnarumma",       number: 25, position: "GK",  nationality: "Thailand" },
  { id: 3,  name: "Alexander-Arnold", number: 2,  position: "DEF", nationality: "Thailand" },
  { id: 4,  name: "Van Dijk",         number: 3,  position: "DEF", nationality: "Thailand" },
  { id: 5,  name: "Rúben Dias",       number: 4,  position: "DEF", nationality: "Thailand" },
  { id: 6,  name: "Davies",           number: 5,  position: "DEF", nationality: "Thailand" },
  { id: 7,  name: "Rodri",            number: 6,  position: "MID", nationality: "Myanmar"  },
  { id: 8,  name: "De Bruyne",        number: 7,  position: "MID", nationality: "Myanmar"  },
  { id: 9,  name: "Bellingham",       number: 8,  position: "MID", nationality: "Thailand" },
  { id: 10, name: "Haaland",          number: 9,  position: "FW",  nationality: "Myanmar"  },
  { id: 11, name: "Massi",            number: 10, position: "FW",  nationality: "Thailand" },
  { id: 12, name: "Salah",            number: 11, position: "FW",  nationality: "Thailand" },
];

export const EMPTY_PLAYER = { name: "", number: "", position: "", nationality: "" };

export function getAbbr(name: string) {
  return name.split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 3);
}

export function updateTeam(teams: Team[], id: number, patch: Partial<Team>): Team[] {
  return teams.map(t => t.id === id ? { ...t, ...patch } : t);
}

export const inputCls = "w-full border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white";
