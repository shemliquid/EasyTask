"use client";

import Link from "next/link";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
  email: string;
  role: string;
  isLecturer: boolean;
}

export function DashboardHeader({ email, role, isLecturer }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/95 dark:supports-[backdrop-filter]:bg-neutral-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 md:gap-8">
          <MobileMenu
            email={email}
            role={role}
            isLecturer={isLecturer}
          />
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            EasyTask
          </Link>
          <DashboardNav isLecturer={isLecturer} />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <UserMenu
            email={email}
            role={role}
            isLecturer={isLecturer}
          />
        </div>
      </div>
    </header>
  );
}
