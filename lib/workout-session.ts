import type { WorkoutLogExerciseRow, WorkoutLogRow } from "@/types";
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
}

function findExerciseEntry(
  log: WorkoutLogRow | null,
  exerciseId: string
): WorkoutLogExerciseRow | undefined {
  return log?.exercises.find((entry) => entry.exerciseId === exerciseId);
}

export function buildSessionExercises(
  planExercises: SessionTargetExercise[],
  currentLog: WorkoutLogRow | null,
  previousLog: WorkoutLogRow | null
): SessionExercise[] {
  return planExercises.map((planExercise) => {
    const exerciseId = planExercise.exerciseId._id;
    const currentEntry = findExerciseEntry(currentLog, exerciseId);
    const previousEntry = findExerciseEntry(previousLog, exerciseId);

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

        const previousSet = previousEntry?.sets.find(
          (s) => s.set === setNumber
        );
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
      previousSets: (previousEntry?.sets ?? []).map((s) => ({
        reps: s.reps,
        weight: s.weight,
      })),
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
