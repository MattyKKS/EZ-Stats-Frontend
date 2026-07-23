"use client";

import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";

interface Props {
  statsVideoUrl: string;
  spatialVideoUrl: string;
  hasVideo: boolean;
}

type Tab = "stats" | "spatial";

export default function VideoPanel({ statsVideoUrl, spatialVideoUrl, hasVideo }: Props) {
  const [tab, setTab] = useState<Tab>("stats");

  return (
    <div className="bg-white rounded-xl border border-border p-3 flex flex-col gap-3">
      <div className="flex items-center gap-1 px-1">
        <button
          onClick={() => setTab("stats")}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            tab === "stats" ? "bg-primary-bg text-primary" : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Stats Overlay
        </button>
        <button
          onClick={() => setTab("spatial")}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            tab === "spatial" ? "bg-primary-bg text-primary" : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Spatial View
        </button>
      </div>

      {hasVideo ? (
        <VideoPlayer
          key={tab}
          src={tab === "stats" ? statsVideoUrl : spatialVideoUrl}
          className="aspect-video"
        />
      ) : (
        <div className="aspect-video rounded-lg bg-black/5 border border-dashed border-border flex items-center justify-center">
          <p className="text-sm text-text-muted">Video not available yet</p>
        </div>
      )}
    </div>
  );
}
