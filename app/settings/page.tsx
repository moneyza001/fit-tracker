"use client";

import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_REST_SECONDS,
  getRestTimerSeconds,
  setRestTimerSeconds,
  subscribeRestTimerSeconds,
} from "@/lib/rest-timer-prefs";

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

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Preferences for your workout sessions.
        </p>
      </div>

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
    </div>
  );
}
