import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const buildingId = url.searchParams.get("buildingId");
    const sdg = url.searchParams.get("sdg");

    const where: any = {};
    if (status && status !== "ALL") {
      where.completionStatus = status;
    }
    if (priority && priority !== "ALL") {
      where.priority = priority;
    }
    if (buildingId && buildingId !== "ALL") {
      where.targetBuildingId = buildingId;
    }
    if (sdg && sdg !== "ALL") {
      where.sdgAlignment = sdg;
    }

    const actions = await db.actionImprovement.findMany({
      where,
      orderBy: { reportedAt: "desc" },
      include: { targetBuilding: true },
    });

    const totalVerifiedKwh = actions.reduce((sum, a) => sum + (a.verifiedKwhSavings || 0), 0);
    const totalVerifiedCarbon = Number((totalVerifiedKwh * 0.637).toFixed(1));

    return NextResponse.json({
      actions,
      summary: {
        totalActions: actions.length,
        verifiedCount: actions.filter((a) => a.completionStatus === "VERIFIED" || a.completionStatus === "COMPLETED_VERIFIED").length,
        totalVerifiedKwhSavings: totalVerifiedKwh,
        totalVerifiedCarbonSavingsKg: totalVerifiedCarbon,
      },
    });
  } catch (error: any) {
    console.error("Fetch actions error:", error);
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
      assignedPersonnel,
      deadline,
      priority,
      targetBuildingId,
      beforeKwh,
      afterKwh,
      measurementPeriodDays,
      verificationMethod,
      supportingEvidence,
      completionNotes,
      sdgAlignment,
      completionStatus: requestedStatus,
      notes,
    } = body;

    if (!title || !detectedIssue || !recommendedAction || !assignedTeam) {
      return NextResponse.json(
        { error: "Title, detected issue, recommended action, and assigned team are required." },
        { status: 400 }
      );
    }

    let verifiedKwhSavings: number | null = null;
    let verifiedCarbonSavingsKg: number | null = null;
    let completionStatus = requestedStatus || "IDENTIFIED";
    let verifiedBy: string | null = null;
    let verifiedAt: Date | null = null;

    if (
      (completionStatus === "VERIFIED" || completionStatus === "COMPLETED_VERIFIED") &&
      typeof beforeKwh === "number" &&
      typeof afterKwh === "number"
    ) {
      verifiedKwhSavings = Math.max(0, Number((beforeKwh - afterKwh).toFixed(1)));
      verifiedCarbonSavingsKg = Number((verifiedKwhSavings * 0.637).toFixed(1));
      verifiedBy = session.email;
      verifiedAt = new Date();
    }

    const action = await db.actionImprovement.create({
      data: {
        title,
        detectedIssue,
        recommendedAction,
        assignedTeam,
        assignedPersonnel: assignedPersonnel || null,
        deadline: deadline ? new Date(deadline) : null,
        priority: priority || "MEDIUM",
        targetBuildingId: targetBuildingId || null,
        beforeKwh: beforeKwh !== undefined && beforeKwh !== null && beforeKwh !== "" ? Number(beforeKwh) : null,
        afterKwh: afterKwh !== undefined && afterKwh !== null && afterKwh !== "" ? Number(afterKwh) : null,
        measurementPeriodDays: measurementPeriodDays ? Number(measurementPeriodDays) : 30,
        verifiedKwhSavings,
        verifiedCarbonSavingsKg,
        completionStatus,
        verificationMethod: verificationMethod || null,
        verifiedBy,
        verifiedAt,
        supportingEvidence: supportingEvidence || null,
        completionNotes: completionNotes || null,
        sdgAlignment: sdgAlignment || "SDG_7",
        notes: notes || null,
      },
    });

    await db.auditLog.create({
      data: {
        action: "ACTION_ITEM_CREATED",
        performedBy: session.email,
        details: `Created action: "${action.title}" assigned to ${action.assignedTeam} (Status: ${action.completionStatus})`,
      },
    });

    return NextResponse.json({ success: true, action });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Create action error:", error);
    return NextResponse.json({ error: "Failed to create action" }, { status: 500 });
  }
}
