"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMatch, getMatchReport, getStatsVideoUrl, getSpatialVideoUrl } from "@/lib/api";
import type { MatchReport } from "@/lib/types";
import type { MatchWithTeam } from "./types";
import { MOCK_MATCH, MOCK_REPORT, MOCK_ROUND_LABEL, MOCK_VIDEO_URL } from "./mockData";
import ScoreBoard from "./ScoreBoard";
import MatchSummaryCard from "./MatchSummaryCard";
import VideoPanel from "./VideoPanel";
import MatchEvents from "./MatchEvents";

export default function MatchAnalysisPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;

  const [match, setMatch]   = useState<MatchWithTeam | null>(null);
  const [report, setReport] = useState<MatchReport | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [matchIsMock, setMatchIsMock]   = useState(false);
  const [reportIsMock, setReportIsMock] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    setLoading(true);

    getMatch(matchId)
      .then(m => { if (!cancelled) setMatch(m); })
      .catch(() => {
        // No backend yet — fall back to mock data so the page is still visible.
        if (!cancelled) { setMatch(MOCK_MATCH); setMatchIsMock(true); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    getMatchReport(matchId)
      .then(r => { if (!cancelled) setReport(r); })
      .catch(() => { if (!cancelled) { setReport(MOCK_REPORT); setReportIsMock(true); } });

    return () => { cancelled = true; };
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary p-7">
        <div className="flex items-center justify-center mt-20">
          <p className="text-sm text-text-muted">Loading match…</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-bg-secondary p-7">
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-16">
          <p className="text-sm font-medium text-text-secondary">Match not found</p>
        </div>
      </div>
    );
  }

  const hasVideo = matchIsMock || (match.status === "COMPLETED" && !!match.videoPath);

  return (
    <div className="min-h-screen bg-bg-secondary p-7 flex flex-col gap-4">
      <ScoreBoard
        match={match}
        summary={report?.summary}
        roundLabel={matchIsMock ? MOCK_ROUND_LABEL : (match.date ? `Match — ${new Date(match.date).toLocaleDateString()}` : "Match Analysis")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <MatchSummaryCard report={report} />

        <div className="flex flex-col gap-4">
          <VideoPanel
            statsVideoUrl={matchIsMock ? MOCK_VIDEO_URL : getStatsVideoUrl(match.id)}
            spatialVideoUrl={matchIsMock ? MOCK_VIDEO_URL : getSpatialVideoUrl(match.id)}
            hasVideo={hasVideo}
          />
          <MatchEvents events={report?.events} />
        </div>
      </div>
    </div>
  );
}
