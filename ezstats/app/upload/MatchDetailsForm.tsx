"use client";

import { inputCls, UploadFormState } from "./types";
import TeamHomeAwaySelect from "./TeamHomeAwaySelect";
import type { Team } from "@/lib/types";

interface Props {
  form: UploadFormState;
  teams: Team[];
  onChange: (patch: Partial<UploadFormState>) => void;
}

export default function MatchDetailsForm({ form, teams, onChange }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-1.5">Match Title</label>
        <input
          className={inputCls}
          placeholder="Example League Match Round 1"
          value={form.matchTitle}
          onChange={e => onChange({ matchTitle: e.target.value })}
        />
      </div>

      <TeamHomeAwaySelect
        teams={teams}
        teamId={form.teamId}
        isHome={form.isHome}
        onTeamChange={id => onChange({ teamId: id })}
        onToggleHome={() => onChange({ isHome: !form.isHome })}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">Match Date</label>
          <input
            type="date"
            className={inputCls}
            value={form.matchDate}
            onChange={e => onChange({ matchDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">Match Time</label>
          <input
            type="time"
            className={inputCls}
            value={form.matchTime}
            onChange={e => onChange({ matchTime: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-1.5">Opponent Team</label>
        <input
          className={inputCls}
          placeholder="Example Fc"
          value={form.opponent}
          onChange={e => onChange({ opponent: e.target.value })}
        />
      </div>
    </div>
  );
}
