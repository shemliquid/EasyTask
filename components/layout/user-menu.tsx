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
      <Menu.Button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <User className="h-4 w-4" />
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {email}
          </p>
          <Badge variant={isLecturer ? "info" : "default"} className="mt-0.5">
            {role}
          </Badge>
        </div>
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
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-neutral-100 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-neutral-700 dark:bg-neutral-800 dark:ring-white dark:ring-opacity-10">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Signed in as
            </p>
            <p className="mt-1 truncate text-sm text-neutral-500 dark:text-neutral-400">
              {email}
            </p>
            <Badge variant={isLecturer ? "info" : "default"} className="mt-2">
              {role}
            </Badge>
          </div>

          {isLecturer && (
            <div className="p-1">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="/api/export"
                    download
                    className={`${
                      active
                        ? "bg-neutral-100 dark:bg-neutral-700"
                        : ""
                    } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100`}
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </a>
                )}
              </Menu.Item>
            </div>
          )}

          <div className="p-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className={`${
                    active
                      ? "bg-neutral-100 dark:bg-neutral-700"
                      : ""
                  } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400`}
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
