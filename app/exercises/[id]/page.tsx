import { notFound } from "next/navigation";
import { Weight, Trophy, Zap } from "lucide-react";
import { connectToDatabase } from "@/lib/db";
import { BodyWeight, Exercise, WorkoutLog } from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import { CURRENT_USER_ID } from "@/lib/constants";
import { buildExerciseSessionStats } from "@/lib/exercise-stats";
import { buildBodyWeightOverlay } from "@/lib/body-weight-overlay";
import type { BodyWeightRow, ExerciseRow, WorkoutLogRow } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ExerciseMetricChart } from "@/components/exercises/exercise-metric-chart";
import { ExerciseHistoryTable } from "@/components/exercises/exercise-history-table";
import { BodyWeightOverlayChart } from "@/components/exercises/body-weight-overlay-chart";

export const dynamic = "force-dynamic";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectToDatabase();

  const exerciseDoc = await Exercise.findById(id);
  if (!exerciseDoc) {
    notFound();
  }

  const [logsDoc, bodyWeightsDoc] = await Promise.all([
    WorkoutLog.find({
      userId: CURRENT_USER_ID,
      status: "completed",
    }).sort({ date: 1 }),
    BodyWeight.find({ userId: CURRENT_USER_ID }).sort({ date: 1 }),
  ]);

  const exercise = toPlainJSON<ExerciseRow>(exerciseDoc);
  const logs = toPlainJSON<WorkoutLogRow[]>(logsDoc);
  const bodyWeights = toPlainJSON<BodyWeightRow[]>(bodyWeightsDoc);
  const sessions = buildExerciseSessionStats(logs, exercise._id);
  const overlay = buildBodyWeightOverlay(sessions, bodyWeights);

  const latest = sessions[sessions.length - 1];
  const bestWeight = sessions.length
    ? Math.max(...sessions.map((session) => session.weight))
    : 0;
  const bestEstimated1RM = sessions.length
    ? Math.max(...sessions.map((session) => session.estimated1RM))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{exercise.name}</h1>
          <Badge variant="outline">{exercise.muscleGroup}</Badge>
          <Badge variant="outline">{exercise.equipment}</Badge>
        </div>
        <p className="text-sm text-muted-foreground capitalize">
          {exercise.type}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatTile
          label="Current"
          value={latest ? `${latest.weight} kg` : "—"}
          icon={Weight}
        />
        <StatTile
          label="Best"
          value={sessions.length ? `${bestWeight} kg` : "—"}
          icon={Trophy}
          accent="gold"
        />
        <StatTile
          label="Est. 1RM"
          value={
            sessions.length ? `${Math.round(bestEstimated1RM * 10) / 10} kg` : "—"
          }
          icon={Zap}
          accent="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseMetricChart sessions={sessions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Body Weight vs. Lifted Weight</CardTitle>
        </CardHeader>
        <CardContent>
          <BodyWeightOverlayChart
            data={overlay}
            hasBodyWeightEntries={bodyWeights.length > 0}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent History</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseHistoryTable sessions={sessions} />
        </CardContent>
      </Card>
    </div>
  );
}
