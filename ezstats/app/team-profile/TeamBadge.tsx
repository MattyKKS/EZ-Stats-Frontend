import { Team, getAbbr } from "./types";

export default function TeamBadge({ team, size = "md" }: { team: Team; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  return (
    <span
      className={`${dim} rounded-md flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: team.color }}
    >
      {getAbbr(team.name)}
    </span>
  );
}
