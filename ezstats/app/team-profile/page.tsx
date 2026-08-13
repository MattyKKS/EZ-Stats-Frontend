"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import TeamSelector from "./TeamSelection";
import TeamInfo from "./TeamInfo";
import TeamRoster from "./TeamRoster";
import AddPlayerModal from "./AddPlayerModal";
import { Team, Player, TEAM_COLORS, EMPTY_PLAYER } from "./types";
import { useTeamContext } from "@/lib/TeamContext";
import {
  BASE_URL,
  getTeam,
  createTeam as apiCreateTeam,
  updateTeam as apiUpdateTeam,
  uploadTeamLogo,
  createPlayer as apiCreatePlayer,
  updatePlayer as apiUpdatePlayer,
  deletePlayer as apiDeletePlayer,
} from "@/lib/api";

function toUiPlayer(p: { id: string; name: string; jerseyNumber: number | null; position: string | null }): Player {
  return { id: p.id, name: p.name, number: p.jerseyNumber ?? "", position: p.position ?? "", nationality: "" };
}

interface TeamOverride {
  name?: string;
  color?: string;
  logo?: string;
}

export default function TeamProfilePage() {
  const { teams: ctxTeams, selectedTeamId, setSelectedTeamId, loading, refresh } = useTeamContext();

  // Local overrides/roster layered on top of the globally shared team list —
  // keeps this page's richer per-team data without duplicating the fetch.
  const [overrides, setOverrides] = useState<Record<string, TeamOverride>>({});
  const [playersByTeam, setPlayersByTeam] = useState<Record<string, Player[]>>({});

  // Team selection card
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showAddTeam, setShowAddTeam]           = useState(false);
  const [newTeamName, setNewTeamName]           = useState("");
  const [newTeamColor, setNewTeamColor]         = useState(TEAM_COLORS[4]);

  // Team info edit
  const [editingTeam, setEditingTeam]     = useState(false);
  const [teamNameDraft, setTeamNameDraft] = useState("");

  // Player edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData]   = useState<Partial<Player>>({});

  // Add player modal
  const [showModal, setShowModal]       = useState(false);
  const [newPlayer, setNewPlayer]       = useState({ ...EMPTY_PLAYER });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const teams: Team[] = ctxTeams.map(t => ({
    id: t.id,
    name: overrides[t.id]?.name ?? t.name,
    color: overrides[t.id]?.color ?? t.primaryColor ?? TEAM_COLORS[0],
    logo: overrides[t.id]?.logo ?? (t.logoUrl ? `${BASE_URL}${t.logoUrl}` : undefined),
    players: playersByTeam[t.id] ?? [],
  }));

  const selectedTeam = teams.find(t => t.id === selectedTeamId) ?? teams[0];

  // Load the roster for whichever team is globally selected
  useEffect(() => {
    if (!selectedTeamId) return;
    getTeam(selectedTeamId)
      .then(apiTeam => {
        setPlayersByTeam(m => ({ ...m, [selectedTeamId]: apiTeam.players.map(toUiPlayer) }));
        if (apiTeam.logoUrl) {
          setOverrides(o => ({ ...o, [selectedTeamId]: { ...o[selectedTeamId], logo: `${BASE_URL}${apiTeam.logoUrl}` } }));
        }
      })
      .catch(() => {});
  }, [selectedTeamId]);

  // Team handlers
  const addTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      const apiTeam = await apiCreateTeam({ name: newTeamName.trim(), primaryColor: newTeamColor });
      await refresh();
      setSelectedTeamId(apiTeam.id);
      setToast(`"${apiTeam.name}" has been created`);
      setNewTeamName(""); setNewTeamColor(TEAM_COLORS[4]);
      setShowAddTeam(false); setShowTeamDropdown(false);
      setEditingId(null);
    } catch {
      setToast("Failed to create team");
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const updatedTeam = await uploadTeamLogo(selectedTeamId, file);
      const logo = updatedTeam.logoUrl ? `${BASE_URL}${updatedTeam.logoUrl}` : undefined;
      setOverrides(o => ({ ...o, [selectedTeamId]: { ...o[selectedTeamId], logo } }));
    } catch {
      setToast("Logo upload failed — use PNG/JPG/WEBP/SVG under 2 MB");
    }
  };

  // Player handlers
  const mutatePlayers = (fn: (ps: Player[]) => Player[]) =>
    setPlayersByTeam(m => ({ ...m, [selectedTeamId]: fn(m[selectedTeamId] ?? []) }));

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setEditData({ name: p.name, number: p.number, position: p.position, nationality: p.nationality });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const jerseyNumber = editData.number === "" ? undefined : Number(editData.number);
      await apiUpdatePlayer(editingId, { name: editData.name, jerseyNumber, position: editData.position || undefined });
      mutatePlayers(ps => ps.map(p => p.id === editingId ? { ...p, ...editData } : p));
      setToast(`"${editData.name}" has been updated`);
      setEditingId(null);
    } catch {
      setToast("Failed to update player");
    }
  };

  const deletePlayer = async (id: string) => {
    try {
      await apiDeletePlayer(id);
      mutatePlayers(ps => ps.filter(p => p.id !== id));
      if (editingId === id) setEditingId(null);
    } catch {
      setToast("Failed to delete player");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addPlayer = async () => {
    if (!newPlayer.name.trim()) return;
    try {
      const jerseyNumber = newPlayer.number === "" ? undefined : Number(newPlayer.number);
      const apiPlayer = await apiCreatePlayer(selectedTeamId, {
        name: newPlayer.name,
        jerseyNumber,
        position: newPlayer.position || undefined,
      });
      const uiPlayer: Player = { ...toUiPlayer(apiPlayer), nationality: newPlayer.nationality, photo: photoPreview ?? undefined };
      mutatePlayers(ps => [...ps, uiPlayer]);
      setToast(`"${newPlayer.name}" has been added`);
      setNewPlayer({ ...EMPTY_PLAYER }); setPhotoPreview(null); setShowModal(false);
    } catch {
      setToast("Failed to add player");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary p-5">
        <Header title="Team Profile" description="Manage your team roster" />
        <div className="flex items-center justify-center mt-20">
          <p className="text-sm text-text-muted">Loading teams…</p>
        </div>
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-bg-secondary p-5">
        <Header title="Team Profile" description="Manage your team roster" />
        <div className="mt-4 bg-white rounded-xl border border-border flex flex-col items-center justify-center py-16">
          <p className="text-lg font-bold text-text-primary">No teams yet</p>
          <p className="text-xs text-text-muted mt-1">Add your first team using the button below</p>
          <div className="mt-4 w-80">
            <TeamSelector
              teams={[]}
              selectedTeam={{ id: "", name: "", color: TEAM_COLORS[0], players: [] }}
              showDropdown={false}
              showAddTeam={showAddTeam}
              newTeamName={newTeamName}
              newTeamColor={newTeamColor}
              onToggleDropdown={() => {}}
              onSelectTeam={() => {}}
              onToggleAddTeam={() => setShowAddTeam(true)}
              onNewTeamNameChange={setNewTeamName}
              onNewTeamColorChange={setNewTeamColor}
              onAddTeam={addTeam}
              onCancelAdd={() => setShowAddTeam(false)}
            />
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
            {toast}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary p-5">
      <Header title="Team Profile" description="Manage your team roster" />

      <div className="grid grid-cols-6 gap-4 mb-6">
        <TeamSelector
          teams={teams}
          selectedTeam={selectedTeam}
          showDropdown={showTeamDropdown}
          showAddTeam={showAddTeam}
          newTeamName={newTeamName}
          newTeamColor={newTeamColor}
          onToggleDropdown={() => { setShowTeamDropdown(v => !v); setShowAddTeam(false); }}
          onSelectTeam={id => { setSelectedTeamId(id); setShowTeamDropdown(false); setEditingId(null); }}
          onToggleAddTeam={() => { setShowAddTeam(true); setShowTeamDropdown(false); }}
          onNewTeamNameChange={setNewTeamName}
          onNewTeamColorChange={setNewTeamColor}
          onAddTeam={addTeam}
          onCancelAdd={() => setShowAddTeam(false)}
        />
        <TeamInfo
          team={selectedTeam}
          playerCount={selectedTeam.players.length}
          editing={editingTeam}
          nameDraft={teamNameDraft}
          onStartEdit={() => { setTeamNameDraft(selectedTeam.name); setEditingTeam(true); }}
          onNameDraftChange={setTeamNameDraft}
          onSave={async () => {
            try {
              await apiUpdateTeam(selectedTeamId, { name: teamNameDraft });
              setOverrides(o => ({ ...o, [selectedTeamId]: { ...o[selectedTeamId], name: teamNameDraft } }));
              setToast(`Team name updated to "${teamNameDraft}"`);
              setEditingTeam(false);
              refresh();
            } catch {
              setToast("Failed to update team");
            }
          }}
          onCancel={() => setEditingTeam(false)}
          onLogoChange={handleLogoChange}
        />
      </div>

      <TeamRoster
        players={selectedTeam.players}
        editingId={editingId}
        editData={editData}
        onStartEdit={startEdit}
        onEditChange={patch => setEditData(d => ({ ...d, ...patch }))}
        onSaveEdit={saveEdit}
        onCancelEdit={() => setEditingId(null)}
        onDelete={deletePlayer}
        onAddPlayer={() => setShowModal(true)}
      />

      {showModal && (
        <AddPlayerModal
          newPlayer={newPlayer}
          photoPreview={photoPreview}
          existingNumbers={selectedTeam.players.map(p => p.number)}
          onChange={patch => setNewPlayer(p => ({ ...p, ...patch }))}
          onPhotoChange={handlePhotoChange}
          onAdd={addPlayer}
          onCancel={() => { setShowModal(false); setNewPlayer({ ...EMPTY_PLAYER }); setPhotoPreview(null); }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
