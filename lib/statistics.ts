import type { ExerciseRow, MuscleGroup, WorkoutLogRow } from "@/types";
import { calculateEstimated1RM, calculateVolume } from "@/lib/formulas";

export const GLOBAL_METRICS = ["weight", "volume", "estimated1RM", "rpeRir"] as const;
export type GlobalMetric = (typeof GLOBAL_METRICS)[number];

export const GLOBAL_METRIC_LABELS: Record<GlobalMetric, string> = {
  weight: "Weight",
  volume: "Volume",
  estimated1RM: "Est. 1RM",
  rpeRir: "RPE / RIR",
};

export interface GlobalMetricPoint {
  logId: string;
  date: string;
  volume: number;
  estimated1RM: number;
  rpe: number | null;
  rir: number | null;
}

export function buildGlobalMetricSeries(logs: WorkoutLogRow[]): GlobalMetricPoint[] {
  return logs
    .map((log) => {
      let volume = 0;
      let bestEstimated1RM = 0;
      let rpeSum = 0;
      let rpeCount = 0;
      let rirSum = 0;
      let rirCount = 0;

      for (const exercise of log.exercises) {
        for (const set of exercise.sets) {
          volume += calculateVolume(set.weight, set.reps);
          bestEstimated1RM = Math.max(
            bestEstimated1RM,
            calculateEstimated1RM(set.weight, set.reps)
          );
          if (typeof set.rpe === "number") {
            rpeSum += set.rpe;
            rpeCount++;
          }
          if (typeof set.rir === "number") {
            rirSum += set.rir;
            rirCount++;
          }
        }
      }

      return {
        logId: log._id,
        date: log.date,
        volume,
        estimated1RM: bestEstimated1RM,
        rpe: rpeCount > 0 ? rpeSum / rpeCount : null,
        rir: rirCount > 0 ? rirSum / rirCount : null,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export interface MuscleGroupVolume {
  muscleGroup: MuscleGroup;
  volume: number;
}

export function aggregateMuscleGroupVolume(
  logs: WorkoutLogRow[],
  exercises: ExerciseRow[]
): MuscleGroupVolume[] {
  const muscleGroupById = new Map(exercises.map((ex) => [ex._id, ex.muscleGroup]));
  const totals = new Map<MuscleGroup, number>();

  for (const log of logs) {
    for (const exercise of log.exercises) {
      const muscleGroup = muscleGroupById.get(exercise.exerciseId);
      if (!muscleGroup) continue;
      const exerciseVolume = exercise.sets.reduce(
        (sum, set) => sum + calculateVolume(set.weight, set.reps),
        0
      );
      totals.set(muscleGroup, (totals.get(muscleGroup) ?? 0) + exerciseVolume);
    }
  }

  return Array.from(totals.entries())
    .map(([muscleGroup, volume]) => ({ muscleGroup, volume }))
    .sort((a, b) => b.volume - a.volume);
}

export type VolumeTrendBucket = "week" | "month";

export interface VolumeTrendPoint {
  period: string;
  volume: number;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function bucketKey(date: Date, bucket: VolumeTrendBucket): string {
  if (bucket === "month") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  return startOfWeek(date).toISOString().slice(0, 10);
}

export function buildVolumeTrend(
  logs: WorkoutLogRow[],
  bucket: VolumeTrendBucket
): VolumeTrendPoint[] {
  const totals = new Map<string, number>();

  for (const log of logs) {
    const key = bucketKey(new Date(log.date), bucket);
    const logVolume = log.exercises.reduce(
      (sum, exercise) =>
        sum +
        exercise.sets.reduce((s, set) => s + calculateVolume(set.weight, set.reps), 0),
      0
    );
    totals.set(key, (totals.get(key) ?? 0) + logVolume);
  }

  return Array.from(totals.entries())
    .map(([period, volume]) => ({ period, volume }))
    .sort((a, b) => (a.period < b.period ? -1 : 1));
}

export interface HeatmapDay {
  date: string;
  count: number;
}

export function buildConsistencyHeatmap(
  logDates: string[],
  weeksBack = 26
): HeatmapDay[][] {
  const countByDay = new Map<string, number>();
  for (const date of logDates) {
    const key = new Date(date).toISOString().slice(0, 10);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  const currentWeekStart = startOfWeek(new Date());
  const firstWeekStart = new Date(currentWeekStart);
  firstWeekStart.setDate(firstWeekStart.getDate() - weeksBack * 7);

  const weeks: HeatmapDay[][] = [];
  for (let w = 0; w <= weeksBack; w++) {
    const week: HeatmapDay[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(firstWeekStart);
      day.setDate(day.getDate() + w * 7 + d);
      const key = day.toISOString().slice(0, 10);
      week.push({ date: key, count: countByDay.get(key) ?? 0 });
    }
    weeks.push(week);
  }
  return weeks;
}
