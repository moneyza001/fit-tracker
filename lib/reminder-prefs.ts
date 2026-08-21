const ENABLED_KEY = "fittracker:remindersEnabled";
const NOTIFIED_PREFIX = "fittracker:notifiedOn:";

export function getRemindersEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ENABLED_KEY) === "true";
}

export function setRemindersEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ENABLED_KEY, String(enabled));
}

export function subscribeRemindersEnabled(): () => void {
  return () => {};
}

export function hasNotifiedToday(key: string): boolean {
  if (typeof window === "undefined") return true;
  const today = new Date().toISOString().slice(0, 10);
  return window.localStorage.getItem(NOTIFIED_PREFIX + key) === today;
}

export function markNotifiedToday(key: string): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  window.localStorage.setItem(NOTIFIED_PREFIX + key, today);
}
