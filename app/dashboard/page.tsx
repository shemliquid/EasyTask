import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordsTable } from "./records-table";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const students = await prisma.student.findMany({
    orderBy: [{ indexNumber: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Main records
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Valid student records and assignment counts.
      </p>
      <RecordsTable students={students} />
    </div>
  );
}
