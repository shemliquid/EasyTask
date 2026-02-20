"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreVertical, Check, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FlaggedRecord {
  id: string;
  indexNumber: string;
  name: string | null;
  issueType: string;
  source: string;
  assignmentCount: number;
}

export function FlaggedTable({ records }: { records: FlaggedRecord[] }) {
  const [selectedRecord, setSelectedRecord] = useState<FlaggedRecord | null>(
    null,
  );
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openModal(record: FlaggedRecord) {
    setSelectedRecord(record);
    setName(record.name ?? "");
  }

  function closeModal() {
    setSelectedRecord(null);
    setName("");
  }

  async function handleResolve(action: "approve" | "edit") {
    if (!selectedRecord) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/flagged/${selectedRecord.id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "edit" || action === "approve"
            ? { name: name.trim() || undefined }
            : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Failed to resolve record", {
          description: data.error ?? "An error occurred.",
        });
        setLoading(false);
        return;
      }

      toast.success("Record resolved successfully", {
        description:
          action === "approve"
            ? "Record has been approved and added to main records."
            : "Record has been updated with the provided information.",
      });

      closeModal();
      router.refresh();
    } catch {
      toast.error("Network error", {
        description: "Could not connect to the server.",
      });
    }

    setLoading(false);
  }

  const issueTypeVariant = (type: string) => {
    switch (type) {
      case "DUPLICATE_INDEX":
        return "error";
      case "MISSING_NAME":
        return "warning";
      case "CONFLICT":
        return "error";
      default:
        return "default";
    }
  };

  if (records.length === 0) {
    return (
      <Card className="mt-6 p-12 text-center">
        <div className="mx-auto max-w-sm space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            All clear!
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No flagged records requiring attention.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="mt-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Index Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Issue Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono">
                    {record.indexNumber}
                  </TableCell>
                  <TableCell>
                    {record.name ?? (
                      <span className="text-neutral-400 dark:text-neutral-500">
                        No name
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={issueTypeVariant(record.issueType) as any}>
                      {record.issueType.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{record.source}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {record.assignmentCount}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(record)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Resolution Modal */}
      <Modal open={!!selectedRecord} onClose={closeModal} className="max-w-xl">
        {selectedRecord && (
          <>
            <ModalHeader onClose={closeModal}>
              Resolve Flagged Record
            </ModalHeader>
            <ModalContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-amber-600 dark:text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-amber-900 dark:text-amber-100">
                        Issue: {selectedRecord.issueType.replace(/_/g, " ")}
                      </p>
                      <p className="mt-1 text-amber-700 dark:text-amber-200">
                        This record needs your attention before it can be added
                        to the main records.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Index Number
                    </p>
                    <p className="mt-1 font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {selectedRecord.indexNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Current Name
                    </p>
                    <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                      {selectedRecord.name || (
                        <span className="italic text-neutral-400">
                          Not provided
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Assignment Count
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {selectedRecord.assignmentCount}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modal-name">Update Student Name</Label>
                  <Input
                    id="modal-name"
                    type="text"
                    placeholder="Enter student name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Provide the student's name to resolve this record.
                  </p>
                </div>
              </div>
            </ModalContent>
            <ModalFooter>
              <Button variant="outline" onClick={closeModal} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleResolve("edit")}
                loading={loading}
                disabled={loading}
              >
                <Edit className="h-4 w-4" />
                Update & Add
              </Button>
              <Button
                onClick={() => handleResolve("approve")}
                loading={loading}
                disabled={loading}
              >
                <Check className="h-4 w-4" />
                Approve As-Is
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
}
