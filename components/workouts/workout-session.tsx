"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import { toApiExercises, type SessionExercise } from "@/lib/workout-session";
import type { NewPR } from "@/lib/detect-prs";
import type { WorkoutLogRow } from "@/types";
import { getRestTimerSeconds } from "@/lib/rest-timer-prefs";
import { playAlertSound, vibrateDevice } from "@/lib/notify";
import { ExerciseSessionCard } from "./exercise-session-card";
import { RestTimer } from "./rest-timer";
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
  initialOverallNote: string;
}

export function WorkoutSession({
  logId,
  workoutPlanName,
  date,
  initialExercises,
  initialOverallNote,
}: WorkoutSessionProps) {
  const router = useRouter();
  const [exercises, setExercises] = useState<SessionExercise[]>(initialExercises);
  const exercisesRef = useRef(initialExercises);
  const [overallNote, setOverallNote] = useState(initialOverallNote);
  const overallNoteRef = useRef(initialOverallNote);
  const savingRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState(90);
  const restDurationRef = useRef(90);

  useEffect(() => {
    restDurationRef.current = getRestTimerSeconds();
  }, []);

  useEffect(() => {
    if (restSecondsLeft === null || restSecondsLeft <= 0) return;
    const timeout = setTimeout(() => {
      setRestSecondsLeft((s) => {
        if (s === null) return null;
        const next = s - 1;
        if (next <= 0) {
          playAlertSound();
          vibrateDevice();
          return null;
        }
        return next;
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [restSecondsLeft]);

  function startRestTimer() {
    setRestTotal(restDurationRef.current);
    setRestSecondsLeft(restDurationRef.current);
  }

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

  function handleOverallNoteChange(value: string) {
    setOverallNote(value);
    overallNoteRef.current = value;
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
        body: JSON.stringify({
          exercises: toApiExercises(exercisesRef.current),
          overallNote: overallNoteRef.current.trim(),
        }),
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
      const result = await apiRequest<{ log: WorkoutLogRow; newPRs: NewPR[] }>(
        `/api/workout-logs/${logId}/finish`,
        { method: "POST" }
      );
      toast.success("Workout completed!");

      const nameById = new Map(
        exercisesRef.current.map((ex) => [ex.exerciseId, ex.exerciseName])
      );
      for (const pr of result.newPRs) {
        const name = nameById.get(pr.exerciseId) ?? "Exercise";
        toast(`🏆 New PR: ${name}`, {
          description: `${pr.weight}kg × ${pr.reps} — est. 1RM ${Math.round(pr.estimated1RM * 10) / 10}kg`,
        });
      }

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
            onSetChecked={startRestTimer}
          />
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="overall-note" className="text-sm font-medium">
          Workout Note
        </label>
        <Textarea
          id="overall-note"
          placeholder="How did today's session feel? (optional)"
          value={overallNote}
          onChange={(e) => handleOverallNoteChange(e.target.value)}
          onBlur={saveNow}
          className="min-h-16"
        />
      </div>

      {restSecondsLeft !== null && (
        <RestTimer
          secondsLeft={restSecondsLeft}
          totalSeconds={restTotal}
          onSkip={() => setRestSecondsLeft(null)}
        />
      )}

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
