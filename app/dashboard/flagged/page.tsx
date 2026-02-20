import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FlaggedTable } from "../flagged-table";

export default async function FlaggedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "LECTURER") redirect("/dashboard");

  const records = await prisma.flaggedRecord.findMany({
    where: { resolved: false },
    orderBy: [{ createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Flagged Records
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Review and resolve records that require attention before adding them
          to the main student database.
        </p>
      </div>

      <FlaggedTable records={records} />
    </div>
  );
}
