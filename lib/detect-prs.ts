import { PersonalRecord, WorkoutLog, type IWorkoutLog } from "@/models";
import { calculateEstimated1RM } from "@/lib/formulas";

export interface NewPR {
  exerciseId: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  previousBest: number;
}

// Called once a workout log is marked completed. For each exercise logged
// that session, the best single set (by estimated 1RM) is compared against
// the lifter's all-time best for that exercise — from existing PersonalRecord
// rows, or by scanning prior completed logs the first time an exercise is
// evaluated (since PR tracking may be turned on after some history already
// exists). Every PR is inserted as its own row rather than upserting a
// "current best", so PersonalRecord doubles as a chronological PR feed.
export async function detectAndRecordPRs(log: IWorkoutLog): Promise<NewPR[]> {
  const newPRs: NewPR[] = [];

  for (const entry of log.exercises) {
    if (entry.sets.length === 0) continue;

    let bestSet = entry.sets[0];
    let bestEstimated1RM = calculateEstimated1RM(bestSet.weight, bestSet.reps);
    for (const set of entry.sets) {
      const estimated1RM = calculateEstimated1RM(set.weight, set.reps);
      if (estimated1RM > bestEstimated1RM) {
        bestEstimated1RM = estimated1RM;
        bestSet = set;
      }
    }

    const existingBest = await PersonalRecord.findOne({
      userId: log.userId,
      exerciseId: entry.exerciseId,
    }).sort({ estimated1RM: -1 });

    let historicalBest = existingBest?.estimated1RM ?? 0;

    if (!existingBest) {
      const priorLogs = await WorkoutLog.find({
        userId: log.userId,
        status: "completed",
        _id: { $ne: log._id },
        "exercises.exerciseId": entry.exerciseId,
      });
      for (const priorLog of priorLogs) {
        const priorEntry = priorLog.exercises.find((e) =>
          e.exerciseId.equals(entry.exerciseId)
        );
        if (!priorEntry) continue;
        for (const set of priorEntry.sets) {
          const estimated1RM = calculateEstimated1RM(set.weight, set.reps);
          if (estimated1RM > historicalBest) historicalBest = estimated1RM;
        }
      }
    }

    if (bestEstimated1RM > historicalBest) {
      await PersonalRecord.create({
        userId: log.userId,
        exerciseId: entry.exerciseId,
        weight: bestSet.weight,
        reps: bestSet.reps,
        estimated1RM: bestEstimated1RM,
        achievedAt: log.date,
        workoutLogId: log._id,
      });
      newPRs.push({
        exerciseId: String(entry.exerciseId),
        weight: bestSet.weight,
        reps: bestSet.reps,
        estimated1RM: bestEstimated1RM,
        previousBest: historicalBest,
      });
    }
  }

  return newPRs;
}
