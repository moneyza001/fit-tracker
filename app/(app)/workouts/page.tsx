import { connectToDatabase } from "@/lib/db";
import {
  Program,
  WorkoutPlan,
  WorkoutPlanExercise,
  WorkoutTemplate,
  WorkoutLog,
} from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import { buildPreviousSetsByExercise, buildSessionExercises } from "@/lib/workout-session";
import { requireUserId } from "@/lib/auth-guard";
import type {
  ProgramRow,
  WorkoutPlanRow,
  WorkoutPlanExerciseRow,
  WorkoutTemplateRow,
  WorkoutLogRow,
} from "@/types";
import { StartWorkoutPicker } from "@/components/workouts/start-workout-picker";
import { WorkoutSession } from "@/components/workouts/workout-session";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  await connectToDatabase();
  const userId = await requireUserId();

  const inProgressLogDoc = await WorkoutLog.findOne({
    userId,
    status: "in_progress",
  }).sort({ createdAt: -1 });

  if (inProgressLogDoc) {
    const currentLog = toPlainJSON<WorkoutLogRow>(inProgressLogDoc);

    const completedLogsDoc = await WorkoutLog.find({
      userId,
      status: "completed",
    }).sort({ date: -1 });
    const previousSetsByExercise = buildPreviousSetsByExercise(
      toPlainJSON<WorkoutLogRow[]>(completedLogsDoc)
    );

    if (inProgressLogDoc.workoutTemplateId) {
      const templateDoc = await WorkoutTemplate.findOne({
        _id: inProgressLogDoc.workoutTemplateId,
        userId,
      }).populate("exercises.exerciseId");

      const template = toPlainJSON<WorkoutTemplateRow>(templateDoc);

      const sessionExercises = buildSessionExercises(
        template.exercises,
        currentLog,
        previousSetsByExercise
      );

      return (
        <WorkoutSession
          logId={currentLog._id}
          workoutPlanName={template.name}
          date={currentLog.date}
          initialExercises={sessionExercises}
          initialOverallNote={currentLog.overallNote ?? ""}
        />
      );
    }

    const [workoutPlanDoc, planExercisesDoc] = await Promise.all([
      WorkoutPlan.findOne({ _id: inProgressLogDoc.workoutPlanId, userId }),
      WorkoutPlanExercise.find({
        workoutPlanId: inProgressLogDoc.workoutPlanId,
        userId,
      })
        .sort({ order: 1 })
        .populate("exerciseId"),
    ]);

    const planExercises = toPlainJSON<WorkoutPlanExerciseRow[]>(planExercisesDoc);

    const sessionExercises = buildSessionExercises(
      planExercises,
      currentLog,
      previousSetsByExercise
    );

    return (
      <WorkoutSession
        logId={currentLog._id}
        workoutPlanName={workoutPlanDoc?.name ?? "Workout"}
        date={currentLog.date}
        initialExercises={sessionExercises}
        initialOverallNote={currentLog.overallNote ?? ""}
      />
    );
  }

  const activePrograms = await Program.find({ userId, status: "active" }).sort({
    name: 1,
  });
  const activeProgramIds = activePrograms.map((program) => program._id);
  const [workoutPlans, workoutTemplates] = await Promise.all([
    WorkoutPlan.find({ programId: { $in: activeProgramIds }, userId }).sort({
      day: 1,
    }),
    WorkoutTemplate.find({ userId }).sort({ name: 1 }),
  ]);

  return (
    <StartWorkoutPicker
      programs={toPlainJSON<ProgramRow[]>(activePrograms)}
      workoutPlans={toPlainJSON<WorkoutPlanRow[]>(workoutPlans)}
      workoutTemplates={toPlainJSON<WorkoutTemplateRow[]>(workoutTemplates)}
    />
  );
}
