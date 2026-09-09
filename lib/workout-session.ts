import type { WorkoutLogExerciseRow, WorkoutLogRow, WorkoutSetRow } from "@/types";
import type { WorkoutLogExerciseInput } from "@/lib/validations";

export interface SessionTargetExercise {
  exerciseId: { _id: string; name: string };
  targetSets: number;
  targetReps: number;
  targetWeight: number;
}

export interface SessionSetRow {
  set: number;
  reps: number;
  weight: number;
  rpe?: number;
  rir?: number;
  checked: boolean;
}

export interface PreviousSetRow {
  reps: number;
  weight: number;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  note: string;
  sets: SessionSetRow[];
  previousSets: PreviousSetRow[];
  previousNote?: string;
}

interface PreviousExerciseEntry {
  sets: WorkoutSetRow[];
  note?: string;
}

function findExerciseEntry(
  log: WorkoutLogRow | null,
  exerciseId: string
): WorkoutLogExerciseRow | undefined {
  return log?.exercises.find((entry) => entry.exerciseId === exerciseId);
}

// Tracks, per exercise, the sets from the most recent completed workout
// that included it — regardless of which plan/template that workout was
// logged under, so e.g. "Calf Raise" shows its last weight whether it was
// last done as part of Leg A or Leg B.
export function buildPreviousSetsByExercise(
  completedLogsNewestFirst: WorkoutLogRow[]
): Map<string, PreviousExerciseEntry> {
  const map = new Map<string, PreviousExerciseEntry>();
  for (const log of completedLogsNewestFirst) {
    for (const entry of log.exercises) {
      if (map.has(entry.exerciseId) || entry.sets.length === 0) continue;
      map.set(entry.exerciseId, { sets: entry.sets, note: entry.note });
    }
  }
  return map;
}

export function buildSessionExercises(
  planExercises: SessionTargetExercise[],
  currentLog: WorkoutLogRow | null,
  previousSetsByExercise: Map<string, PreviousExerciseEntry>
): SessionExercise[] {
  return planExercises.map((planExercise) => {
    const exerciseId = planExercise.exerciseId._id;
    const currentEntry = findExerciseEntry(currentLog, exerciseId);
    const previousEntry = previousSetsByExercise.get(exerciseId);
    const previousSets = previousEntry?.sets ?? [];

    const rowCount = Math.max(
      planExercise.targetSets,
      currentEntry?.sets.length ?? 0
    );

    const sets: SessionSetRow[] = Array.from(
      { length: rowCount },
      (_, index) => {
        const setNumber = index + 1;
        const savedSet = currentEntry?.sets.find((s) => s.set === setNumber);
        if (savedSet) {
          return {
            set: setNumber,
            reps: savedSet.reps,
            weight: savedSet.weight,
            rpe: savedSet.rpe,
            rir: savedSet.rir,
            checked: true,
          };
        }

        const previousSet = previousSets.find((s) => s.set === setNumber);
        return {
          set: setNumber,
          reps: previousSet?.reps ?? planExercise.targetReps,
          weight: previousSet?.weight ?? planExercise.targetWeight,
          checked: false,
        };
      }
    );

    return {
      exerciseId,
      exerciseName: planExercise.exerciseId.name,
      targetSets: planExercise.targetSets,
      targetReps: planExercise.targetReps,
      targetWeight: planExercise.targetWeight,
      note: currentEntry?.note ?? "",
      sets,
      previousSets: previousSets.map((s) => ({
        reps: s.reps,
        weight: s.weight,
      })),
      previousNote: previousEntry?.note,
    };
  });
}

export function toApiExercises(
  sessionExercises: SessionExercise[]
): WorkoutLogExerciseInput[] {
  return sessionExercises
    .filter((exercise) => exercise.sets.some((set) => set.checked))
    .map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: exercise.sets
        .filter((set) => set.checked)
        .map((set) => ({
          set: set.set,
          reps: set.reps,
          weight: set.weight,
          rpe: set.rpe,
          rir: set.rir,
        })),
      note: exercise.note.trim() || undefined,
    }));
}
