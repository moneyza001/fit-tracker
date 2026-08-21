import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "default" | "success" | "gold";
}

const ACCENT_CLASSES: Record<NonNullable<StatTileProps["accent"]>, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-500",
  gold: "bg-amber-500/10 text-amber-500",
};

export function StatTile({ label, value, icon: Icon, accent = "default" }: StatTileProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", ACCENT_CLASSES[accent])}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
