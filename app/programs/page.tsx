import { connectToDatabase } from "@/lib/db";
import { Program, WorkoutPlan, Exercise, WorkoutTemplate } from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import { CURRENT_USER_ID } from "@/lib/constants";
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

  const [programs, workoutPlans, exercises, workoutTemplates] = await Promise.all([
    Program.find().sort({ createdAt: -1 }),
    WorkoutPlan.find().sort({ day: 1 }),
    Exercise.find().sort({ name: 1 }),
    WorkoutTemplate.find({ userId: CURRENT_USER_ID }).sort({ name: 1 }),
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
