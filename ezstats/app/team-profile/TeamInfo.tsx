"use client";

import { useRef } from "react";
import { ImageUp, Pencil, Check, X } from "lucide-react";
import { Team } from "./types";

interface Props {
  team: Team;
  playerCount: number;
  editing: boolean;
  nameDraft: string;
  onStartEdit: () => void;
  onNameDraftChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TeamInfo({
  team, playerCount, editing, nameDraft,
  onStartEdit, onNameDraftChange, onSave, onCancel, onLogoChange,
}: Props) {
  const logoRef = useRef<HTMLInputElement>(null);

  return (
    <div className="col-span-6 md:col-span-4 bg-white rounded-xl border border-border p-6 flex items-center gap-6">
      <button
        onClick={() => logoRef.current?.click()}
        className="w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-primary flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors"
      >
        {team.logo
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={team.logo} alt="team logo" className="w-full h-full object-cover" />
          : <ImageUp size={24} className="text-text-muted" />}
      </button>
      <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onLogoChange} />

      <div className="flex-1 flex flex-col md:flex-row md:items-start md:justify-between min-w-0 gap-2">
        {editing ? (
          <div className="flex items-center gap-1 shrink-0 self-end md:self-auto md:order-last">
            <button onClick={onSave} className="p-1.5 rounded bg-green-50 hover:bg-green-100" title="Save">
              <Check size={15} className="text-primary" />
            </button>
            <button onClick={onCancel} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200" title="Cancel">
              <X size={15} className="text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={onStartEdit}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary shrink-0 self-end md:self-auto md:order-last transition-colors"
          >
            <Pencil size={14} /> Edit
          </button>
        )}
        <div className="flex flex-col gap-2 md:order-first">
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary w-28 shrink-0">Team Name:</span>
            {editing
              ? <input className="border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-0" value={nameDraft} onChange={e => onNameDraftChange(e.target.value)} />
              : <span className="font-semibold text-text-primary">{team.name}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary w-28 shrink-0">Team Members:</span>
            <span className="font-semibold text-text-primary">{playerCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
