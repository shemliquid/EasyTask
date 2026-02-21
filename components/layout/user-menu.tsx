"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { User, LogOut, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  email: string;
  role: string;
  isLecturer: boolean;
}

export function UserMenu({ email, role, isLecturer }: UserMenuProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100">
        <User className="h-[18px] w-[18px]" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg focus:outline-none dark:border-neutral-700 dark:bg-neutral-800">
          <div className="px-3 py-3">
            <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {email}
            </p>
            <Badge variant={isLecturer ? "info" : "default"} className="mt-1.5">
              {role}
            </Badge>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-700">
            {isLecturer && (
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="/api/export"
                    download
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 ${
                      active ? "bg-neutral-50 dark:bg-neutral-700/50" : ""
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </a>
                )}
              </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 ${
                    active ? "bg-neutral-50 dark:bg-neutral-700/50" : ""
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
