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

const inputBaseCls =
  "w-full border rounded-lg px-3 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary bg-white transition-colors";

export function inputCls(filled: boolean) {
  return `${inputBaseCls} ${filled ? "border-border text-text-primary" : "border-border/40 text-text-muted"}`;
}

export function isVideoFile(file: File) {
  return file.type.startsWith("video/");
}

export function formatFileSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// ── Player review (post-analysis mock) ──────────────────────────────────────
// Used to let the user match AI-detected player crops to real roster names.
// Falls back to this mock roster when the team has no players yet / the
// backend isn't reachable.

export interface RosterPlayer {
  id: string;
  name: string;
  jerseyNumber: number | null;
}

export const MOCK_ROSTER: RosterPlayer[] = [
  { id: "m1",  name: "Somchai Boonmee",   jerseyNumber: 1 },
  { id: "m2",  name: "Ananda Srisai",     jerseyNumber: 4 },
  { id: "m3",  name: "Kittipong Chaiyo",  jerseyNumber: 5 },
  { id: "m4",  name: "Piyawat Ruangrit",  jerseyNumber: 6 },
  { id: "m5",  name: "Nattapong Wongsa",  jerseyNumber: 7 },
  { id: "m6",  name: "Chalermchai Deeda", jerseyNumber: 8 },
  { id: "m7",  name: "Ekkarat Phuangthong", jerseyNumber: 9 },
  { id: "m8",  name: "Thanapon Meesuk",   jerseyNumber: 10 },
  { id: "m9",  name: "Wichai Saetang",    jerseyNumber: 11 },
  { id: "m10", name: "Prasert Kanya",     jerseyNumber: 14 },
  { id: "m11", name: "Suriya Homsan",     jerseyNumber: 17 },
  { id: "m12", name: "Anurak Thepsuwan",  jerseyNumber: 22 },
];
