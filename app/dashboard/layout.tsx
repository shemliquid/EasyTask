import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isLecturer = session.user.role === "LECTURER";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <DashboardHeader
        email={session.user.email ?? ""}
        role={session.user.role}
        isLecturer={isLecturer}
      />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
