"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import Header from "@/components/Header";
import VideoDropzone from "./VideoDropzone";
import MatchDetailsForm from "./MatchDetailsForm";
import { EMPTY_FORM, UploadFormState } from "./types";
import { getTeams, createMatch, uploadMatchVideo, updateMatch } from "@/lib/api";
import type { Team } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState<UploadFormState>({ ...EMPTY_FORM });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load teams on mount
  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch(() => setToast("Could not load teams"));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const updateForm = (patch: Partial<UploadFormState>) => setForm(f => ({ ...f, ...patch }));

  const isFormComplete =
    !!file &&
    form.matchTitle.trim() !== "" &&
    form.teamId !== "" &&
    form.matchDate !== "" &&
    form.matchTime !== "" &&
    form.opponent.trim() !== "";

  const handleAnalyze = async () => {
    if (!isFormComplete || !file) return;

    setSubmitting(true);
    setFileError(null);
    try {
      const dateTime = form.matchDate
        ? new Date(`${form.matchDate}T${form.matchTime || "00:00"}`).toISOString()
        : undefined;

      const match = await createMatch(form.teamId, {
        date: dateTime,
        opponent: form.opponent.trim(),
      });

      await uploadMatchVideo(match.id, file);
      await updateMatch(match.id, { status: "QUEUED" });

      setToast("Video uploaded — analysis started");
      router.push(`/analysis/${match.id}`);
    } catch {
      setToast("Failed to start analysis — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-7">
      <Header title="Upload Video" description="Upload a football match video for analysis" showUpload={false} />

      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-border p-8 flex flex-col gap-6">
        <VideoDropzone
          file={file}
          onFileSelect={f => { setFile(f); setFileError(null); }}
          onFileClear={() => setFile(null)}
          error={fileError}
        />

        <MatchDetailsForm form={form} teams={teams} onChange={updateForm} />

        <button
          onClick={handleAnalyze}
          disabled={!isFormComplete || submitting}
          className={`w-full inline-flex items-center justify-center gap-2 text-white text-sm font-semibold py-3 rounded-xl transition-colors ${
            isFormComplete
              ? "bg-primary hover:bg-primary-hover cursor-pointer"
              : "bg-primary/40 cursor-not-allowed"
          } disabled:cursor-not-allowed`}
        >
          <Sparkles size={16} />
          {submitting ? "Analyzing…" : "Analyze with AI"}
        </button>
        {!isFormComplete && (
          <p className="text-xs text-text-muted text-center -mt-3">
            Fill in all fields and upload a video to enable analysis
          </p>
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
