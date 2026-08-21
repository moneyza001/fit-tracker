"use client";

import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { SessionExercise, SessionSetRow } from "@/lib/workout-session";

interface ExerciseSessionCardProps {
  exercise: SessionExercise;
  onChange: (updater: (exercise: SessionExercise) => SessionExercise) => void;
  onSave: () => void;
}

export function ExerciseSessionCard({
  exercise,
  onChange,
  onSave,
}: ExerciseSessionCardProps) {
  function updateSet(setIndex: number, patch: Partial<SessionSetRow>) {
    onChange((ex) => ({
      ...ex,
      sets: ex.sets.map((set, i) => (i === setIndex ? { ...set, ...patch } : set)),
    }));
  }

  function toggleSet(setIndex: number, checked: boolean) {
    updateSet(setIndex, { checked });
    onSave();
  }

  function addSet() {
    onChange((ex) => {
      const last = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [
          ...ex.sets,
          {
            set: ex.sets.length + 1,
            reps: last?.reps ?? ex.targetReps,
            weight: last?.weight ?? ex.targetWeight,
            checked: false,
          },
        ],
      };
    });
  }

  function removeSet(setIndex: number) {
    const wasChecked = exercise.sets[setIndex]?.checked;
    onChange((ex) => ({
      ...ex,
      sets: ex.sets
        .filter((_, i) => i !== setIndex)
        .map((set, i) => ({ ...set, set: i + 1 })),
    }));
    if (wasChecked) onSave();
  }

  function updateNote(note: string) {
    onChange((ex) => ({ ...ex, note }));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{exercise.exerciseName}</CardTitle>
          <Badge variant="outline">
            {exercise.targetSets} × {exercise.targetReps} @{" "}
            {exercise.targetWeight}kg
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {exercise.sets.map((set, index) => (
            <div key={set.set} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-sm text-muted-foreground">
                {set.set}
              </span>
              <Input
                type="number"
                inputMode="numeric"
                aria-label={`Set ${set.set} reps`}
                className="w-16"
                value={set.reps}
                onChange={(e) =>
                  updateSet(index, { reps: e.target.valueAsNumber || 0 })
                }
                onBlur={() => set.checked && onSave()}
              />
              <span className="text-xs text-muted-foreground">reps</span>
              <Input
                type="number"
                inputMode="decimal"
                aria-label={`Set ${set.set} weight`}
                className="w-20"
                value={set.weight}
                onChange={(e) =>
                  updateSet(index, { weight: e.target.valueAsNumber || 0 })
                }
                onBlur={() => set.checked && onSave()}
              />
              <span className="text-xs text-muted-foreground">kg</span>
              <Checkbox
                className="ml-auto size-6"
                checked={set.checked}
                onCheckedChange={(checked) => toggleSet(index, checked === true)}
                aria-label={`Mark set ${set.set} done`}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeSet(index)}
                aria-label={`Remove set ${set.set}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addSet}>
          <Plus className="size-4" />
          Add Set
        </Button>
        <Textarea
          placeholder="Note (optional)"
          value={exercise.note}
          onChange={(e) => updateNote(e.target.value)}
          onBlur={onSave}
          className="min-h-16"
        />
      </CardContent>
    </Card>
  );
}
