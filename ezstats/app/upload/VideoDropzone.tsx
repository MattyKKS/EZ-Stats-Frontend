"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud, FileVideo, X } from "lucide-react";
import { formatFileSize, isVideoFile } from "./types";

interface Props {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
  error?: string | null;
}

export default function VideoDropzone({ file, onFileSelect, onFileClear, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    setPreviewError(false);
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f || !isVideoFile(f)) return;
    onFileSelect(f);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`relative w-full aspect-video border-2 border-dashed rounded-xl overflow-hidden flex flex-col items-center justify-center text-center transition-colors ${
          file ? "border-primary bg-black" : dragging ? "border-primary bg-primary-bg" : "border-primary/50 bg-primary-bg/60"
        }`}
      >
        {file && previewUrl ? (
          <>
            {previewError ? (
              <div className="flex flex-col items-center gap-2 px-6">
                <FileVideo size={40} className="text-white/70" />
                <p className="text-sm text-white/90">Preview unavailable — your browser can&apos;t play this format</p>
                <p className="text-xs text-white/50">It will still upload and analyze normally</p>
              </div>
            ) : (
              <video
                key={previewUrl}
                src={previewUrl}
                controls
                preload="metadata"
                playsInline
                onError={() => setPreviewError(true)}
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}

            <button
              onClick={onFileClear}
              className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-xs font-medium text-white bg-black/60 hover:bg-black/80 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <X size={13} /> Remove
            </button>

            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent px-4 py-3 text-left pointer-events-none">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-white/70">{formatFileSize(file.size)}</p>
            </div>
          </>
        ) : (
          <div className="px-6">
            <UploadCloud size={40} className="text-text-primary mx-auto" />
            <p className="text-sm text-text-primary mt-4">Upload or Drag your match video file here</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-4 px-5 py-2 text-sm font-medium text-primary border border-primary rounded-lg bg-white hover:bg-primary-bg transition-colors"
            >
              Browse File
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      <div
        className={`border text-xs font-medium rounded-lg px-4 py-2.5 ${
          error ? "border-red-300 bg-red-50 text-red-600" : "border-red-200 bg-red-50/60 text-red-500"
        }`}
      >
        {error ?? "Note: Analysis accuracy depends on the quality of the video"}
      </div>
    </div>
  );
}
