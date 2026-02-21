"use client";

import { useState } from "react";
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  indexNumber: string;
  name: string | null;
  assignmentCount: number;
}

interface RecordsTableProps {
  students: Student[];
  userRole: string;
  currentPage: number;
  totalPages: number;
}

export function RecordsTable({ students, userRole, currentPage, totalPages }: RecordsTableProps) {
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState<{
    open: boolean;
    student: Student | null;
  }>({ open: false, student: null });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    student: Student | null;
  }>({ open: false, student: null });
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", indexNumber: "" });
  const router = useRouter();

  const isLecturer = userRole === "LECTURER";

  const filteredStudents = students.filter(
    (student) =>
      student.indexNumber.toLowerCase().includes(search.toLowerCase()) ||
      student.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEditClick = (student: Student) => {
    setEditForm({
      name: student.name || "",
      indexNumber: student.indexNumber,
    });
    setEditModal({ open: true, student });
  };

  const handleDeleteClick = (student: Student) => {
    setDeleteModal({ open: true, student });
  };

  const handleEditSubmit = async () => {
    if (!editModal.student) return;

    if (!editForm.name.trim() || !editForm.indexNumber.trim()) {
      toast.error("Name and index number are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/students/${editModal.student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update student");
      }

      toast.success("Student updated successfully");
      setEditModal({ open: false, student: null });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteModal.student) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/students/${deleteModal.student.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete student");
      }

      toast.success("Student deleted successfully");
      setDeleteModal({ open: false, student: null });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (students.length === 0) {
    return (
      <Card className="mt-6 p-12 text-center">
        <div className="mx-auto max-w-sm space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <svg
              className="h-6 w-6 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            No records yet
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Get started by adding assignments manually or uploading an Excel
            file.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search by index number or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          {filteredStudents.length} of {students.length} records
        </div>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Index Number</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="text-right">Assignment Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-neutral-500"
                >
                  No records found matching "{search}"
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono">
                    {student.indexNumber}
                  </TableCell>
                  <TableCell>
                    {student.name ?? (
                      <span className="text-neutral-400 dark:text-neutral-500">
                        No name
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex h-7 min-w-[2rem] items-center justify-center rounded-full bg-blue-100 px-2.5 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {student.assignmentCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(student)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      {isLecturer && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(student)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredStudents.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-neutral-500">
              No records found matching "{search}"
            </p>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Index Number
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {student.indexNumber}
                    </p>
                    <p className="mt-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Student Name
                    </p>
                    <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                      {student.name ?? (
                        <span className="italic text-neutral-400 dark:text-neutral-500">
                          No name
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Assignments
                    </p>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {student.assignmentCount}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(student)}
                    className="flex-1"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  {isLecturer && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(student)}
                      className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, student: null })}
      >
        <ModalHeader
          onClose={() => setEditModal({ open: false, student: null })}
        >
          Edit Student
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="edit-index"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Index Number
              </label>
              <Input
                id="edit-index"
                type="text"
                value={editForm.indexNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, indexNumber: e.target.value })
                }
                placeholder="e.g., 2023001"
                className="mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="edit-name"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Student Name
              </label>
              <Input
                id="edit-name"
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="e.g., John Doe"
                className="mt-1"
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setEditModal({ open: false, student: null })}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, student: null })}
      >
        <ModalHeader
          onClose={() => setDeleteModal({ open: false, student: null })}
        >
          Delete Student
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete this student record? This action
              cannot be undone.
            </p>
            <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Index Number:
                  </span>
                  <span className="font-mono text-neutral-900 dark:text-neutral-100">
                    {deleteModal.student?.indexNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Student Name:
                  </span>
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {deleteModal.student?.name || "No name"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Assignments:
                  </span>
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {deleteModal.student?.assignmentCount}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-400">
                Warning: All {deleteModal.student?.assignmentCount} assignment
                {deleteModal.student?.assignmentCount === 1 ? "" : "s"} will
                also be deleted.
              </p>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ open: false, student: null })}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSubmit}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete Student"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild={currentPage > 1}
              disabled={currentPage === 1}
            >
              {currentPage > 1 ? (
                <Link href={`/dashboard?page=${currentPage - 1}`}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Link>
              ) : (
                <span>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild={currentPage < totalPages}
              disabled={currentPage >= totalPages}
            >
              {currentPage < totalPages ? (
                <Link href={`/dashboard?page=${currentPage + 1}`}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <span>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
