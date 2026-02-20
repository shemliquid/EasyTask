import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

// GET - Fetch all lookup links created by current lecturer
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only lecturers can manage lookup links
    if (session.user.role !== "LECTURER") {
      return NextResponse.json(
        { error: "Only lecturers can manage lookup links" },
        { status: 403 }
      );
    }

    const links = await prisma.lookupLink.findMany({
      where: {
        createdBy: session.user.id,
      },
      orderBy: [
        { active: "desc" }, // Active links first
        { createdAt: "desc" }, // Then by most recent
      ],
    });

    // Add status to each link
    const now = new Date();
    const linksWithStatus = links.map((link) => ({
      ...link,
      isExpired: link.expiresAt < now,
      status: link.expiresAt < now ? "expired" : link.active ? "active" : "inactive",
    }));

    return NextResponse.json(linksWithStatus);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Generate new lookup link
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only lecturers can create lookup links
    if (session.user.role !== "LECTURER") {
      return NextResponse.json(
        { error: "Only lecturers can create lookup links" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { durationHours } = body;

    // Validate duration
    const validDurations = [1, 3, 6, 12, 24, 48];
    if (!durationHours || !validDurations.includes(durationHours)) {
      return NextResponse.json(
        { error: "Invalid duration. Must be 1, 3, 6, 12, 24, or 48 hours" },
        { status: 400 }
      );
    }

    // Generate cryptographically secure token
    const token = nanoid(32);

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    // Create the lookup link
    const link = await prisma.lookupLink.create({
      data: {
        token,
        createdBy: session.user.id,
        expiresAt,
      },
    });

    return NextResponse.json({
      ...link,
      url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/lookup/${token}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
