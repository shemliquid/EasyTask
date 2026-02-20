import { prisma } from "@/lib/prisma";

export type IssueType = "DUPLICATE_INDEX" | "MISSING_NAME" | "CONFLICT";

export interface ManualEntryResult {
  success: boolean;
  created?: boolean;
  incremented?: boolean;
  flagged?: boolean;
  flaggedId?: string;
  issueType?: IssueType;
  message: string;
}

export async function processManualEntry(
  indexNumber: string,
  name: string | null | undefined
): Promise<ManualEntryResult> {
  const trimmedIndex = indexNumber.trim();
  const trimmedName = name?.trim() || null;

  const existing = await prisma.student.findUnique({
    where: { indexNumber: trimmedIndex },
  });

  if (existing) {
    await prisma.student.update({
      where: { id: existing.id },
      data: { assignmentCount: existing.assignmentCount + 1 },
    });
    return {
      success: true,
      incremented: true,
      message: `Assignment count updated for ${existing.name || trimmedIndex}.`,
    };
  }

  if (!trimmedName) {
    const flagged = await prisma.flaggedRecord.create({
      data: {
        indexNumber: trimmedIndex,
        name: null,
        issueType: "MISSING_NAME",
        source: "manual",
        assignmentCount: 1,
      },
    });
    return {
      success: true,
      flagged: true,
      flaggedId: flagged.id,
      issueType: "MISSING_NAME",
      message: "New index number without name – record flagged for resolution.",
    };
  }

  await prisma.student.create({
    data: {
      indexNumber: trimmedIndex,
      name: trimmedName,
      assignmentCount: 1,
    },
  });
  return {
    success: true,
    created: true,
    message: `New student ${trimmedName} (${trimmedIndex}) added.`,
  };
}

export async function resolveFlagged(
  flaggedId: string,
  action: "approve" | "edit" | "merge",
  options?: { name?: string; targetStudentId?: string }
) {
  const flagged = await prisma.flaggedRecord.findUnique({
    where: { id: flaggedId },
  });
  if (!flagged || flagged.resolved) {
    return { success: false, error: "Record not found or already resolved." };
  }

  if (action === "merge" && options?.targetStudentId) {
    const target = await prisma.student.findUnique({
      where: { id: options.targetStudentId },
    });
    if (!target) return { success: false, error: "Target student not found." };
    await prisma.student.update({
      where: { id: target.id },
      data: { assignmentCount: target.assignmentCount + flagged.assignmentCount },
    });
    await prisma.flaggedRecord.update({
      where: { id: flaggedId },
      data: { resolved: true, resolution: "merge" },
    });
    return { success: true, message: "Merged into existing student." };
  }

  if (action === "edit" && options?.name) {
    const existing = await prisma.student.findUnique({
      where: { indexNumber: flagged.indexNumber },
    });
    if (existing) {
      await prisma.student.update({
        where: { id: existing.id },
        data: {
          name: options.name,
          assignmentCount: existing.assignmentCount + flagged.assignmentCount,
        },
      });
      await prisma.flaggedRecord.update({
        where: { id: flaggedId },
        data: { resolved: true, resolution: "edit" },
      });
      return { success: true, message: "Updated and merged." };
    }
    await prisma.student.create({
      data: {
        indexNumber: flagged.indexNumber,
        name: options.name,
        assignmentCount: flagged.assignmentCount,
      },
    });
    await prisma.flaggedRecord.update({
      where: { id: flaggedId },
      data: { resolved: true, resolution: "edit" },
    });
    return { success: true, message: "Added to main records." };
  }

  if (action === "approve") {
    const nameToUse = options?.name?.trim() || flagged.name || null;
    await prisma.student.create({
      data: {
        indexNumber: flagged.indexNumber,
        name: nameToUse,
        assignmentCount: flagged.assignmentCount,
      },
    });
    await prisma.flaggedRecord.update({
      where: { id: flaggedId },
      data: { resolved: true, resolution: "approved" },
    });
    return { success: true, message: "Approved into main records." };
  }

  return { success: false, error: "Invalid resolution action or missing options." };
}
