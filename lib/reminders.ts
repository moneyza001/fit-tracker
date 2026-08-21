function toDayKey(date: string): string {
  return new Date(date).toISOString().slice(0, 10);
}

function daysBetween(fromKey: string, toKey: string): number {
  return Math.round(
    (new Date(toKey).getTime() - new Date(fromKey).getTime()) / 86_400_000
  );
}

export interface ReminderInput {
  today: string;
  streak: number;
  lastWorkoutDate: string | null;
  hasActiveProgram: boolean;
  scheduleThresholdDays?: number;
}

export interface ReminderState {
  workedOutToday: boolean;
  streakAtRisk: boolean;
  scheduleReminder: boolean;
}

export function computeReminders({
  today,
  streak,
  lastWorkoutDate,
  hasActiveProgram,
  scheduleThresholdDays = 2,
}: ReminderInput): ReminderState {
  const todayKey = toDayKey(today);
  const lastWorkoutKey = lastWorkoutDate ? toDayKey(lastWorkoutDate) : null;
  const workedOutToday = lastWorkoutKey === todayKey;

  const daysSinceLast = lastWorkoutKey
    ? daysBetween(lastWorkoutKey, todayKey)
    : Infinity;

  return {
    workedOutToday,
    streakAtRisk: streak > 0 && !workedOutToday,
    scheduleReminder:
      hasActiveProgram && !workedOutToday && daysSinceLast >= scheduleThresholdDays,
  };
}
