import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Toggle active status of a lookup link
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only lecturers can modify lookup links
    if (session.user.role !== "LECTURER") {
      return NextResponse.json(
        { error: "Only lecturers can modify lookup links" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { active } = body;

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request. 'active' must be a boolean" },
        { status: 400 }
      );
    }

    // Verify the link exists and belongs to the current lecturer
    const existingLink = await prisma.lookupLink.findUnique({
      where: { id },
    });

    if (!existingLink) {
      return NextResponse.json(
        { error: "Lookup link not found" },
        { status: 404 }
      );
    }

    if (existingLink.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: "You can only modify your own lookup links" },
        { status: 403 }
      );
    }

    // Update the link
    const updatedLink = await prisma.lookupLink.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json(updatedLink);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Permanently delete a lookup link
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only lecturers can delete lookup links
    if (session.user.role !== "LECTURER") {
      return NextResponse.json(
        { error: "Only lecturers can delete lookup links" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify the link exists and belongs to the current lecturer
    const existingLink = await prisma.lookupLink.findUnique({
      where: { id },
    });

    if (!existingLink) {
      return NextResponse.json(
        { error: "Lookup link not found" },
        { status: 404 }
      );
    }

    if (existingLink.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own lookup links" },
        { status: 403 }
      );
    }

    // Delete the link
    await prisma.lookupLink.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Lookup link deleted successfully" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
