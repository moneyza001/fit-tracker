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
        <h1 className="text-2xl font-semibold">Progress Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Trends across every workout you&apos;ve logged.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalMetricChart bodyWeights={bodyWeights} series={series} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Volume by Muscle Group</CardTitle>
          </CardHeader>
          <CardContent>
            <MuscleGroupChart data={muscleGroupVolume} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <VolumeTrendChart logs={logs} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsistencyHeatmap weeks={heatmapWeeks} />
        </CardContent>
      </Card>
    </div>
  );
}
