"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { toApiExercises, type SessionExercise } from "@/lib/workout-session";
import { ExerciseSessionCard } from "./exercise-session-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WorkoutSessionProps {
  logId: string;
  workoutPlanName: string;
  date: string;
  initialExercises: SessionExercise[];
}

export function WorkoutSession({
  logId,
  workoutPlanName,
  date,
  initialExercises,
}: WorkoutSessionProps) {
  const router = useRouter();
  const [exercises, setExercises] = useState<SessionExercise[]>(initialExercises);
  const exercisesRef = useRef(initialExercises);
  const savingRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  function updateExercise(
    index: number,
    updater: (exercise: SessionExercise) => SessionExercise
  ) {
    setExercises((prev) => {
      const next = prev.map((exercise, i) =>
        i === index ? updater(exercise) : exercise
      );
      exercisesRef.current = next;
      return next;
    });
  }

  // Saves are serialized: only one PATCH is ever in flight, and any save
  // requested while one is pending gets coalesced into a single follow-up
  // that reads the freshest ref — otherwise two overlapping requests (e.g.
  // a checkbox toggle and a field blur firing together) can complete out of
  // order and let a stale snapshot clobber a newer one server-side.
  async function saveNow() {
    if (savingRef.current) {
      pendingSaveRef.current = true;
      return;
    }
    savingRef.current = true;
    try {
      await apiRequest(`/api/workout-logs/${logId}`, {
        method: "PATCH",
        body: JSON.stringify({ exercises: toApiExercises(exercisesRef.current) }),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save set");
    } finally {
      savingRef.current = false;
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        saveNow();
      }
    }
  }

  async function handleFinish() {
    setIsFinishing(true);
    try {
      await apiRequest(`/api/workout-logs/${logId}/finish`, { method: "POST" });
      toast.success("Workout completed!");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to finish workout"
      );
      setIsFinishing(false);
    }
  }

  async function handleCancel() {
    setIsCanceling(true);
    try {
      await apiRequest(`/api/workout-logs/${logId}`, { method: "DELETE" });
      toast.success("Workout canceled");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel workout"
      );
      setIsCanceling(false);
    }
  }

  const totalSets = exercises.reduce(
    (sum, exercise) => sum + exercise.sets.filter((set) => set.checked).length,
    0
  );

  return (
    <div className="space-y-4 pb-28 md:pb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{workoutPlanName}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            · {totalSets} {totalSets === 1 ? "set" : "sets"} logged
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCancelOpen(true)}
          aria-label="Cancel workout"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <ExerciseSessionCard
            key={exercise.exerciseId}
            exercise={exercise}
            onChange={(updater) => updateExercise(index, updater)}
            onSave={saveNow}
          />
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <Button
          size="lg"
          className="w-full text-base"
          onClick={handleFinish}
          disabled={isFinishing}
        >
          <CheckCircle2 className="size-5" />
          Finish Workout
        </Button>
      </div>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete today&apos;s in-progress workout
              log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleCancel}
              disabled={isCanceling}
            >
              Cancel workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
