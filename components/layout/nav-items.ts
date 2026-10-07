import {
  LayoutDashboard,
  ClipboardList,
  Dumbbell,
  ListChecks,
  BarChart3,
  History,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPrefix?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "แดชบอร์ด", href: "/", icon: LayoutDashboard },
  { label: "โปรแกรม", href: "/programs", icon: ClipboardList, matchPrefix: "/programs" },
  { label: "เวิร์คเอาท์", href: "/workouts", icon: Dumbbell },
  { label: "ท่าออกกำลังกาย", href: "/programs?tab=exercises", icon: ListChecks },
  { label: "สถิติ", href: "/statistics", icon: BarChart3 },
  { label: "ประวัติ", href: "/history", icon: History },
  { label: "ตั้งค่า", href: "/settings", icon: Settings },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const [itemPath, itemQuery] = item.href.split("?");
  if (itemQuery) return false;
  return pathname === itemPath;
}
