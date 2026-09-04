import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Exercise, WorkoutPlan, WorkoutPlanExercise } from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import { requireUserId } from "@/lib/auth-guard";
import type {
  ExerciseRow,
  WorkoutPlanExerciseRow,
  WorkoutPlanRow,
} from "@/types";
import { WorkoutPlanExercisesTab } from "@/components/workout-plan-exercises/workout-plan-exercises-tab";

export const dynamic = "force-dynamic";

export default async function WorkoutPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectToDatabase();
  const userId = await requireUserId();

  const workoutPlanDoc = await WorkoutPlan.findOne({ _id: id, userId });
  if (!workoutPlanDoc) {
    notFound();
  }

  const [planExercisesDoc, exercisesDoc] = await Promise.all([
    WorkoutPlanExercise.find({ workoutPlanId: id, userId })
      .sort({ order: 1 })
      .populate("exerciseId"),
    Exercise.find({ userId }).sort({ name: 1 }),
  ]);

  const workoutPlan = toPlainJSON<WorkoutPlanRow>(workoutPlanDoc);
  const planExercises = toPlainJSON<WorkoutPlanExerciseRow[]>(planExercisesDoc);
  const exercises = toPlainJSON<ExerciseRow[]>(exercisesDoc);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/programs?tab=workout-plans"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Workout Plans
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{workoutPlan.name}</h1>
        <p className="text-sm text-muted-foreground">
          Day {workoutPlan.day}
          {workoutPlan.description ? ` · ${workoutPlan.description}` : ""}
        </p>
      </div>

      <WorkoutPlanExercisesTab
        workoutPlanId={workoutPlan._id}
        initialPlanExercises={planExercises}
        exercises={exercises}
      />
    </div>
  );
}
