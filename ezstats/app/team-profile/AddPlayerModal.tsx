"use client";

import { useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import { inputCls } from "./types";

interface NewPlayer { name: string; number: string; position: string; nationality: string; }

interface Props {
  newPlayer: NewPlayer;
  photoPreview: string | null;
  existingNumbers: (number | string)[];
  onChange: (patch: Partial<NewPlayer>) => void;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export default function AddPlayerModal({ newPlayer, photoPreview, existingNumbers, onChange, onPhotoChange, onAdd, onCancel }: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);

  const numberTaken =
    newPlayer.number.trim() !== "" &&
    existingNumbers.map(String).includes(newPlayer.number.trim());

  const nameEmpty   = submitted && newPlayer.name.trim() === "";
  const numberEmpty = submitted && newPlayer.number.trim() === "";

  const handleAdd = () => {
    setSubmitted(true);
    if (!newPlayer.name.trim() || !newPlayer.number.trim() || numberTaken) return;
    onAdd();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold text-text-primary">Add Player</h2>
        </div>
        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="flex justify-center">
            <button
              onClick={() => photoInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-bg-secondary hover:bg-border-light flex items-center justify-center overflow-hidden transition-colors"
            >
              {photoPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                : <ImageUp size={28} className="text-text-muted" />}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Player Name</label>
            <input
              className={`${inputCls} ${nameEmpty ? "border-red-400 focus:ring-red-400" : ""}`}
              placeholder="Jonny"
              value={newPlayer.name}
              onChange={e => onChange({ name: e.target.value })}
            />
            {nameEmpty && <p className="text-xs text-red-500 mt-1">This field is required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Player Country</label>
            <input className={inputCls} placeholder="Thailand" value={newPlayer.nationality} onChange={e => onChange({ nationality: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Player Number</label>
              <input
                className={`${inputCls} ${numberTaken || numberEmpty ? "border-red-400 focus:ring-red-400" : ""}`}
                placeholder="00"
                type="number"
                value={newPlayer.number}
                onChange={e => onChange({ number: e.target.value.replace(/[^0-9]/g, "") })}
              />
              {numberEmpty && <p className="text-xs text-red-500 mt-1">This field is required</p>}
              {numberTaken && <p className="text-xs text-red-500 mt-1">#{newPlayer.number} is already taken</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Player Position</label>
              <div className="relative">
                <select
                  className={`${inputCls} pr-8 appearance-none`}
                  value={newPlayer.position}
                  onChange={e => onChange({ position: e.target.value })}
                >
                  <option value="">Position</option>
                  <option value="GK">GK</option>
                  <option value="DEF">DEF</option>
                  <option value="MID">MID</option>
                  <option value="FW">FW</option>
                </select>
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-3 px-6 py-4">
          <button onClick={onCancel} className="px-5 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-bg-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={numberTaken}
            className="px-5 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Player
          </button>
        </div>
      </div>
    </div>
  );
}
