import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const action = await db.actionImprovement.findUnique({
      where: { id },
      include: { targetBuilding: true },
    });

    if (!action) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 });
    }

    return NextResponse.json({ action });
  } catch (error: any) {
    console.error("Get action error:", error);
    return NextResponse.json({ error: "Failed to fetch action" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(["ADMIN", "FACILITY_MANAGER"]);
    const { id } = await params;
    const body = await request.json();

    const existing = await db.actionImprovement.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 });
    }

    const {
      title,
      detectedIssue,
      recommendedAction,
      assignedTeam,
      assignedPersonnel,
      deadline,
      completionStatus,
      priority,
      targetBuildingId,
      beforeKwh,
      afterKwh,
      measurementPeriodDays,
      verificationMethod,
      supportingEvidence,
      completionNotes,
      sdgAlignment,
      notes,
    } = body;

    const newStatus = completionStatus || existing.completionStatus;
    const finalBefore = beforeKwh !== undefined ? (beforeKwh !== null && beforeKwh !== "" ? Number(beforeKwh) : null) : existing.beforeKwh;
    const finalAfter = afterKwh !== undefined ? (afterKwh !== null && afterKwh !== "" ? Number(afterKwh) : null) : existing.afterKwh;

    let verifiedKwhSavings = existing.verifiedKwhSavings;
    let verifiedCarbonSavingsKg = existing.verifiedCarbonSavingsKg;
    let verifiedBy = existing.verifiedBy;
    let verifiedAt = existing.verifiedAt;
    let completedAt = existing.completedAt;

    if (newStatus === "COMPLETED" && !completedAt) {
      completedAt = new Date();
    }

    if (newStatus === "VERIFIED" || newStatus === "COMPLETED_VERIFIED") {
      if (finalBefore !== null && finalAfter !== null) {
        verifiedKwhSavings = Math.max(0, Number((finalBefore - finalAfter).toFixed(1)));
        verifiedCarbonSavingsKg = Number((verifiedKwhSavings * 0.637).toFixed(1));
      } else {
        verifiedKwhSavings = existing.verifiedKwhSavings || 0;
        verifiedCarbonSavingsKg = existing.verifiedCarbonSavingsKg || 0;
      }
      verifiedBy = session.email;
      verifiedAt = new Date();
      if (!completedAt) completedAt = new Date();
    }

    const updated = await db.actionImprovement.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        detectedIssue: detectedIssue !== undefined ? detectedIssue : existing.detectedIssue,
        recommendedAction: recommendedAction !== undefined ? recommendedAction : existing.recommendedAction,
        assignedTeam: assignedTeam !== undefined ? assignedTeam : existing.assignedTeam,
        assignedPersonnel: assignedPersonnel !== undefined ? assignedPersonnel : existing.assignedPersonnel,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : existing.deadline,
        completionStatus: newStatus,
        priority: priority !== undefined ? priority : existing.priority,
        targetBuildingId: targetBuildingId !== undefined ? targetBuildingId : existing.targetBuildingId,
        beforeKwh: finalBefore,
        afterKwh: finalAfter,
        verifiedKwhSavings,
        verifiedCarbonSavingsKg,
        measurementPeriodDays: measurementPeriodDays !== undefined ? Number(measurementPeriodDays) : existing.measurementPeriodDays,
        verificationMethod: verificationMethod !== undefined ? verificationMethod : existing.verificationMethod,
        supportingEvidence: supportingEvidence !== undefined ? supportingEvidence : existing.supportingEvidence,
        completionNotes: completionNotes !== undefined ? completionNotes : existing.completionNotes,
        sdgAlignment: sdgAlignment !== undefined ? sdgAlignment : existing.sdgAlignment,
        notes: notes !== undefined ? notes : existing.notes,
        verifiedBy,
        verifiedAt,
        completedAt,
      },
    });

    await db.auditLog.create({
      data: {
        action: newStatus === "VERIFIED" ? "ACTION_SAVINGS_VERIFIED" : "ACTION_STATUS_CHANGED",
        performedBy: session.email,
        details: `Updated action "${updated.title}" -> Status: ${updated.completionStatus}, Savings: ${updated.verifiedKwhSavings || 0} kWh (${updated.verifiedCarbonSavingsKg || 0} kg CO2e)`,
      },
    });

    return NextResponse.json({ success: true, action: updated });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Update action error:", error);
    return NextResponse.json({ error: "Failed to update action" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const { id } = await params;

    const action = await db.actionImprovement.findUnique({
      where: { id },
    });

    if (!action) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 });
    }

    await db.actionImprovement.delete({
      where: { id },
    });

    await db.auditLog.create({
      data: {
        action: "ACTION_ITEM_DELETED",
        performedBy: session.email,
        details: `Deleted action: "${action.title}"`,
      },
    });

    return NextResponse.json({ success: true, message: "Action deleted successfully" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Delete action error:", error);
    return NextResponse.json({ error: "Failed to delete action" }, { status: 500 });
  }
}
