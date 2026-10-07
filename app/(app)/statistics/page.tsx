import { connectToDatabase } from "@/lib/db";
import { BodyWeight, Exercise, WorkoutLog } from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import { requireUserId } from "@/lib/auth-guard";
import {
  aggregateMuscleGroupVolume,
  buildConsistencyHeatmap,
  buildGlobalMetricSeries,
} from "@/lib/statistics";
import type { BodyWeightRow, ExerciseRow, WorkoutLogRow } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalMetricChart } from "@/components/statistics/global-metric-chart";
import { MuscleGroupChart } from "@/components/statistics/muscle-group-chart";
import { VolumeTrendChart } from "@/components/statistics/volume-trend-chart";
import { ConsistencyHeatmap } from "@/components/statistics/consistency-heatmap";

export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  await connectToDatabase();
  const userId = await requireUserId();

  const [logsDoc, bodyWeightsDoc, exercisesDoc] = await Promise.all([
    WorkoutLog.find({ userId, status: "completed" }).sort({ date: 1 }),
    BodyWeight.find({ userId }).sort({ date: 1 }),
    Exercise.find({ userId }),
  ]);

  const logs = toPlainJSON<WorkoutLogRow[]>(logsDoc);
  const bodyWeights = toPlainJSON<BodyWeightRow[]>(bodyWeightsDoc);
  const exercises = toPlainJSON<ExerciseRow[]>(exercisesDoc);

  const series = buildGlobalMetricSeries(logs);
  const muscleGroupVolume = aggregateMuscleGroupVolume(logs, exercises);
  const heatmapWeeks = buildConsistencyHeatmap(
    logs.map((log) => log.date),
    51
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">สถิติความก้าวหน้า</h1>
        <p className="text-sm text-muted-foreground">
          เทรนด์จากเวิร์คเอาท์ทั้งหมดที่คุณบันทึกไว้
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ความก้าวหน้าตามเวลา</CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalMetricChart bodyWeights={bodyWeights} series={series} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>วอลุ่มตามกลุ่มกล้ามเนื้อ</CardTitle>
          </CardHeader>
          <CardContent>
            <MuscleGroupChart data={muscleGroupVolume} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>เทรนด์วอลุ่ม</CardTitle>
          </CardHeader>
          <CardContent>
            <VolumeTrendChart logs={logs} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ความสม่ำเสมอ</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsistencyHeatmap weeks={heatmapWeeks} />
        </CardContent>
      </Card>
    </div>
  );
}
