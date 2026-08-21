import type { WorkoutLogRow } from "@/types";
import { calculateVolume } from "@/lib/formulas";

export function calculateTotalVolume(logs: WorkoutLogRow[]): number {
  return logs.reduce(
    (total, log) =>
      total +
      log.exercises.reduce(
        (logTotal, exercise) =>
          logTotal +
          exercise.sets.reduce(
            (setTotal, set) => setTotal + calculateVolume(set.weight, set.reps),
            0
          ),
        0
      ),
    0
  );
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function countWorkoutsThisWeek(logs: WorkoutLogRow[]): number {
  const weekStart = startOfWeek(new Date());
  return logs.filter((log) => new Date(log.date) >= weekStart).length;
}

export function calculateStreak(logDates: string[]): number {
  if (logDates.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(logDates.map((date) => new Date(date).toISOString().slice(0, 10)))
  ).sort((a, b) => (a < b ? 1 : -1));

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (uniqueDays[0] !== todayStr && uniqueDays[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]).getTime();
    const curr = new Date(uniqueDays[i]).getTime();
    const diffDays = Math.round((prev - curr) / 86_400_000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
