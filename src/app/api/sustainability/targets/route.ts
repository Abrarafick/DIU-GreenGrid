import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const targets = await db.sustainabilityTarget.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ targets });
  } catch (error: any) {
    console.error("Fetch targets error:", error);
    return NextResponse.json({ error: "Failed to fetch sustainability targets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth(["ADMIN", "FACILITY_MANAGER"]);
    const body = await request.json();

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

    if (!title || !sdgCategory || !targetPeriod || baselineValue === undefined || targetValue === undefined || !unit) {
      return NextResponse.json(
        { error: "Missing required fields: title, sdgCategory, targetPeriod, baselineValue, targetValue, and unit are mandatory." },
        { status: 400 }
      );
    }

    const baseline = Number(baselineValue);
    const target = Number(targetValue);
    const current = currentValue !== undefined ? Number(currentValue) : baseline;
    const remainingGap = Number(Math.abs(target - current).toFixed(3));

    const newTarget = await db.sustainabilityTarget.create({
      data: {
        title,
        sdgCategory,
        targetPeriod,
        baselineValue: baseline,
        targetValue: target,
        currentValue: current,
        remainingGap,
        unit,
        status: status || "ON_TRACK",
        calculationMethod: calculationMethod || "Institutional metric comparison: |Target - Current|",
        targetYear: targetYear ? Number(targetYear) : 2026,
        responsibleUnit: responsibleUnit || "DIU Sustainability Committee & Facilities Division",
        notes: notes || null,
      },
    });

    await db.auditLog.create({
      data: {
        action: "SUSTAINABILITY_TARGET_CREATED",
        performedBy: session.email,
        details: `Created target: "${newTarget.title}" (${newTarget.sdgCategory}) targetValue: ${newTarget.targetValue} ${newTarget.unit}`,
      },
    });

    return NextResponse.json({ success: true, target: newTarget });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Create target error:", error);
    return NextResponse.json({ error: "Failed to create sustainability target" }, { status: 500 });
  }
}
