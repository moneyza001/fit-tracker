import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Exercise, WorkoutTemplate } from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import type { ExerciseRow, WorkoutTemplateRow } from "@/types";
import { WorkoutTemplateExercisesTab } from "@/components/workout-template-exercises/workout-template-exercises-tab";

export const dynamic = "force-dynamic";

export default async function WorkoutTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectToDatabase();

  const workoutTemplateDoc = await WorkoutTemplate.findById(id).populate(
    "exercises.exerciseId"
  );
  if (!workoutTemplateDoc) {
    notFound();
  }

  const exercisesDoc = await Exercise.find().sort({ name: 1 });

  const workoutTemplate = toPlainJSON<WorkoutTemplateRow>(workoutTemplateDoc);
  const exercises = toPlainJSON<ExerciseRow[]>(exercisesDoc);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/programs?tab=templates"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          เทมเพลต
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{workoutTemplate.name}</h1>
        {workoutTemplate.description && (
          <p className="text-sm text-muted-foreground">
            {workoutTemplate.description}
          </p>
        )}
      </div>

      <WorkoutTemplateExercisesTab
        workoutTemplateId={workoutTemplate._id}
        initialExercises={workoutTemplate.exercises}
        exercises={exercises}
      />
    </div>
  );
}
