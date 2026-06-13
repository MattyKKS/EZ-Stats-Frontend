"use client";

import { useRef, useState } from "react";
import { Pencil, Plus, UserCircle2, ImageUp, Check, Trash2, X } from "lucide-react";
import Header from "@/components/Header";

const positionColors: Record<string, string> = {
  GK:  "bg-yellow-100 text-yellow-700",
  DEF: "bg-blue-100 text-blue-700",
  MID: "bg-purple-100 text-purple-700",
  FW:  "bg-red-100 text-red-600",
};

function PositionBadge({ position }: { position: string }) {
  const cls = positionColors[position] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {position}
    </span>
  );
}

interface Player {
  id: number;
  name: string;
  number: number | string;
  position: string;
  nationality: string;
  photo?: string;
}

const INITIAL_PLAYERS: Player[] = [
  { id: 1,  name: "Raya",            number: 1,  position: "GK",  nationality: "Thailand" },
  { id: 2,  name: "Donnarumma",      number: 25, position: "GK",  nationality: "Thailand" },
  { id: 3,  name: "Alexander-Arnold",number: 2,  position: "DEF", nationality: "Thailand" },
  { id: 4,  name: "Van Dijk",        number: 3,  position: "DEF", nationality: "Thailand" },
  { id: 5,  name: "Rúben Dias",      number: 4,  position: "DEF", nationality: "Thailand" },
  { id: 6,  name: "Davies",          number: 5,  position: "DEF", nationality: "Thailand" },
  { id: 7,  name: "Rodri",           number: 6,  position: "MID", nationality: "Myanmar"  },
  { id: 8,  name: "De Bruyne",       number: 7,  position: "MID", nationality: "Myanmar"  },
  { id: 9,  name: "Bellingham",      number: 8,  position: "MID", nationality: "Thailand" },
  { id: 10, name: "Haaland",         number: 9,  position: "FW",  nationality: "Myanmar"  },
  { id: 11, name: "Massi",           number: 10, position: "FW",  nationality: "Thailand" },
  { id: 12, name: "Salah",           number: 11, position: "FW",  nationality: "Thailand" },
];

const EMPTY = { name: "", number: "", position: "", nationality: "" };

