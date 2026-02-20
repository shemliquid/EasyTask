import { prisma } from "@/lib/prisma";

export async function buildExportBuffer(): Promise<Buffer> {
  // Lazy load xlsx library only when needed
  const XLSX = await import("xlsx");

  const [students, flagged] = await Promise.all([
    prisma.student.findMany({ orderBy: [{ indexNumber: "asc" }] }),
    prisma.flaggedRecord.findMany({ orderBy: [{ createdAt: "desc" }] }),
  ]);

  const mainData = [
    ["Index Number", "Student Name", "Assignment Count"],
    ...students.map((s) => [s.indexNumber, s.name ?? "", s.assignmentCount]),
  ];
  const flaggedData = [
    [
      "Index Number",
      "Student Name",
      "Issue Type",
      "Source",
      "Resolved",
      "Assignment Count",
    ],
    ...flagged.map((f) => [
      f.indexNumber,
      f.name ?? "",
      f.issueType,
      f.source,
      f.resolved ? "Yes" : "No",
      f.assignmentCount,
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const wsMain = XLSX.utils.aoa_to_sheet(mainData);
  const wsFlagged = XLSX.utils.aoa_to_sheet(flaggedData);
  XLSX.utils.book_append_sheet(wb, wsMain, "Main Records");
  XLSX.utils.book_append_sheet(wb, wsFlagged, "Flagged Records");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(buf);
}
