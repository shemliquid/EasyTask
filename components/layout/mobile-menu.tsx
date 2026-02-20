"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Menu,
  LayoutDashboard,
  Plus,
  Upload,
  AlertCircle,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface MobileMenuProps {
  email: string;
  role: string;
  isLecturer: boolean;
}

export function MobileMenu({ email, role, isLecturer }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog
          onClose={() => setIsOpen(false)}
          className="relative z-50 md:hidden"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col bg-white dark:bg-neutral-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
                  <Dialog.Title className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                    EasyTask
                  </Dialog.Title>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* User Info */}
                <div className="border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {email}
                  </p>
                  <Badge
                    variant={isLecturer ? "info" : "default"}
                    className="mt-2"
                  >
                    {role}
                  </Badge>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
                  {navItems.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                {/* Theme Toggle */}
                <div className="border-t border-neutral-200 px-4 py-4 dark:border-neutral-800">
                  <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Theme
                  </p>
                  <ThemeToggle />
                </div>

                {/* Sign Out */}
                <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    Sign out
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
