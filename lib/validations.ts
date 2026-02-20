import { z } from "zod";

export const manualEntrySchema = z.object({
  indexNumber: z.string().min(1, "Index number is required").trim(),
  name: z.string().trim().optional().nullable(),
});

export const resolveFlaggedSchema = z.object({
  action: z.enum(["approve", "edit", "merge"]),
  name: z.string().trim().optional(),
  targetStudentId: z.string().optional(), // for merge
});

export type ManualEntryInput = z.infer<typeof manualEntrySchema>;
export type ResolveFlaggedInput = z.infer<typeof resolveFlaggedSchema>;
