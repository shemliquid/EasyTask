"use client";

import { useState, Fragment } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  indexNumber: string;
  name: string | null;
}

interface StudentSelectorProps {
  students: Student[];
  selected: Student | null;
  onSelect: (student: Student | null) => void;
  disabled?: boolean;
}

export function StudentSelector({
  students,
  selected,
  onSelect,
  disabled,
}: StudentSelectorProps) {
  const [query, setQuery] = useState("");

  const filteredStudents =
    query === ""
      ? students
      : students.filter((student) => {
          const searchString = `${student.indexNumber} ${student.name || ""}`.toLowerCase();
          return searchString.includes(query.toLowerCase());
        });

  return (
    <Combobox value={selected} onChange={onSelect} disabled={disabled}>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg border border-neutral-300 bg-white text-left focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-neutral-600 dark:bg-neutral-800">
          <Combobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-neutral-900 focus:outline-none focus:ring-0 dark:bg-neutral-800 dark:text-neutral-100"
            displayValue={(student: Student | null) =>
              student ? `${student.indexNumber} - ${student.name || "No name"}` : ""
            }
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student by index number or name..."
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown
              className="h-4 w-4 text-neutral-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800 sm:text-sm">
            {filteredStudents.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-neutral-500 dark:text-neutral-400">
                No students found.
              </div>
            ) : (
              filteredStudents.map((student) => (
                <Combobox.Option
                  key={student.id}
                  className={({ active }) =>
                    cn(
                      "relative cursor-pointer select-none py-2 pl-10 pr-4",
                      active
                        ? "bg-blue-600 text-white"
                        : "text-neutral-900 dark:text-neutral-100"
                    )
                  }
                  value={student}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex flex-col">
                        <span className={cn("font-mono text-sm", selected && "font-semibold")}>
                          {student.indexNumber}
                        </span>
                        <span className={cn("text-xs", active ? "text-white/80" : "text-neutral-500 dark:text-neutral-400")}>
                          {student.name || "No name"}
                        </span>
                      </div>
                      {selected && (
                        <span
                          className={cn(
                            "absolute inset-y-0 left-0 flex items-center pl-3",
                            active ? "text-white" : "text-blue-600"
                          )}
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
