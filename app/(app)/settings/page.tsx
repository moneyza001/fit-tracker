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
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
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
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Theme and accent color for the app.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Theme</Label>
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
          <Label>Accent color</Label>
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
    toast.success("Settings saved");
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
        toast.error("Notification permission was not granted");
        return;
      }
    }
    setRemindersEnabled(checked);
    setDraftRemindersEnabled(checked);
    toast.success(checked ? "Reminders enabled" : "Reminders disabled");
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Preferences for your workout sessions.
        </p>
      </div>

      <AppearanceCard />

      <Card>
        <CardHeader>
          <CardTitle>Rest Timer</CardTitle>
          <CardDescription>
            How long to rest after marking a set done. Applies to every
            exercise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rest-seconds">Default rest (seconds)</Label>
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
          <Button onClick={handleSave}>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reminders</CardTitle>
          <CardDescription>
            Get a browser notification when your streak is about to break or
            your active program is waiting on you.
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
              Enable workout reminders
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
