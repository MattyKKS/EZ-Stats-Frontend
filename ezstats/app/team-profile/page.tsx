"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import TeamSelector from "./TeamSelection";
import TeamInfo from "./TeamInfo";
import TeamRoster from "./TeamRoster";
import AddPlayerModal from "./AddPlayerModal";
import { Team, Player, TEAM_COLORS, DEFAULT_PLAYERS, EMPTY_PLAYER, updateTeam } from "./types";


export default function TeamProfilePage() {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: "SE United", color: "#EF4444", players: DEFAULT_PLAYERS },
  ]);
  const [selectedTeamId, setSelectedTeamId] = useState(1);

  // Team selection 
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showAddTeam, setShowAddTeam]           = useState(false);
  const [newTeamName, setNewTeamName]           = useState("");
  const [newTeamColor, setNewTeamColor]         = useState(TEAM_COLORS[4]);

  // Team info edit 
  const [editingTeam, setEditingTeam]     = useState(false);
  const [teamNameDraft, setTeamNameDraft] = useState("");

  // Player edit 
  const [editingId, setEditingId] = useState<number | null>(null);
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

  const selectedTeam = teams.find(t => t.id === selectedTeamId) ?? teams[0];

  //  Team handlers 
  const addTeam = () => {
    if (!newTeamName.trim()) return;
    const team: Team = { id: Date.now(), name: newTeamName.trim(), color: newTeamColor, players: [] };
    setTeams(ts => [...ts, team]);
    setSelectedTeamId(team.id);
    setToast(`"${team.name}" has been created`);
    setNewTeamName(""); setNewTeamColor(TEAM_COLORS[4]);
    setShowAddTeam(false); setShowTeamDropdown(false);
    setEditingId(null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setTeams(ts => updateTeam(ts, selectedTeamId, { logo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  //  Player handlers 
  const mutatePlayers = (fn: (ps: Player[]) => Player[]) =>
    setTeams(ts => updateTeam(ts, selectedTeamId, { players: fn(selectedTeam.players) }));

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setEditData({ name: p.name, number: p.number, position: p.position, nationality: p.nationality });
  };
  const saveEdit = () => {
    mutatePlayers(ps => ps.map(p => p.id === editingId ? { ...p, ...editData } : p));
    setToast(`"${editData.name}" has been updated`);
    setEditingId(null);
  };
  const deletePlayer = (id: number) => {
    mutatePlayers(ps => ps.filter(p => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addPlayer = () => {
    if (!newPlayer.name.trim()) return;
    mutatePlayers(ps => [...ps, { id: Date.now(), ...newPlayer, photo: photoPreview ?? undefined }]);
    setToast(`"${newPlayer.name}" has been added`);
    setNewPlayer({ ...EMPTY_PLAYER }); setPhotoPreview(null); setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-7">
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
          onSave={() => {
            setTeams(ts => updateTeam(ts, selectedTeamId, { name: teamNameDraft }));
            setToast(`Team name updated to "${teamNameDraft}"`);
            setEditingTeam(false);
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}

