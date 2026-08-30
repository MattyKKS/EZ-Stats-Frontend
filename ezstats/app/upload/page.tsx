"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2, Clock } from "lucide-react";
import Header from "@/components/Header";
import VideoDropzone from "./VideoDropzone";
import MatchDetailsForm from "./MatchDetailsForm";
import PlayerReviewTable from "./PlayerReviewTable";
import { useLeaveGuard } from "./useLeaveGuard";
import { EMPTY_FORM, MOCK_ROSTER, RosterPlayer, UploadFormState } from "./types";
import {
  getTeam, getMatch, getMatches, createMatch, updateMatch,
  uploadMatchVideo, getMatchReport, getUploadedVideoUrl,
} from "@/lib/api";
import type { Match, MatchReport } from "@/lib/types";
import { useTeamContext } from "@/lib/TeamContext";

// A match past this point has a video + report but hasn't been finalized —
// i.e. the review step was left unfinished and can be resumed.
const RESUMABLE_STATUSES = ["UPLOADED", "QUEUED", "PROCESSING"];

const HEX = /^#[0-9a-fA-F]{6}$/;

type Stage = "form" | "processing" | "review";

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resume");
  const { teams, selectedTeamId, selectedTeam, setSelectedTeamId } = useTeamContext();

  const [form, setForm] = useState<UploadFormState>({ ...EMPTY_FORM });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>("form");
  const [progress, setProgress] = useState(0);
  const [roster, setRoster] = useState<RosterPlayer[]>(MOCK_ROSTER);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  // The real match created on the backend when the video is uploaded.
  const [matchId, setMatchId] = useState<string | null>(null);
  // The AI-worker report for that match (detected players + crops for mapping).
  const [report, setReport] = useState<MatchReport | null>(null);
  // The uploaded video served back from the backend (byte-range playback).
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  // ?resume=<matchId> jumps straight into the review step for a match whose
  // analysis was left unfinished, instead of starting a new upload.
  const [resuming, setResuming] = useState(!!resumeId);
  const [unfinishedMatch, setUnfinishedMatch] = useState<Match | null>(null);

  // Warn before leaving mid-review — the mapping isn't saved until "Generate".
  const { pendingHref, confirmLeave, cancelLeave } = useLeaveGuard(stage === "review");

  // Keep the form's team field in sync with the globally selected team.
  useEffect(() => {
    setForm(f => (f.teamId === selectedTeamId ? f : { ...f, teamId: selectedTeamId }));
  }, [selectedTeamId]);

  // Rebuild the review step for a previously-abandoned match instead of
  // starting a fresh upload.
  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;
    setResuming(true);

    getMatch(resumeId)
      .then(async m => {
        if (cancelled) return;
        setSelectedTeamId(m.teamId);
        setMatchId(m.id);
        if (m.videoPath) setUploadedVideoUrl(getUploadedVideoUrl(m.videoPath));

        getMatchReport(m.id).then(r => { if (!cancelled) setReport(r); }).catch(() => {});

        try {
          const team = await getTeam(m.teamId);
          if (!cancelled) {
            setRoster(team.players.length > 0
              ? team.players.map(p => ({ id: p.id, name: p.name, jerseyNumber: p.jerseyNumber }))
              : MOCK_ROSTER);
          }
        } catch {
          if (!cancelled) setRoster(MOCK_ROSTER);
        }

        if (!cancelled) setStage("review");
      })
      .catch(() => { if (!cancelled) setToast("Could not resume that analysis"); })
      .finally(() => { if (!cancelled) setResuming(false); });

    return () => { cancelled = true; };
  }, [resumeId, setSelectedTeamId]);

  // On the plain "New Analysis" form, surface the most recent match whose
  // review was left unfinished so it can be picked back up.
  useEffect(() => {
    if (stage !== "form" || resumeId || !selectedTeamId) return;
    let cancelled = false;
    getMatches(selectedTeamId)
      .then(list => {
        if (cancelled) return;
        const unfinished = [...list]
          .filter(m => RESUMABLE_STATUSES.includes(m.status))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
        setUnfinishedMatch(unfinished ?? null);
      })
      .catch(() => { if (!cancelled) setUnfinishedMatch(null); });
    return () => { cancelled = true; };
  }, [stage, selectedTeamId, resumeId]);

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

  // Advance to review only once the fake progress is done AND the real upload
  // has finished (matchId is set), so "Generate" has a real match to open.
  useEffect(() => {
    if (stage === "processing" && progress >= 100 && matchId) {
      const t = setTimeout(() => setStage("review"), 300);
      return () => clearTimeout(t);
    }
  }, [stage, progress, matchId]);

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

  const handleAnalyze = async () => {
    if (!isFormComplete || !file) return;

    setMatchId(null);
    setStage("processing");

    // Best-effort real roster lookup — falls back to mock names when the team
    // has no players yet.
    getTeam(form.teamId)
      .then(t => {
        if (t.players.length > 0) {
          setRoster(t.players.map(p => ({ id: p.id, name: p.name, jerseyNumber: p.jerseyNumber })));
        } else {
          setRoster(MOCK_ROSTER);
        }
      })
      .catch(() => setRoster(MOCK_ROSTER));

    try {
      // Create the match session, then save the video to the backend. Online AI
      // processing isn't wired yet, so the match shows the demo analysis for now.
      const date =
        form.matchDate && form.matchTime
          ? new Date(`${form.matchDate}T${form.matchTime}`).toISOString()
          : undefined;
      const teamColor =
        selectedTeam?.primaryColor && HEX.test(selectedTeam.primaryColor)
          ? selectedTeam.primaryColor
          : undefined;

      const created = await createMatch(form.teamId, {
        opponent: form.opponent.trim(),
        date,
        teamColor,
      });
      const updated = await uploadMatchVideo(created.id, file);
      setMatchId(created.id);
      // Play the video back from the backend (supports range requests, so it
      // plays files a local blob preview can't) in the review/mapping step.
      if (updated.videoPath) setUploadedVideoUrl(getUploadedVideoUrl(updated.videoPath));
      // Pull the detected players (demo run for now) so the review step can map
      // worker track_ids to the real roster, with player crops as photos.
      getMatchReport(created.id).then(r => setReport(r)).catch(() => setReport(null));
    } catch {
      setToast("Upload failed — please try again");
      setStage("form");
    }
  };

  const handleGenerate = async () => {
    // Marks the review as finished so it stops showing up as resumable.
    if (matchId) {
      try { await updateMatch(matchId, { status: "COMPLETED" }); } catch { /* non-fatal */ }
    }
    router.push(matchId ? `/match-statistics/${matchId}` : `/match-statistics/mock-${Date.now()}`);
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-5">
      <Header
        title="Upload Video"
        description="Upload a football match video for analysis"
      />

      <div className="w-full bg-white rounded-2xl border border-border p-8 flex flex-col gap-6">
        {resuming && (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader2 size={28} className="text-primary animate-spin" />
            <p className="text-sm text-text-muted">Resuming your analysis…</p>
          </div>
        )}

        {!resuming && stage === "form" && (
          <>
            {unfinishedMatch && (
              <button
                onClick={() => router.push(`/upload?resume=${unfinishedMatch.id}`)}
                className="flex items-center justify-between gap-3 text-left border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 hover:bg-amber-100/70 transition-colors"
              >
                <span className="flex items-center gap-2.5 text-sm text-amber-800">
                  <Clock size={16} className="flex-shrink-0" />
                  Unfinished analysis vs{" "}
                  <span className="font-semibold">{unfinishedMatch.opponent ?? "opponent"}</span> — resume where you left off
                </span>
                <span className="text-xs font-semibold text-amber-800 whitespace-nowrap">Resume →</span>
              </button>
            )}

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

        {!resuming && stage === "processing" && (
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

        {!resuming && stage === "review" && (
          <PlayerReviewTable
            matchId={matchId}
            report={report}
            videoUrl={uploadedVideoUrl ?? videoUrl}
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

      {pendingHref && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-semibold text-text-primary">Leave this analysis?</h3>
              <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                You haven&apos;t finished reviewing player stats yet. You can resume this analysis later from the Upload Video page.
              </p>
            </div>
            <div className="flex justify-between gap-6">
              <button
                onClick={cancelLeave}
                className="flex-1 px-4 py-3 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-bg-secondary transition-colors"
              >
                Stay
              </button>
              <button
                onClick={confirmLeave}
                className="flex-1 px-4 py-3 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
