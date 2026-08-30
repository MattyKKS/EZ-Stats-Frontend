const POSITION_STYLE: Record<string, string> = {
  GK:  "bg-yellow-50 text-yellow-700 border-yellow-300",
  DEF: "bg-blue-50 text-blue-700 border-blue-300",
  MID: "bg-purple-50 text-purple-700 border-purple-300",
  FW:  "bg-red-50 text-red-700 border-red-300",
};

export default function PositionBadge({ position }: { position: string | null }) {
  if (!position) return <span className="text-xs text-text-muted">—</span>;
  const key = position.toUpperCase();
  const cls = POSITION_STYLE[key] ?? "bg-gray-50 text-gray-600 border-gray-300";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {key}
    </span>
  );
}
