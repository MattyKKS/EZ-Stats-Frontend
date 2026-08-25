"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import VideoDropzone from "./VideoDropzone";
import MatchDetailsForm from "./MatchDetailsForm";
import PlayerReviewTable from "./PlayerReviewTable";
import { EMPTY_FORM, MOCK_ROSTER, RosterPlayer, UploadFormState } from "./types";
import { getTeam } from "@/lib/api";
import { useTeamContext } from "@/lib/TeamContext";

type Stage = "form" | "processing" | "review";

export default function UploadPage() {
  const router = useRouter();
  const { teams, selectedTeamId, selectedTeam, setSelectedTeamId } = useTeamContext();

  const [form, setForm] = useState<UploadFormState>({ ...EMPTY_FORM });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>("form");
  const [progress, setProgress] = useState(0);
  const [roster, setRoster] = useState<RosterPlayer[]>(MOCK_ROSTER);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Keep the form's team field in sync with the globally selected team.
  useEffect(() => {
    setForm(f => (f.teamId === selectedTeamId ? f : { ...f, teamId: selectedTeamId }));
  }, [selectedTeamId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Keep a playable preview URL for the uploaded file alive across stages
  useEffect(() => {
    if (!file) { setVideoUrl(null); return; }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Simulated AI analysis progress bar — no worker/backend wired up yet.
  useEffect(() => {
    if (stage !== "processing") return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => Math.min(100, p + Math.random() * 12 + 6));
    }, 250);
    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (stage === "processing" && progress >= 100) {
      const t = setTimeout(() => setStage("review"), 300);
      return () => clearTimeout(t);
    }
  }, [stage, progress]);

  // Updating the team here also updates the global selection, so switching
  // teams from this form (or the header switcher) stays in sync everywhere.
  const updateForm = (patch: Partial<UploadFormState>) => {
    setForm(f => ({ ...f, ...patch }));
    if (patch.teamId !== undefined && patch.teamId !== selectedTeamId) {
      setSelectedTeamId(patch.teamId);
    }
  };

  const isFormComplete =
    !!file &&
    form.matchTitle.trim() !== "" &&
    form.teamId !== "" &&
    form.matchDate !== "" &&
    form.matchTime !== "" &&
    form.opponent.trim() !== "";

  const handleAnalyze = () => {
    if (!isFormComplete) return;

    // Best-effort real roster lookup — falls back to mock names since the
    // AI worker / backend isn't wired up yet.
    getTeam(form.teamId)
      .then(t => {
        if (t.players.length > 0) {
          setRoster(t.players.map(p => ({ id: p.id, name: p.name, jerseyNumber: p.jerseyNumber })));
        } else {
          setRoster(MOCK_ROSTER);
        }
      })
      .catch(() => setRoster(MOCK_ROSTER));

    setStage("processing");
  };

  const handleGenerate = () => {
    router.push(`/match-statistics/mock-${Date.now()}`);
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-5">
      <Header
        title="Upload Video"
        description="Upload a football match video for analysis"
      />

      <div className="w-full bg-white rounded-2xl border border-border p-8 flex flex-col gap-6">
        {stage === "form" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <VideoDropzone
                  file={file}
                  onFileSelect={f => { setFile(f); setFileError(null); }}
                  onFileClear={() => setFile(null)}
                  error={fileError}
                />
              </div>

              <MatchDetailsForm form={form} teams={teams} onChange={updateForm} />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!isFormComplete}
              className={`w-full inline-flex items-center justify-center gap-2 text-white text-sm font-semibold py-3 rounded-xl transition-colors ${
                isFormComplete
                  ? "bg-primary hover:bg-primary-hover cursor-pointer"
                  : "bg-primary/40 cursor-not-allowed"
              }`}
            >
              <Sparkles size={16} />
              Analyze with AI
            </button>
            {!isFormComplete && (
              <p className="text-xs text-text-muted text-center -mt-3">
                Fill in all fields and upload a video to enable analysis
              </p>
            )}
          </>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="text-sm font-medium text-text-primary">Analyzing video with AI…</p>
            <div className="w-full max-w-sm h-2 rounded-full bg-bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-text-muted">{Math.round(progress)}%</p>
          </div>
        )}

        {stage === "review" && (
          <PlayerReviewTable
            videoUrl={videoUrl}
            teamName={selectedTeam?.name ?? "Team"}
            teamColor={selectedTeam?.primaryColor ?? "#05714B"}
            roster={roster}
            onGenerate={handleGenerate}
          />
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
