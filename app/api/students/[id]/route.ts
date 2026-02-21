import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Edit student (Both TA and LECTURER can edit)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, indexNumber } = body;

    if (!name || !indexNumber) {
      return NextResponse.json(
        { error: "Name and index number are required" },
        { status: 400 },
      );
    }

    // Use transaction to prevent race conditions
    const updatedStudent = await prisma.$transaction(async (tx) => {
      // Check if the student exists
      const existingStudent = await tx.student.findUnique({
        where: { id },
      });

      if (!existingStudent) {
        throw new Error("Student not found");
      }

      // Check if the new index number is already taken by another student
      if (indexNumber !== existingStudent.indexNumber) {
        const duplicateStudent = await tx.student.findFirst({
          where: {
            indexNumber,
            id: { not: id },
          },
        });

        if (duplicateStudent) {
          throw new Error("Index number already exists");
        }
      }

      // Update the student
      return await tx.student.update({
        where: { id },
        data: {
          name,
          indexNumber,
        },
      });
    });

    return NextResponse.json(updatedStudent);
  } catch (e: any) {
    console.error(e);
    if (e.message === "Student not found") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    if (e.message === "Index number already exists") {
      return NextResponse.json(
        { error: "Index number already exists" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Delete student (Only LECTURER can delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Only LECTURER can delete
    if (session.user.role !== "LECTURER") {
      return NextResponse.json(
        { error: "Only lecturers can delete records" },
        { status: 403 },
      );
    }

    // Check if the student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Delete the student
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
