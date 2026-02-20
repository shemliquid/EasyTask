import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lookupRateLimiter } from "@/lib/rate-limit";

// POST - Public endpoint to look up student by index number using token
export async function POST(req: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Rate limit: 10 requests per minute per IP
    const rateLimitResult = lookupRateLimiter.check(10, ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { token, indexNumber } = body;

    // Validate input
    if (!token || !indexNumber) {
      return NextResponse.json(
        { error: "Token and index number are required" },
        { status: 400 }
      );
    }

    // Find and validate the lookup link
    const link = await prisma.lookupLink.findUnique({
      where: { token },
    });

    // Generic error message to prevent enumeration
    const genericError = "Invalid or expired lookup link";

    if (!link) {
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    // Check if link is active
    if (!link.active) {
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    // Check if link has expired
    const now = new Date();
    if (link.expiresAt < now) {
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    // Link is valid, look up the student
    const student = await prisma.student.findUnique({
      where: { indexNumber },
      select: {
        indexNumber: true,
        name: true,
        assignmentCount: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "No record found for this index number" },
        { status: 404 }
      );
    }

    // Return student data
    return NextResponse.json({
      indexNumber: student.indexNumber,
      name: student.name,
      assignmentCount: student.assignmentCount,
    });
  } catch (e) {
    console.error("Lookup error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
