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
import { requireUserId } from "@/lib/auth-guard";
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
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/dashboard/stat-tile";
import { WeightChart } from "@/components/dashboard/weight-chart";
import { ReminderBanner } from "@/components/dashboard/reminder-banner";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await connectToDatabase();
  const userId = await requireUserId();

  const [completedLogsDoc, activeProgramsDoc, bodyWeightsDoc, recentPRsDoc] =
    await Promise.all([
      WorkoutLog.find({ userId, status: "completed" })
        .sort({ date: -1 })
        .populate("workoutPlanId")
        .populate("workoutTemplateId"),
      Program.find({ userId, status: "active" }).sort({ name: 1 }),
      BodyWeight.find({ userId }).sort({ date: 1 }),
      PersonalRecord.find({ userId })
        .sort({ achievedAt: -1 })
        .limit(5)
        .populate("exerciseId"),
    ]);

  const completedLogs = toPlainJSON<
    (WorkoutLogRow & {
      workoutPlanId: { _id: string; name: string } | null;
      workoutTemplateId: { _id: string; name: string } | null;
    })[]
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
  const lastWorkoutDate = completedLogs[0]?.date ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">แดชบอร์ด</h1>
        <p className="text-sm text-muted-foreground">
          ภาพรวมการฝึกของคุณ
        </p>
      </div>

      <ReminderBanner
        streak={streak}
        lastWorkoutDate={lastWorkoutDate}
        hasActiveProgram={activePrograms.length > 0}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="เวิร์คเอาท์ทั้งหมด" value={String(totalWorkouts)} icon={Dumbbell} />
        <StatTile
          label="วอลุ่มทั้งหมด"
          value={`${Math.round(totalVolume).toLocaleString()} kg`}
          icon={TrendingUp}
        />
        <StatTile
          label="สตรีคปัจจุบัน"
          value={`${streak} วัน`}
          icon={Flame}
          accent={streak > 0 ? "gold" : "default"}
        />
        <StatTile
          label="สัปดาห์นี้"
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
              น้ำหนักตัว
            </CardTitle>
            <CardAction className="flex items-center gap-2">
              {latestWeight && (
                <Badge variant="outline">{latestWeight.weight} kg</Badge>
              )}
              <Link
                href="/body-weight"
                className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                บันทึกน้ำหนัก
              </Link>
            </CardAction>
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
                โปรแกรมที่ใช้งานอยู่
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activePrograms.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีโปรแกรมที่ใช้งานอยู่{" "}
                  <Link href="/programs" className="underline">
                    สร้างเลย
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
                    <Badge>ใช้งานอยู่</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-4 text-amber-500" />
                สถิติส่วนตัว (PR) ล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentPRs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีสถิติส่วนตัว
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
          <CardTitle>เวิร์คเอาท์ล่าสุด</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentWorkouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              ยังไม่มีเวิร์คเอาท์ที่เสร็จสิ้น{" "}
              <Link href="/workouts" className="underline">
                เริ่มเลย
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
                      {log.workoutPlanId?.name ??
                        log.workoutTemplateId?.name ??
                        "เวิร์คเอาท์"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant="outline">วอลุ่ม {Math.round(volume)} kg</Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
