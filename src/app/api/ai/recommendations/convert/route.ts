import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Only ADMIN and FACILITY_MANAGER can dispatch action items
    if (session.role === "AUDITOR_VIEWER") {
      return NextResponse.json(
        { error: "Forbidden: Auditor / Viewer role cannot create operational action items" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      recommendationId,
      title,
      detectedIssue,
      suggestedAction,
      assignedUnit,
      priority,
      targetBuildingCode,
      estimatedWeeklyKwhSavings,
    } = body;

    if (!recommendationId || !title || !detectedIssue || !suggestedAction) {
      return NextResponse.json(
        { error: "Missing required recommendation fields for action creation" },
        { status: 400 }
      );
    }

    // Match building if specified
    let targetBuildingId: string | undefined;
    if (targetBuildingCode && targetBuildingCode !== "ALL_CAMPUS") {
      const building = await db.building.findFirst({
        where: { code: targetBuildingCode },
      });
      if (building) targetBuildingId = building.id;
    }

    // 1. Create ActionImprovement record in database
    const actionItem = await db.actionImprovement.create({
      data: {
        title,
        detectedIssue,
        recommendedAction: suggestedAction,
        assignedTeam: assignedUnit || "Campus Facilities Operations",
        priority: priority || "MEDIUM",
        completionStatus: "IDENTIFIED",
        targetBuildingId,
        notes: `Automatically generated and dispatched from AI Recommendation [${recommendationId}]. Estimated technical savings: ${estimatedWeeklyKwhSavings || 0} kWh/week.`,
        verificationMethod: "Before-and-after sub-metering trend verification",
      },
    });

    // 2. Persist / update AiRecommendation record state
    await db.aiRecommendation.upsert({
      where: { id: recommendationId },
      create: {
        id: recommendationId,
        title,
        detectedIssue,
        supportingEvidence: "Dispatched from AI Anomaly engine",
        reasoning: "Engineering optimization recommendation",
        suggestedAction,
        priority: priority || "MEDIUM",
        estimatedKwhSavingsWeekly: estimatedWeeklyKwhSavings || 0,
        outcomeDescription: `Estimated ~${estimatedWeeklyKwhSavings || 0} kWh/week reduction upon verification`,
        category: "SIMULATED_DEMONSTRATION",
        targetBuildingCode,
        targetBuildingId,
        status: "CONVERTED_TO_ACTION",
        linkedActionId: actionItem.id,
      },
      update: {
        status: "CONVERTED_TO_ACTION",
        linkedActionId: actionItem.id,
      },
    });

    // 3. Log audit event
    await db.auditLog.create({
      data: {
        action: "AI_RECOMMENDATION_DISPATCHED",
        performedBy: session.email,
        details: `Dispatched AI Recommendation '${title}' to Action Item [${actionItem.id}] assigned to '${assignedUnit}'.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "AI Recommendation successfully converted to operational Action Item",
      actionItem,
    });
  } catch (error: any) {
    console.error("Convert AI recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to convert AI recommendation into action item" },
      { status: 500 }
    );
  }
}
