export const ACCENTS = ["gray", "blue", "green", "purple", "orange", "rose"] as const;
export type Accent = (typeof ACCENTS)[number];

export const ACCENT_OPTIONS: { value: Accent; label: string; swatchClass: string }[] = [
  { value: "gray", label: "Gray", swatchClass: "bg-neutral-500" },
  { value: "blue", label: "Blue", swatchClass: "bg-[oklch(0.55_0.18_255)]" },
  { value: "green", label: "Green", swatchClass: "bg-[oklch(0.52_0.15_150)]" },
  { value: "purple", label: "Purple", swatchClass: "bg-[oklch(0.5_0.2_300)]" },
  { value: "orange", label: "Orange", swatchClass: "bg-[oklch(0.6_0.19_45)]" },
  { value: "rose", label: "Rose", swatchClass: "bg-[oklch(0.55_0.21_15)]" },
];

const ACCENT_KEY = "fittracker:accent";

export function getAccent(): Accent {
  if (typeof window === "undefined") return "gray";
  const stored = window.localStorage.getItem(ACCENT_KEY);
  return (ACCENTS as readonly string[]).includes(stored ?? "")
    ? (stored as Accent)
    : "gray";
}

export function setAccent(accent: Accent): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCENT_KEY, accent);
  document.documentElement.setAttribute("data-accent", accent);
}

export function subscribeAccent(): () => void {
  return () => {};
}
