import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LookupLinksClient } from "./lookup-links-client";

export default async function LookupLinksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Only lecturers can access this page
  if (session.user.role !== "LECTURER") {
    redirect("/dashboard");
  }

  return <LookupLinksClient />;
}
