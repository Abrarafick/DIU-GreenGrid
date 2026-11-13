import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(["ADMIN", "FACILITY_MANAGER"]);
    const { id } = await params;
    const body = await request.json();

    const existing = await db.sustainabilityTarget.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    const {
      title,
      sdgCategory,
      targetPeriod,
      baselineValue,
      targetValue,
      currentValue,
      unit,
      status,
      calculationMethod,
      targetYear,
      responsibleUnit,
      notes,
    } = body;

    const targetVal = targetValue !== undefined ? Number(targetValue) : existing.targetValue;
    const currentVal = currentValue !== undefined ? Number(currentValue) : existing.currentValue;
    const remainingGap = Number(Math.abs(targetVal - currentVal).toFixed(3));

    const updated = await db.sustainabilityTarget.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        sdgCategory: sdgCategory !== undefined ? sdgCategory : existing.sdgCategory,
        targetPeriod: targetPeriod !== undefined ? targetPeriod : existing.targetPeriod,
        baselineValue: baselineValue !== undefined ? Number(baselineValue) : existing.baselineValue,
        targetValue: targetVal,
        currentValue: currentVal,
        remainingGap,
        unit: unit !== undefined ? unit : existing.unit,
        status: status !== undefined ? status : existing.status,
        calculationMethod: calculationMethod !== undefined ? calculationMethod : existing.calculationMethod,
        targetYear: targetYear !== undefined ? Number(targetYear) : existing.targetYear,
        responsibleUnit: responsibleUnit !== undefined ? responsibleUnit : existing.responsibleUnit,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    await db.auditLog.create({
      data: {
        action: "SUSTAINABILITY_TARGET_UPDATED",
        performedBy: session.email,
        details: `Updated target "${updated.title}" - progress: ${updated.currentValue}/${updated.targetValue} ${updated.unit}, gap: ${updated.remainingGap}`,
      },
    });

    return NextResponse.json({ success: true, target: updated });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Update target error:", error);
    return NextResponse.json({ error: "Failed to update sustainability target" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const { id } = await params;

    const target = await db.sustainabilityTarget.findUnique({
      where: { id },
    });

    if (!target) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    await db.sustainabilityTarget.delete({
      where: { id },
    });

    await db.auditLog.create({
      data: {
        action: "SUSTAINABILITY_TARGET_DELETED",
        performedBy: session.email,
        details: `Deleted target: "${target.title}" (${target.sdgCategory})`,
      },
    });

    return NextResponse.json({ success: true, message: "Target deleted successfully" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Delete target error:", error);
    return NextResponse.json({ error: "Failed to delete target" }, { status: 500 });
  }
}
