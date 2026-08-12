"use client";

import { useRef, useState } from "react";
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
        className={`border-2 border-dashed rounded-xl px-6 py-16 flex flex-col items-center justify-center text-center transition-colors ${
          dragging ? "border-primary bg-primary-bg" : "border-primary/50 bg-primary-bg/60"
        }`}
      >
        {file ? (
          <div className="flex flex-col items-center gap-3">
            <FileVideo size={40} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-text-primary">{file.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={onFileClear}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              <X size={13} /> Remove file
            </button>
          </div>
        ) : (
          <>
            <UploadCloud size={40} className="text-text-primary" />
            <p className="text-sm text-text-primary mt-4">Upload or Drag your match video file here</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-4 px-5 py-2 text-sm font-medium text-primary border border-primary rounded-lg bg-white hover:bg-primary-bg transition-colors"
            >
              Browse File
            </button>
          </>
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
