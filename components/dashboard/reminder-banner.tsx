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
        "สตรีคของคุณกำลังจะขาด",
        `คุณมีสตรีค ${streak} วันแล้ว — ออกกำลังกายวันนี้เพื่อรักษาสตรีคไว้`
      );
      markNotifiedToday("streak");
    } else if (reminders.scheduleReminder && !hasNotifiedToday("schedule")) {
      sendBrowserNotification(
        "ถึงเวลาออกกำลังกายครั้งต่อไป",
        "คุณมีโปรแกรมที่ใช้งานอยู่ และยังไม่ได้บันทึกการออกกำลังกายมาสองสามวันแล้ว"
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
            คุณมีสตรีค <span className="font-medium">{streak} วัน</span> —
            บันทึกการออกกำลังกายวันนี้เพื่อให้สตรีคต่อเนื่อง
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
          คุณยังไม่ได้บันทึกการออกกำลังกายมาสองสามวันแล้ว — โปรแกรมของคุณกำลังรออยู่
        </p>
      </CardContent>
    </Card>
  );
}
