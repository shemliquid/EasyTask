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

  // PERFORMANCE OPTIMIZATION: Batch load all existing data upfront to avoid N+1 queries
  const existingStudents = new Map(
    (
      await prisma.student.findMany({
        select: { indexNumber: true, id: true, assignmentCount: true, name: true },
      })
    ).map((s) => [s.indexNumber, s])
  );

  const unresolvedFlags = new Map(
    (
      await prisma.flaggedRecord.findMany({
        where: { resolved: false },
        select: { indexNumber: true, id: true },
      })
    ).map((f) => [f.indexNumber, f])
  );

  const seenInFile = new Map<string, number>();
  const toCreate: { indexNumber: string; name: string; assignmentCount: number }[] = [];
  const toUpdate: { id: string; assignmentCount: number }[] = [];
  const toFlag: {
    indexNumber: string;
    name: string | null;
    issueType: IssueType;
    source: string;
    assignmentCount: number;
  }[] = [];

  // Process all rows in memory
  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + 2;
    const { indexNumber, name } = rows[i];
    result.processed++;

    // Check for duplicate in file
    if (seenInFile.has(indexNumber)) {
      toFlag.push({
        indexNumber,
        name: name || null,
        issueType: "DUPLICATE_INDEX",
        source: "excel",
        assignmentCount: 1,
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

    // Check existing student (in-memory lookup)
    const existing = existingStudents.get(indexNumber);

    if (existing) {
      toUpdate.push({
        id: existing.id,
        assignmentCount: existing.assignmentCount + 1,
      });
      result.incremented++;
      continue;
    }

    // Check conflicting flag (in-memory lookup)
    const conflictingFlag = unresolvedFlags.has(indexNumber);
    if (conflictingFlag) {
      toFlag.push({
        indexNumber,
        name: name || null,
        issueType: "CONFLICT",
        source: "excel",
        assignmentCount: 1,
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
      toFlag.push({
        indexNumber,
        name: null,
        issueType: "MISSING_NAME",
        source: "excel",
        assignmentCount: 1,
      });
      result.flagged++;
      result.errors.push({
        row: rowIndex,
        indexNumber,
        issue: "Missing student name",
      });
      continue;
    }

    toCreate.push({
      indexNumber,
      name,
      assignmentCount: 1,
    });
    result.added++;
  }

  // PERFORMANCE OPTIMIZATION: Batch execute all database operations
  if (toCreate.length > 0) {
    await prisma.student.createMany({
      data: toCreate,
    });
  }

  if (toUpdate.length > 0) {
    // Note: MongoDB doesn't support updateMany with different values per record
    // Using Promise.all to execute updates concurrently is still much faster than sequential
    await Promise.all(
      toUpdate.map((u) =>
        prisma.student.update({
          where: { id: u.id },
          data: { assignmentCount: u.assignmentCount },
        })
      )
    );
  }

  if (toFlag.length > 0) {
    await prisma.flaggedRecord.createMany({
      data: toFlag,
    });
  }

  return result;
}
