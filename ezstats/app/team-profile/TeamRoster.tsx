"use client";

import { useState } from "react";
import { Plus, UserCircle2, Pencil, Check, Trash2, X } from "lucide-react";
import { Player, inputCls } from "./types";

const positionColors: Record<string, string> = {
  GK:  "bg-yellow-100 text-yellow-700",
  DEF: "bg-blue-100 text-blue-700",
  MID: "bg-purple-100 text-purple-700",
  FW:  "bg-red-100 text-red-600",
};
function PositionBadge({ position }: { position: string }) {
  const cls = positionColors[position] ?? "bg-gray-100 text-gray-600";
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{position}</span>;
}

interface Props {
  players: Player[];
  editingId: string | null;
  editData: Partial<Player>;
  onStartEdit: (p: Player) => void;
  onEditChange: (patch: Partial<Player>) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onAddPlayer: () => void;
}

export default function TeamRoster({
  players, editingId, editData,
  onStartEdit, onEditChange, onSaveEdit, onCancelEdit, onDelete, onAddPlayer,
}: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const confirmPlayer = players.find(p => p.id === confirmId);

  return (
    <>
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-semibold text-text-primary text-base">
          Team Roster
          <span className="ml-2 text-sm font-normal text-text-muted">({players.length})</span>
        </h2>
        <button
          onClick={onAddPlayer}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary-bg transition-colors"
        >
          <Plus size={15} /> Add Player
        </button>
      </div>

      {players.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UserCircle2 size={48} className="text-border mb-3" />
          <p className="text-sm font-medium text-text-secondary">No players yet</p>
          <p className="text-xs text-text-muted mt-1">Click &ldquo;Add Player&rdquo; to build your roster</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary-bg border-b border-border">
              <th className="text-left px-6 py-3 font-semibold text-primary">Player Name</th>
              <th className="hidden md:table-cell text-left px-4 py-3 font-semibold text-primary">Number</th>
              <th className="text-left px-4 py-3 font-semibold text-primary">Position</th>
              <th className="hidden md:table-cell text-left px-4 py-3 font-semibold text-primary">Country</th>
              <th className="text-right px-6 py-3 font-semibold text-primary">Action</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 transition-colors">
                {editingId === player.id ? (
                  <>
                    <td className="px-6 py-2"><input className={inputCls} value={editData.name ?? ""} onChange={e => onEditChange({ name: e.target.value })} /></td>
                    <td className="hidden md:table-cell px-4 py-2"><input className={inputCls} value={editData.number ?? ""} onChange={e => onEditChange({ number: e.target.value })} /></td>
                    <td className="px-4 py-2">
                      <div className="relative">
                        <select
                          className={`${inputCls} pr-8 appearance-none`}
                          value={editData.position ?? ""}
                          onChange={e => onEditChange({ position: e.target.value })}
                        >
                          <option value="">Position</option>
                          <option value="GK">GK</option>
                          <option value="DEF">DEF</option>
                          <option value="MID">MID</option>
                          <option value="FW">FW</option>
                        </select>
                        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-2"><input className={inputCls} value={editData.nationality ?? ""} onChange={e => onEditChange({ nationality: e.target.value })} /></td>
                    <td className="px-6 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={onSaveEdit} className="p-1.5 rounded bg-green-50 hover:bg-green-100" title="Save"><Check size={15} className="text-primary" /></button>
                        <button onClick={() => setConfirmId(player.id)} className="p-1.5 rounded bg-red-50 hover:bg-red-100" title="Delete"><Trash2 size={15} className="text-red-400" /></button>
                        <button onClick={onCancelEdit} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200" title="Cancel"><X size={15} className="text-gray-400" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {player.photo
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={player.photo} alt={player.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          : <UserCircle2 size={28} className="text-text-muted flex-shrink-0" />}
                        <span className="font-medium text-text-primary">{player.name}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-text-secondary">{player.number}</td>
                    <td className="px-4 py-3"><PositionBadge position={player.position} /></td>
                    <td className="hidden md:table-cell px-4 py-3 text-text-secondary">{player.nationality}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end">
                        <button onClick={() => onStartEdit(player)} className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
                          <Pencil size={14} /> Edit
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

      {confirmPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Delete Player</h3>
              <p className="text-sm text-text-secondary mt-1">
                Are you sure you want to delete <span className="font-medium text-text-primary">{confirmPlayer.name}</span>?
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(confirmPlayer.id); setConfirmId(null); }}
                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
