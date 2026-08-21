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
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Programs", href: "/programs", icon: ClipboardList, matchPrefix: "/programs" },
  { label: "Workouts", href: "/workouts", icon: Dumbbell },
  { label: "Exercises", href: "/programs?tab=exercises", icon: ListChecks },
  { label: "Statistics", href: "/statistics", icon: BarChart3 },
  { label: "History", href: "/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const [itemPath, itemQuery] = item.href.split("?");
  if (itemQuery) return false;
  return pathname === itemPath;
}
