export interface UploadFormState {
  matchTitle: string;
  teamId: string;
  isHome: boolean;
  matchDate: string; // yyyy-mm-dd
  matchTime: string; // HH:mm
  opponent: string;
}

export const EMPTY_FORM: UploadFormState = {
  matchTitle: "",
  teamId: "",
  isHome: true,
  matchDate: "",
  matchTime: "",
  opponent: "",
};

export const inputCls =
  "w-full border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary bg-white";

export function isVideoFile(file: File) {
  return file.type.startsWith("video/");
}

export function formatFileSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
