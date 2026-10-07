import { cn } from "@/lib/utils";
import type { HeatmapDay } from "@/lib/statistics";

interface ConsistencyHeatmapProps {
  weeks: HeatmapDay[][];
}

function intensityClass(count: number): string {
  if (count <= 0) return "bg-muted";
  if (count === 1) return "bg-primary/35";
  if (count === 2) return "bg-primary/60";
  if (count === 3) return "bg-primary/80";
  return "bg-primary";
}

export function ConsistencyHeatmap({ weeks }: ConsistencyHeatmapProps) {
  const totalDays = weeks.flat().filter((day) => day.count > 0).length;

  if (weeks.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
        ยังไม่มีประวัติการออกกำลังกาย
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} workout${day.count === 1 ? "" : "s"}`}
                className={cn("size-3 rounded-sm", intensityClass(day.count))}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        ออกกำลังกาย {totalDays} วันในช่วง {weeks.length} สัปดาห์ที่ผ่านมา
      </p>
    </div>
  );
}
