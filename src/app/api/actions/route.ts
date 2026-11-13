import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const actions = await db.actionImprovement.findMany({
      orderBy: { reportedAt: "desc" },
      include: { targetBuilding: true },
    });
    return NextResponse.json({ actions });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch actions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth(["ADMIN", "FACILITY_MANAGER"]);
    const body = await request.json();

    const {
      title,
      detectedIssue,
      recommendedAction,
      assignedTeam,
      priority,
      targetBuildingId,
      beforeKwh,
      afterKwh,
      verificationMethod,
      notes,
    } = body;

    if (!title || !detectedIssue || !recommendedAction || !assignedTeam) {
      return NextResponse.json(
        { error: "Title, detected issue, recommended action, and assigned team are required." },
        { status: 400 }
      );
    }

    // Calculate verified kWh savings strictly if before and after are provided
    let verifiedKwhSavings: number | null = null;
    let completionStatus = "IDENTIFIED";

    if (typeof beforeKwh === "number" && typeof afterKwh === "number") {
      verifiedKwhSavings = Math.max(0, Number((beforeKwh - afterKwh).toFixed(1)));
      completionStatus = "COMPLETED_VERIFIED";
    }

    const action = await db.actionImprovement.create({
      data: {
        title,
        detectedIssue,
        recommendedAction,
        assignedTeam,
        priority: priority || "MEDIUM",
        targetBuildingId: targetBuildingId || null,
        beforeKwh: beforeKwh ? Number(beforeKwh) : null,
        afterKwh: afterKwh ? Number(afterKwh) : null,
        verifiedKwhSavings,
        completionStatus,
        verificationMethod,
        notes,
      },
    });

    await db.auditLog.create({
      data: {
        action: "ACTION_ITEM_CREATED",
        performedBy: session.email,
        details: `Created action: ${action.title} assigned to ${action.assignedTeam}`,
      },
    });

    return NextResponse.json({ success: true, action });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create action" }, { status: 500 });
  }
}
