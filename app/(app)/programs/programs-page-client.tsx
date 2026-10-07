"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgramsTab } from "@/components/programs/programs-tab";
import { WorkoutPlansTab } from "@/components/workout-plans/workout-plans-tab";
import { ExercisesTab } from "@/components/exercises/exercises-tab";
import { WorkoutTemplatesTab } from "@/components/workout-templates/workout-templates-tab";
import type {
  ExerciseRow,
  ProgramRow,
  WorkoutPlanRow,
  WorkoutTemplateRow,
} from "@/types";

const VALID_TABS = [
  "programs",
  "workout-plans",
  "exercises",
  "templates",
] as const;
type TabValue = (typeof VALID_TABS)[number];

function resolveTab(tab?: string): TabValue {
  return (VALID_TABS as readonly string[]).includes(tab ?? "")
    ? (tab as TabValue)
    : "programs";
}

interface ProgramsPageClientProps {
  initialTab?: string;
  initialPrograms: ProgramRow[];
  initialWorkoutPlans: WorkoutPlanRow[];
  initialExercises: ExerciseRow[];
  initialWorkoutTemplates: WorkoutTemplateRow[];
}

export function ProgramsPageClient({
  initialTab,
  initialPrograms,
  initialWorkoutPlans,
  initialExercises,
  initialWorkoutTemplates,
}: ProgramsPageClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TabValue>(resolveTab(initialTab));
  const [programs, setPrograms] = useState<ProgramRow[]>(initialPrograms);

  function handleTabChange(value: string) {
    const next = resolveTab(value);
    setTab(next);
    router.replace(
      next === "programs" ? "/programs" : `/programs?tab=${next}`,
      { scroll: false }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">โปรแกรม</h1>
        <p className="text-sm text-muted-foreground">
          จัดการโปรแกรมการฝึก แผนการฝึก และคลังท่าออกกำลังกายของคุณ
        </p>
      </div>
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="programs">โปรแกรม</TabsTrigger>
          <TabsTrigger value="workout-plans">แผนการฝึก</TabsTrigger>
          <TabsTrigger value="exercises">ท่าออกกำลังกาย</TabsTrigger>
          <TabsTrigger value="templates">เทมเพลต</TabsTrigger>
        </TabsList>
        <TabsContent value="programs">
          <ProgramsTab programs={programs} onProgramsChange={setPrograms} />
        </TabsContent>
        <TabsContent value="workout-plans">
          <WorkoutPlansTab
            initialWorkoutPlans={initialWorkoutPlans}
            programs={programs}
          />
        </TabsContent>
        <TabsContent value="exercises">
          <ExercisesTab initialExercises={initialExercises} />
        </TabsContent>
        <TabsContent value="templates">
          <WorkoutTemplatesTab initialWorkoutTemplates={initialWorkoutTemplates} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
