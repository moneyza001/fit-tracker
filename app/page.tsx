import Link from "next/link";
import {
  Dumbbell,
  TrendingUp,
  Flame,
  CalendarDays,
  Scale,
  Trophy,
  ClipboardList,
} from "lucide-react";
import { connectToDatabase } from "@/lib/db";
import { Program, WorkoutLog, BodyWeight, PersonalRecord } from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import { CURRENT_USER_ID } from "@/lib/constants";
import {
  calculateStreak,
  calculateTotalVolume,
  countWorkoutsThisWeek,
} from "@/lib/dashboard-stats";
import type {
  BodyWeightRow,
  PersonalRecordRow,
  ProgramRow,
  WorkoutLogRow,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/dashboard/stat-tile";
import { WeightChart } from "@/components/dashboard/weight-chart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await connectToDatabase();

  const [completedLogsDoc, activeProgramsDoc, bodyWeightsDoc, recentPRsDoc] =
    await Promise.all([
      WorkoutLog.find({ userId: CURRENT_USER_ID, status: "completed" })
        .sort({ date: -1 })
        .populate("workoutPlanId"),
      Program.find({ status: "active" }).sort({ name: 1 }),
      BodyWeight.find({ userId: CURRENT_USER_ID }).sort({ date: 1 }),
      PersonalRecord.find({ userId: CURRENT_USER_ID })
        .sort({ achievedAt: -1 })
        .limit(5)
        .populate("exerciseId"),
    ]);

  const completedLogs = toPlainJSON<
    (WorkoutLogRow & { workoutPlanId: { _id: string; name: string } })[]
  >(completedLogsDoc);
  const activePrograms = toPlainJSON<ProgramRow[]>(activeProgramsDoc);
  const bodyWeights = toPlainJSON<BodyWeightRow[]>(bodyWeightsDoc);
  const recentPRs = toPlainJSON<
    (PersonalRecordRow & { exerciseId: { _id: string; name: string } })[]
  >(recentPRsDoc);

  const totalWorkouts = completedLogs.length;
  const totalVolume = calculateTotalVolume(completedLogs);
  const streak = calculateStreak(completedLogs.map((log) => log.date));
  const thisWeek = countWorkoutsThisWeek(completedLogs);
  const latestWeight = bodyWeights[bodyWeights.length - 1];
  const recentWorkouts = completedLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your training at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total Workouts" value={String(totalWorkouts)} icon={Dumbbell} />
        <StatTile
          label="Total Volume"
          value={`${Math.round(totalVolume).toLocaleString()} kg`}
          icon={TrendingUp}
        />
        <StatTile
          label="Current Streak"
          value={`${streak} ${streak === 1 ? "day" : "days"}`}
          icon={Flame}
          accent={streak > 0 ? "gold" : "default"}
        />
        <StatTile
          label="This Week"
          value={String(thisWeek)}
          icon={CalendarDays}
          accent="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="size-4" />
              Body Weight
              {latestWeight && (
                <Badge variant="outline" className="ml-auto">
                  {latestWeight.weight} kg
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeightChart entries={bodyWeights} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-4" />
                Active Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activePrograms.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active programs.{" "}
                  <Link href="/programs" className="underline">
                    Create one
                  </Link>
                  .
                </p>
              ) : (
                activePrograms.map((program) => (
                  <div
                    key={program._id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>{program.name}</span>
                    <Badge>active</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-4 text-amber-500" />
                Recent PRs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentPRs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No personal records yet.
                </p>
              ) : (
                recentPRs.map((pr) => (
                  <div
                    key={pr._id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <Link
                      href={`/exercises/${pr.exerciseId._id}`}
                      className="hover:underline"
                    >
                      {pr.exerciseId.name}
                    </Link>
                    <span className="text-muted-foreground">
                      {pr.weight}kg × {pr.reps}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentWorkouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No completed workouts yet.{" "}
              <Link href="/workouts" className="underline">
                Start one
              </Link>
              .
            </p>
          ) : (
            recentWorkouts.map((log) => {
              const volume = calculateTotalVolume([log]);
              return (
                <div
                  key={log._id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {log.workoutPlanId?.name ?? "Workout"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant="outline">{Math.round(volume)} kg volume</Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
