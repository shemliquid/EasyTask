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
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <MobileMenu
            email={email}
            role={role}
            isLecturer={isLecturer}
          />
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            EasyTask
          </Link>
          <div className="hidden md:block h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
          <DashboardNav isLecturer={isLecturer} />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
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
