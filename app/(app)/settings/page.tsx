"use client";

import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DEFAULT_REST_SECONDS,
  getRestTimerSeconds,
  setRestTimerSeconds,
  subscribeRestTimerSeconds,
} from "@/lib/rest-timer-prefs";
import {
  getRemindersEnabled,
  setRemindersEnabled,
  subscribeRemindersEnabled,
} from "@/lib/reminder-prefs";
import { requestNotificationPermission } from "@/lib/notify";
import {
  ACCENT_OPTIONS,
  getAccent,
  setAccent,
  subscribeAccent,
  type Accent,
} from "@/lib/accent-prefs";

const THEME_OPTIONS = [
  { value: "light", label: "สว่าง" },
  { value: "dark", label: "มืด" },
  { value: "system", label: "ระบบ" },
] as const;

function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function AppearanceCard() {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  const persistedAccent = useSyncExternalStore(
    subscribeAccent,
    getAccent,
    () => "gray" as Accent
  );
  const [draftAccent, setDraftAccent] = useState<Accent | null>(null);
  const accent = draftAccent ?? persistedAccent;

  function handleAccentChange(value: Accent) {
    setAccent(value);
    setDraftAccent(value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>การแสดงผล</CardTitle>
        <CardDescription>ธีมและสีหลักของแอป</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>ธีม</Label>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={mounted && theme === option.value ? "default" : "outline"}
                onClick={() => setTheme(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>สีหลัก</Label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-label={option.label}
                aria-pressed={accent === option.value}
                onClick={() => handleAccentChange(option.value)}
                className={cn(
                  "size-8 rounded-full ring-1 ring-foreground/10 transition-transform hover:scale-110",
                  option.swatchClass,
                  accent === option.value &&
                    "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const persisted = useSyncExternalStore(
    subscribeRestTimerSeconds,
    getRestTimerSeconds,
    () => DEFAULT_REST_SECONDS
  );
  const [draft, setDraft] = useState<number | null>(null);
  const seconds = draft ?? persisted;

  function handleSave() {
    setRestTimerSeconds(seconds);
    setDraft(seconds);
    toast.success("บันทึกการตั้งค่าแล้ว");
  }

  const persistedRemindersEnabled = useSyncExternalStore(
    subscribeRemindersEnabled,
    getRemindersEnabled,
    () => false
  );
  const [draftRemindersEnabled, setDraftRemindersEnabled] = useState<
    boolean | null
  >(null);
  const remindersEnabled = draftRemindersEnabled ?? persistedRemindersEnabled;

  async function handleToggleReminders(checked: boolean) {
    if (checked) {
      const permission = await requestNotificationPermission();
      if (permission !== "granted") {
        toast.error("ไม่ได้รับอนุญาตให้แจ้งเตือน");
        return;
      }
    }
    setRemindersEnabled(checked);
    setDraftRemindersEnabled(checked);
    toast.success(checked ? "เปิดการแจ้งเตือนแล้ว" : "ปิดการแจ้งเตือนแล้ว");
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ตั้งค่า</h1>
        <p className="text-sm text-muted-foreground">
          ปรับแต่งการตั้งค่าสำหรับเวิร์คเอาท์ของคุณ
        </p>
      </div>

      <AppearanceCard />

      <Card>
        <CardHeader>
          <CardTitle>ตัวจับเวลาพัก</CardTitle>
          <CardDescription>
            ระยะเวลาพักหลังจากทำเซ็ตเสร็จ ใช้กับทุกท่าออกกำลังกาย
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rest-seconds">เวลาพักเริ่มต้น (วินาที)</Label>
            <Input
              id="rest-seconds"
              type="number"
              min={0}
              max={600}
              className="max-w-32"
              value={seconds}
              onChange={(e) => setDraft(e.target.valueAsNumber || 0)}
            />
          </div>
          <Button onClick={handleSave}>บันทึก</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>การแจ้งเตือน</CardTitle>
          <CardDescription>
            รับการแจ้งเตือนจากเบราว์เซอร์เมื่อสตรีคของคุณกำลังจะขาด
            หรือโปรแกรมที่ใช้งานอยู่กำลังรอคุณอยู่
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Checkbox
              id="reminders-enabled"
              checked={remindersEnabled}
              onCheckedChange={(checked) =>
                handleToggleReminders(checked === true)
              }
            />
            <Label htmlFor="reminders-enabled">
              เปิดการแจ้งเตือนเวิร์คเอาท์
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
