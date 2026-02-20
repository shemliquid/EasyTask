import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildExportBuffer } from "@/lib/excel-export";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "LECTURER") {
      return NextResponse.json({ error: "Only lecturers can export data" }, { status: 403 });
    }
    const buffer = await buildExportBuffer();
    const filename = `EasyTask-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
