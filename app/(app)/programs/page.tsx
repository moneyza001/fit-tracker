import { connectToDatabase } from "@/lib/db";
import { Program, WorkoutPlan, Exercise, WorkoutTemplate } from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import { requireUserId } from "@/lib/auth-guard";
import type {
  ProgramRow,
  WorkoutPlanRow,
  ExerciseRow,
  WorkoutTemplateRow,
} from "@/types";
import { ProgramsPageClient } from "./programs-page-client";

export const dynamic = "force-dynamic";

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  await connectToDatabase();
  const userId = await requireUserId();

  const [programs, workoutPlans, exercises, workoutTemplates] = await Promise.all([
    Program.find({ userId }).sort({ createdAt: -1 }),
    WorkoutPlan.find({ userId }).sort({ day: 1 }),
    Exercise.find({ userId }).sort({ name: 1 }),
    WorkoutTemplate.find({ userId }).sort({ name: 1 }),
  ]);

  return (
    <ProgramsPageClient
      initialTab={tab}
      initialPrograms={toPlainJSON<ProgramRow[]>(programs)}
      initialWorkoutPlans={toPlainJSON<WorkoutPlanRow[]>(workoutPlans)}
      initialExercises={toPlainJSON<ExerciseRow[]>(exercises)}
      initialWorkoutTemplates={toPlainJSON<WorkoutTemplateRow[]>(workoutTemplates)}
    />
  );
}
