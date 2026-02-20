import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordsTable } from "./records-table";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileCheck, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [students, flaggedCount] = await Promise.all([
    prisma.student.findMany({
      orderBy: [{ indexNumber: "asc" }],
    }),
    prisma.flaggedRecord.count({
      where: { resolved: false },
    }),
  ]);

  const totalAssignments = students.reduce(
    (sum, student) => sum + student.assignmentCount,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Student Records
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Overview of all registered students and their assignment completion
          status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Total Students
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  {students.length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Total Assignments
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  {totalAssignments}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <FileCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Flagged Records
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  {flaggedCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <div>
        <RecordsTable students={students} userRole={session.user.role} />
      </div>
    </div>
  );
}
