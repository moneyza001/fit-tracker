import { connectToDatabase } from "@/lib/db";
import { WorkoutLog } from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import { requireUserId } from "@/lib/auth-guard";
import { HistoryTable, type HistoryRow } from "@/components/history/history-table";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  await connectToDatabase();
  const userId = await requireUserId();

  const logsDoc = await WorkoutLog.find({ userId })
    .sort({ date: -1 })
    .populate("workoutPlanId")
    .populate("workoutTemplateId");

  const logs = toPlainJSON<
    (HistoryRow & {
      workoutPlanId: { name: string } | null;
      workoutTemplateId: { name: string } | null;
    })[]
  >(logsDoc).map((log) => ({
    ...log,
    workoutPlanName:
      log.workoutPlanId?.name ?? log.workoutTemplateId?.name ?? "เวิร์คเอาท์",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ประวัติ</h1>
        <p className="text-sm text-muted-foreground">
          เวิร์คเอาท์ทั้งหมดที่คุณบันทึกไว้
        </p>
      </div>
      <HistoryTable logs={logs} />
    </div>
  );
}
