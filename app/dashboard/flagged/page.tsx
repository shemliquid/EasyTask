import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FlaggedTable } from "./flagged-table";

export default async function FlaggedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "LECTURER") redirect("/dashboard");

  const records = await prisma.flaggedRecord.findMany({
    where: { resolved: false },
    orderBy: [{ createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Flagged records
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Records that need attention. Resolve by approving into main records, editing details, or merging with an existing student.
      </p>
      <FlaggedTable records={records} />
    </div>
  );
}
