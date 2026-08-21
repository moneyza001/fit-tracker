import { connectToDatabase } from "@/lib/db";
import {
  Program,
  WorkoutPlan,
  WorkoutPlanExercise,
  WorkoutTemplate,
  WorkoutLog,
} from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import { buildSessionExercises } from "@/lib/workout-session";
import { CURRENT_USER_ID } from "@/lib/constants";
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

  const inProgressLogDoc = await WorkoutLog.findOne({
    userId: CURRENT_USER_ID,
    status: "in_progress",
  }).sort({ createdAt: -1 });

  if (inProgressLogDoc) {
    const currentLog = toPlainJSON<WorkoutLogRow>(inProgressLogDoc);

    if (inProgressLogDoc.workoutTemplateId) {
      const [templateDoc, previousLogDoc] = await Promise.all([
        WorkoutTemplate.findById(inProgressLogDoc.workoutTemplateId).populate(
          "exercises.exerciseId"
        ),
        WorkoutLog.findOne({
          workoutTemplateId: inProgressLogDoc.workoutTemplateId,
          status: "completed",
        }).sort({ date: -1 }),
      ]);

      const previousLog = previousLogDoc
        ? toPlainJSON<WorkoutLogRow>(previousLogDoc)
        : null;
      const template = toPlainJSON<WorkoutTemplateRow>(templateDoc);

      const sessionExercises = buildSessionExercises(
        template.exercises,
        currentLog,
        previousLog
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

    const [workoutPlanDoc, planExercisesDoc, previousLogDoc] = await Promise.all([
      WorkoutPlan.findById(inProgressLogDoc.workoutPlanId),
      WorkoutPlanExercise.find({ workoutPlanId: inProgressLogDoc.workoutPlanId })
        .sort({ order: 1 })
        .populate("exerciseId"),
      WorkoutLog.findOne({
        workoutPlanId: inProgressLogDoc.workoutPlanId,
        status: "completed",
      }).sort({ date: -1 }),
    ]);

    const previousLog = previousLogDoc
      ? toPlainJSON<WorkoutLogRow>(previousLogDoc)
      : null;
    const planExercises = toPlainJSON<WorkoutPlanExerciseRow[]>(planExercisesDoc);

    const sessionExercises = buildSessionExercises(
      planExercises,
      currentLog,
      previousLog
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

  const activePrograms = await Program.find({ status: "active" }).sort({
    name: 1,
  });
  const activeProgramIds = activePrograms.map((program) => program._id);
  const [workoutPlans, workoutTemplates] = await Promise.all([
    WorkoutPlan.find({ programId: { $in: activeProgramIds } }).sort({ day: 1 }),
    WorkoutTemplate.find({ userId: CURRENT_USER_ID }).sort({ name: 1 }),
  ]);

  return (
    <StartWorkoutPicker
      programs={toPlainJSON<ProgramRow[]>(activePrograms)}
      workoutPlans={toPlainJSON<WorkoutPlanRow[]>(workoutPlans)}
      workoutTemplates={toPlainJSON<WorkoutTemplateRow[]>(workoutTemplates)}
    />
  );
}
