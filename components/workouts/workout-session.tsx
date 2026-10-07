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
  const [unfinishedSetsOpen, setUnfinishedSetsOpen] = useState(false);
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
      toast.error(error instanceof Error ? error.message : "บันทึกเซ็ตไม่สำเร็จ");
    } finally {
      savingRef.current = false;
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        saveNow();
      }
    }
  }

  function handleFinishClick() {
    const hasUncheckedSets = exercises.some((exercise) =>
      exercise.sets.some((set) => !set.checked)
    );
    if (hasUncheckedSets) {
      setUnfinishedSetsOpen(true);
      return;
    }
    handleFinish();
  }

  async function handleFinish() {
    setUnfinishedSetsOpen(false);
    setIsFinishing(true);
    try {
      const result = await apiRequest<{ log: WorkoutLogRow; newPRs: NewPR[] }>(
        `/api/workout-logs/${logId}/finish`,
        { method: "POST" }
      );
      toast.success("จบเวิร์คเอาท์แล้ว!");

      const nameById = new Map(
        exercisesRef.current.map((ex) => [ex.exerciseId, ex.exerciseName])
      );
      for (const pr of result.newPRs) {
        const name = nameById.get(pr.exerciseId) ?? "ท่าออกกำลังกาย";
        toast(`🏆 สถิติใหม่ (PR): ${name}`, {
          description: `${pr.weight}kg × ${pr.reps} — ประมาณ 1RM ${Math.round(pr.estimated1RM * 10) / 10}kg`,
        });
      }

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "จบเวิร์คเอาท์ไม่สำเร็จ"
      );
      setIsFinishing(false);
    }
  }

  async function handleCancel() {
    setIsCanceling(true);
    try {
      await apiRequest(`/api/workout-logs/${logId}`, { method: "DELETE" });
      toast.success("ยกเลิกเวิร์คเอาท์แล้ว");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ยกเลิกเวิร์คเอาท์ไม่สำเร็จ"
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
            · บันทึกแล้ว {totalSets} เซ็ต
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCancelOpen(true)}
          aria-label="ยกเลิกเวิร์คเอาท์"
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
          โน้ตเวิร์คเอาท์
        </label>
        <Textarea
          id="overall-note"
          placeholder="เซสชันวันนี้เป็นอย่างไร? (ไม่บังคับ)"
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
          onClick={handleFinishClick}
          disabled={isFinishing}
        >
          <CheckCircle2 className="size-5" />
          จบเวิร์คเอาท์
        </Button>
      </div>

      <AlertDialog open={unfinishedSetsOpen} onOpenChange={setUnfinishedSetsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>มีเซ็ตที่ยังไม่ทำเครื่องหมายว่าเสร็จ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณมีเซ็ตที่ยังไม่ได้ทำเครื่องหมาย เซ็ตเหล่านั้นจะไม่ถูกบันทึกลงในประวัติเวิร์คเอาท์นี้
              ต้องการจบเวิร์คเอาท์เลยหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ทำต่อ</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinish} disabled={isFinishing}>
              จบเวิร์คเอาท์เลย
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยกเลิกเวิร์คเอาท์นี้?</AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้จะลบบันทึกเวิร์คเอาท์ที่กำลังดำเนินการของวันนี้อย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ทำต่อ</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleCancel}
              disabled={isCanceling}
            >
              ยกเลิกเวิร์คเอาท์
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
