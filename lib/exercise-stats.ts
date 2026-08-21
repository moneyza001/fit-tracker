import type { WorkoutLogRow, WorkoutSetRow } from "@/types";
import { calculateEstimated1RM, calculateVolume } from "@/lib/formulas";

export const EXERCISE_METRICS = [
  "weight",
  "volume",
  "reps",
  "estimated1RM",
  "totalSets",
] as const;
export type ExerciseMetric = (typeof EXERCISE_METRICS)[number];

export const EXERCISE_METRIC_LABELS: Record<ExerciseMetric, string> = {
  weight: "Weight",
  volume: "Volume",
  reps: "Reps",
  estimated1RM: "Est. 1RM",
  totalSets: "Total Sets",
};

export interface ExerciseSessionStat {
  logId: string;
  date: string;
  sets: WorkoutSetRow[];
  weight: number;
  volume: number;
  reps: number;
  estimated1RM: number;
  totalSets: number;
}

export function buildExerciseSessionStats(
  logs: WorkoutLogRow[],
  exerciseId: string
): ExerciseSessionStat[] {
  return logs
    .map((log) => {
      const entry = log.exercises.find((e) => e.exerciseId === exerciseId);
      if (!entry || entry.sets.length === 0) return null;

      const weight = Math.max(...entry.sets.map((set) => set.weight));
      const reps = entry.sets.reduce((sum, set) => sum + set.reps, 0);
      const volume = entry.sets.reduce(
        (sum, set) => sum + calculateVolume(set.weight, set.reps),
        0
      );
      const estimated1RM = Math.max(
        ...entry.sets.map((set) => calculateEstimated1RM(set.weight, set.reps))
      );

      const stat: ExerciseSessionStat = {
        logId: log._id,
        date: log.date,
        sets: entry.sets,
        weight,
        volume,
        reps,
        estimated1RM,
        totalSets: entry.sets.length,
      };
      return stat;
    })
    .filter((stat): stat is ExerciseSessionStat => stat !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function metricValue(
  stat: ExerciseSessionStat,
  metric: ExerciseMetric
): number {
  return stat[metric];
}
