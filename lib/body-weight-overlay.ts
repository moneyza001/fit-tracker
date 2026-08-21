import type { BodyWeightRow } from "@/types";
import type { ExerciseSessionStat } from "@/lib/exercise-stats";

export interface BodyWeightOverlayPoint {
  date: string;
  liftedWeight: number | null;
  bodyWeight: number | null;
}

function dayKey(date: string): string {
  return new Date(date).toISOString().slice(0, 10);
}

export function buildBodyWeightOverlay(
  sessions: ExerciseSessionStat[],
  bodyWeights: BodyWeightRow[]
): BodyWeightOverlayPoint[] {
  const points = new Map<string, BodyWeightOverlayPoint>();

  for (const session of sessions) {
    const key = dayKey(session.date);
    const point = points.get(key) ?? { date: key, liftedWeight: null, bodyWeight: null };
    point.liftedWeight = session.weight;
    points.set(key, point);
  }

  for (const entry of bodyWeights) {
    const key = dayKey(entry.date);
    const point = points.get(key) ?? { date: key, liftedWeight: null, bodyWeight: null };
    point.bodyWeight = entry.weight;
    points.set(key, point);
  }

  return Array.from(points.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}
