"use client";

import { useEffect } from "react";
import { Flame, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { computeReminders } from "@/lib/reminders";
import {
  getRemindersEnabled,
  hasNotifiedToday,
  markNotifiedToday,
} from "@/lib/reminder-prefs";
import { sendBrowserNotification } from "@/lib/notify";

interface ReminderBannerProps {
  streak: number;
  lastWorkoutDate: string | null;
  hasActiveProgram: boolean;
}

export function ReminderBanner({
  streak,
  lastWorkoutDate,
  hasActiveProgram,
}: ReminderBannerProps) {
  const reminders = computeReminders({
    today: new Date().toISOString(),
    streak,
    lastWorkoutDate,
    hasActiveProgram,
  });

  useEffect(() => {
    if (!getRemindersEnabled()) return;

    if (reminders.streakAtRisk && !hasNotifiedToday("streak")) {
      sendBrowserNotification(
        "Your streak is about to break",
        `You're on a ${streak}-day streak — get a workout in today to keep it alive.`
      );
      markNotifiedToday("streak");
    } else if (reminders.scheduleReminder && !hasNotifiedToday("schedule")) {
      sendBrowserNotification(
        "Time for your next workout",
        "You have an active program and haven't logged a workout in a couple of days."
      );
      markNotifiedToday("schedule");
    }
  }, [reminders.streakAtRisk, reminders.scheduleReminder, streak]);

  if (!reminders.streakAtRisk && !reminders.scheduleReminder) {
    return null;
  }

  if (reminders.streakAtRisk) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-center gap-3">
          <Flame className="size-5 shrink-0 text-amber-500" />
          <p className="text-sm">
            You&apos;re on a <span className="font-medium">{streak}-day streak</span> —
            log a workout today to keep it going.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-center gap-3">
        <CalendarClock className="size-5 shrink-0 text-primary" />
        <p className="text-sm">
          You haven&apos;t logged a workout in a couple of days — your program is
          waiting.
        </p>
      </CardContent>
    </Card>
  );
}
