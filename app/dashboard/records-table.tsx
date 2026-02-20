"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface Student {
  id: string;
  indexNumber: string;
  name: string | null;
  assignmentCount: number;
}

export function RecordsTable({ students }: { students: Student[] }) {
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter(
    (student) =>
      student.indexNumber.toLowerCase().includes(search.toLowerCase()) ||
      student.name?.toLowerCase().includes(search.toLowerCase()),
  );

  if (students.length === 0) {
    return (
      <Card className="mt-6 p-12 text-center">
        <div className="mx-auto max-w-sm space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <svg
              className="h-6 w-6 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            No records yet
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Get started by adding assignments manually or uploading an Excel
            file.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search by index number or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          {filteredStudents.length} of {students.length} records
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Index Number</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="text-right">Assignment Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-neutral-500"
                >
                  No records found matching "{search}"
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono">
                    {student.indexNumber}
                  </TableCell>
                  <TableCell>
                    {student.name ?? (
                      <span className="text-neutral-400 dark:text-neutral-500">
                        No name
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex h-7 min-w-[2rem] items-center justify-center rounded-full bg-blue-100 px-2.5 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {student.assignmentCount}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
