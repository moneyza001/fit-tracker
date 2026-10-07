"use client";

import { Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RestTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  onSkip: () => void;
}

export function RestTimer({ secondsLeft, totalSeconds, onSkip }: RestTimerProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 md:inset-x-auto md:right-4 md:bottom-4 md:justify-end md:px-0">
      <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-lg">
        <Timer className="size-4 text-primary" />
        <span className="tabular-nums font-medium">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onSkip}
          aria-label="ข้ามตัวจับเวลาพัก"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
