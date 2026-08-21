"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { CURRENT_USER_ID } from "@/lib/constants";
import type { ProgramRow, WorkoutPlanRow } from "@/types";

interface StartWorkoutPickerProps {
  programs: ProgramRow[];
  workoutPlans: WorkoutPlanRow[];
}

export function StartWorkoutPicker({
  programs,
  workoutPlans,
}: StartWorkoutPickerProps) {
  const router = useRouter();
  const [startingId, setStartingId] = useState<string | null>(null);

  async function handleStart(workoutPlanId: string) {
    setStartingId(workoutPlanId);
    try {
      await apiRequest("/api/workout-logs", {
        method: "POST",
        body: JSON.stringify({
          userId: CURRENT_USER_ID,
          workoutPlanId,
          date: new Date().toISOString(),
        }),
      });
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start workout"
      );
      setStartingId(null);
    }
  }

  if (workoutPlans.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Workout Today</h1>
        <p className="text-sm text-muted-foreground">
          You need an active program with a workout plan before you can start
          a workout. Set one up in{" "}
          <Link href="/programs" className="underline">
            Programs
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Workout Today</h1>
        <p className="text-sm text-muted-foreground">
          Pick a workout plan to start.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {programs.map((program) => {
          const plans = workoutPlans
            .filter((plan) => plan.programId === program._id)
            .sort((a, b) => a.day - b.day);
          if (plans.length === 0) return null;

          return (
            <Card key={program._id}>
              <CardHeader>
                <CardTitle>{program.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {plans.map((plan) => (
                  <Button
                    key={plan._id}
                    className="w-full justify-between"
                    size="lg"
                    variant="secondary"
                    disabled={startingId !== null}
                    onClick={() => handleStart(plan._id)}
                  >
                    <span>
                      Day {plan.day} — {plan.name}
                    </span>
                    <Play className="size-4" />
                  </Button>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
