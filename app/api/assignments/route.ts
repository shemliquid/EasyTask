import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { manualEntrySchema } from "@/lib/validations";
import { processManualEntry } from "@/lib/assignment-logic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const parsed = manualEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const result = await processManualEntry(parsed.data.indexNumber, parsed.data.name ?? null);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
