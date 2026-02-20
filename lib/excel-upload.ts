import { prisma } from "@/lib/prisma";

export type UploadRow = { indexNumber: string; name?: string };
export type IssueType = "DUPLICATE_INDEX" | "MISSING_NAME" | "CONFLICT";

export interface UploadResult {
  processed: number;
  added: number;
  incremented: number;
  flagged: number;
  errors: { row: number; indexNumber: string; issue: string }[];
}

function normalizeHeader(s: string): string {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/index\s*number|index no|index no\./i, "index_number")
    .replace(/student\s*name|name/i, "name");
}

async function getSheetRows(buffer: Buffer): Promise<UploadRow[]> {
  // Lazy load xlsx library only when needed
  const XLSX = await import("xlsx");

  const wb = XLSX.read(buffer, { type: "buffer", raw: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return [];
  const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as unknown[][];
  if (data.length < 2) return [];
  const headers = (data[0] as unknown[]).map((h) => normalizeHeader(String(h)));
  const indexCol = headers.findIndex(
    (h) => h === "index_number" || h === "index number",
  );
  const nameCol = headers.findIndex(
    (h) => h === "name" || h === "student name",
  );
  if (indexCol < 0) return [];
  const rows: UploadRow[] = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i] as unknown[];
    const indexNumber = String(row[indexCol] ?? "").trim();
    if (!indexNumber) continue;
    const name =
      nameCol >= 0 ? String(row[nameCol] ?? "").trim() || undefined : undefined;
    rows.push({ indexNumber, name });
  }
  return rows;
}

export async function processExcelUpload(
  buffer: Buffer,
): Promise<UploadResult> {
  const rows = await getSheetRows(buffer);
  const result: UploadResult = {
    processed: 0,
    added: 0,
    incremented: 0,
    flagged: 0,
    errors: [],
  };
  const seenInFile = new Map<string, number>();

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + 2;
    const { indexNumber, name } = rows[i];
    result.processed++;

    if (seenInFile.has(indexNumber)) {
      await prisma.flaggedRecord.create({
        data: {
          indexNumber,
          name: name || null,
          issueType: "DUPLICATE_INDEX",
          source: "excel",
          assignmentCount: 1,
        },
      });
      result.flagged++;
      result.errors.push({
        row: rowIndex,
        indexNumber,
        issue: "Duplicate index in file",
      });
      continue;
    }
    seenInFile.set(indexNumber, rowIndex);

    const existing = await prisma.student.findUnique({
      where: { indexNumber },
    });

    if (existing) {
      await prisma.student.update({
        where: { id: existing.id },
        data: { assignmentCount: existing.assignmentCount + 1 },
      });
      result.incremented++;
      continue;
    }

    const conflictingFlag = await prisma.flaggedRecord.findFirst({
      where: { indexNumber, resolved: false },
    });
    if (conflictingFlag) {
      await prisma.flaggedRecord.create({
        data: {
          indexNumber,
          name: name || null,
          issueType: "CONFLICT",
          source: "excel",
          assignmentCount: 1,
        },
      });
      result.flagged++;
      result.errors.push({
        row: rowIndex,
        indexNumber,
        issue: "Conflict with existing flagged record",
      });
      continue;
    }

    if (!name) {
      await prisma.flaggedRecord.create({
        data: {
          indexNumber,
          name: null,
          issueType: "MISSING_NAME",
          source: "excel",
          assignmentCount: 1,
        },
      });
      result.flagged++;
      result.errors.push({
        row: rowIndex,
        indexNumber,
        issue: "Missing student name",
      });
      continue;
    }

    await prisma.student.create({
      data: {
        indexNumber,
        name,
        assignmentCount: 1,
      },
    });
    result.added++;
  }

  return result;
}
