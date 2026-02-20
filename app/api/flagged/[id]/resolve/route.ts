import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resolveFlaggedSchema } from "@/lib/validations";
import { resolveFlagged } from "@/lib/assignment-logic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "LECTURER") {
      return NextResponse.json({ error: "Only lecturers can resolve flagged records" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    const parsed = resolveFlaggedSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const result = await resolveFlagged(id, parsed.data.action, {
      name: parsed.data.name,
      targetStudentId: parsed.data.targetStudentId,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
