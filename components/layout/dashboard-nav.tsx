"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plus,
  Upload,
  AlertCircle,
  Link2,
} from "lucide-react";

interface DashboardNavProps {
  isLecturer: boolean;
}

export function DashboardNav({ isLecturer }: DashboardNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Records",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/dashboard/entry",
      label: "Add Assignment",
      icon: Plus,
    },
    {
      href: "/dashboard/upload",
      label: "Upload Excel",
      icon: Upload,
    },
    ...(isLecturer
      ? [
          {
            href: "/dashboard/flagged",
            label: "Flagged",
            icon: AlertCircle,
          },
          {
            href: "/dashboard/lookup-links",
            label: "Lookup Links",
            icon: Link2,
          },
        ]
      : []),
  ];

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
