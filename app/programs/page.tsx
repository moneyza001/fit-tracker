import { connectToDatabase } from "@/lib/db";
import { Program, WorkoutPlan, Exercise } from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import type { ProgramRow, WorkoutPlanRow, ExerciseRow } from "@/types";
import { ProgramsPageClient } from "./programs-page-client";

export const dynamic = "force-dynamic";

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  await connectToDatabase();

  const [programs, workoutPlans, exercises] = await Promise.all([
    Program.find().sort({ createdAt: -1 }),
    WorkoutPlan.find().sort({ day: 1 }),
    Exercise.find().sort({ name: 1 }),
  ]);

  return (
    <ProgramsPageClient
      initialTab={tab}
      initialPrograms={toPlainJSON<ProgramRow[]>(programs)}
      initialWorkoutPlans={toPlainJSON<WorkoutPlanRow[]>(workoutPlans)}
      initialExercises={toPlainJSON<ExerciseRow[]>(exercises)}
    />
  );
}
