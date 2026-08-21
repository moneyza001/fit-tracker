const STORAGE_KEY = "fittracker:restTimerSeconds";
export const DEFAULT_REST_SECONDS = 90;

export function getRestTimerSeconds(): number {
  if (typeof window === "undefined") return DEFAULT_REST_SECONDS;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? Number(stored) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_REST_SECONDS;
}

export function setRestTimerSeconds(seconds: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(seconds));
}

export function subscribeRestTimerSeconds(): () => void {
  return () => {};
}