export default function TeamProfilePage() {
  const [players, setPlayers]       = useState<Player[]>(INITIAL_PLAYERS);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editData, setEditData]     = useState<Partial<Player>>({});
  const [showModal, setShowModal]   = useState(false);
  const [newPlayer, setNewPlayer]   = useState({ ...EMPTY });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Team info state
  const [teamName, setTeamName]         = useState("SE United");
  const [editingTeam, setEditingTeam]   = useState(false);
  const [teamNameDraft, setTeamNameDraft] = useState(teamName);
  const [teamLogo, setTeamLogo]         = useState<string | null>(null);
  const teamLogoRef  = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Inline row edit
  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setEditData({ name: p.name, number: p.number, position: p.position, nationality: p.nationality });
  };
  const saveEdit = () => {
    setPlayers(ps => ps.map(p => p.id === editingId ? { ...p, ...editData } : p));
    setEditingId(null);
  };
  const deletePlayer = (id: number) => {
    setPlayers(ps => ps.filter(p => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  // Add player 
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  const handleTeamLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setTeamLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  const addPlayer = () => {
    if (!newPlayer.name.trim()) return;
    setPlayers(ps => [
      ...ps,
      { id: Date.now(), ...newPlayer, photo: photoPreview ?? undefined },
    ]);
    setNewPlayer({ ...EMPTY });
    setPhotoPreview(null);
    setShowModal(false);
  };

  const inputCls = "w-full border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white";

  return (
    <div className="min-h-screen bg-bg-secondary p-7">
      <Header title="Team Profile" description="Manage your team roster" />

      {/* Team info card */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6 flex items-center gap-6">
        {/* Logo */}
        <button
          onClick={() => teamLogoRef.current?.click()}
          className="w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-primary flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors"
        >
          {teamLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={teamLogo} alt="team logo" className="w-full h-full object-cover" />
          ) : (
            <ImageUp size={24} className="text-text-muted" />
          )}
        </button>
        <input ref={teamLogoRef} type="file" accept="image/*" className="hidden" onChange={handleTeamLogoChange} />

        <div className="flex-1 flex flex-col md:flex-row md:items-start md:justify-between min-w-0 gap-2">
          {editingTeam ? (
            <div className="flex items-center gap-1 shrink-0 self-end md:self-auto md:order-last">
              <button onClick={() => { setTeamName(teamNameDraft); setEditingTeam(false); }} className="p-1.5 rounded bg-green-50 hover:bg-green-100" title="Save">
                <Check size={15} className="text-primary" />
              </button>
              <button onClick={() => { setTeamNameDraft(teamName); setEditingTeam(false); }} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200" title="Cancel">
                <X size={15} className="text-gray-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setTeamNameDraft(teamName); setEditingTeam(true); }}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary shrink-0 self-end md:self-auto md:order-last transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
          )}

          {/* Team fields */}
          <div className="flex flex-col gap-2 md:order-first">
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary w-28 shrink-0">Team Name:</span>
              {editingTeam ? (
                <input
                  className="border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-0"
                  value={teamNameDraft}
                  onChange={e => setTeamNameDraft(e.target.value)}
                />
              ) : (
                <span className="font-semibold text-text-primary">{teamName}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary w-28 shrink-0">Team Members:</span>
              <span className="font-semibold text-text-primary">{players.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roster card */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {/* Roster header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-text-primary text-base">Team Roster</h2>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary-bg transition-colors"
          >
            <Plus size={15} />
            Add Player
          </button>
        </div>

        {/* Table */}
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
                    <td className="px-6 py-2">
                      <input className={inputCls} value={editData.name ?? ""} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} />
                    </td>
                    <td className="hidden md:table-cell px-4 py-2">
                      <input className={inputCls} value={editData.number ?? ""} onChange={e => setEditData(d => ({ ...d, number: e.target.value }))} />
                    </td>
                    <td className="px-4 py-2">
                      <select className={inputCls} value={editData.position ?? ""} onChange={e => setEditData(d => ({ ...d, position: e.target.value }))}>
                        <option value="">Position</option>
                        <option value="GK">GK</option>
                        <option value="DEF">DEF</option>
                        <option value="MID">MID</option>
                        <option value="FW">FW</option>
                      </select>
                    </td>
                    <td className="hidden md:table-cell px-4 py-2">
                      <input className={inputCls} value={editData.nationality ?? ""} onChange={e => setEditData(d => ({ ...d, nationality: e.target.value }))} />
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={saveEdit} className="p-1.5 rounded bg-green-50 hover:bg-green-100" title="Save">
                          <Check size={15} className="text-primary" />
                        </button>
                        <button onClick={() => deletePlayer(player.id)} className="p-1.5 rounded bg-red-50 hover:bg-red-100" title="Delete">
                          <Trash2 size={15} className="text-red-400" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200" title="Cancel">
                          <X size={15} className="text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {player.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={player.photo} alt={player.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <UserCircle2 size={28} className="text-text-muted flex-shrink-0" />
                        )}
                        <span className="font-medium text-text-primary">{player.name}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-text-secondary">{player.number}</td>
                    <td className="px-4 py-3"><PositionBadge position={player.position} /></td>
                    <td className="hidden md:table-cell px-4 py-3 text-text-secondary">{player.nationality}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => startEdit(player)}
                          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
                        >
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
      </div>

      {/* Add Player modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            {/* Header */}
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-lg font-semibold text-text-primary">Add Player</h2>
            </div>

            <div className="px-6 py-4 flex flex-col gap-4">
              {/* Photo */}
              <div className="flex justify-center">
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-bg-secondary hover:bg-border-light flex items-center justify-center overflow-hidden transition-colors"
                >
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageUp size={28} className="text-text-muted" />
                  )}
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              {/* Player Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Player Name</label>
                <input
                  className={inputCls}
                  placeholder="Jonny"
                  value={newPlayer.name}
                  onChange={e => setNewPlayer(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              {/* Player Country */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Player Country</label>
                <input
                  className={inputCls}
                  placeholder="Thailand"
                  value={newPlayer.nationality}
                  onChange={e => setNewPlayer(p => ({ ...p, nationality: e.target.value }))}
                />
              </div>

              {/* Number + Position */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Player Number</label>
                  <input
                    className={inputCls}
                    placeholder="00"
                    value={newPlayer.number}
                    onChange={e => setNewPlayer(p => ({ ...p, number: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Player Position</label>
                  <select
                    className={inputCls}
                    value={newPlayer.position}
                    onChange={e => setNewPlayer(p => ({ ...p, position: e.target.value }))}
                  >
                    <option value="">Position</option>
                    <option value="GK">GK</option>
                    <option value="DEF">DEF</option>
                    <option value="MID">MID</option>
                    <option value="FW">FW</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between gap-3 px-6 py-4">
              <button
                onClick={() => { setShowModal(false); setNewPlayer({ ...EMPTY }); setPhotoPreview(null); }}
                className="px-5 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addPlayer}
                className="px-5 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                Add Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
