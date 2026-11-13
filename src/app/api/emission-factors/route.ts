import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const factors = await db.emissionFactorConfig.findMany({
      orderBy: { factorKey: "asc" },
    });
    return NextResponse.json({ factors });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch emission factors" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth(["ADMIN", "FACILITY_MANAGER"]);
    const body = await request.json();
    const { id, value, assumptions, sourceDocumentation } = body;

    if (!id || typeof value !== "number" || value <= 0) {
      return NextResponse.json(
        { error: "Valid ID and positive numerical factor value are required" },
        { status: 400 }
      );
    }

    const updated = await db.emissionFactorConfig.update({
      where: { id },
      data: {
        value,
        assumptions: assumptions || undefined,
        sourceDocumentation: sourceDocumentation || undefined,
        updatedBy: session.email,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: "EMISSION_FACTOR_UPDATED",
        performedBy: session.email,
        details: `Updated factor ${updated.factorKey} to ${value} ${updated.unit}`,
      },
    });

    return NextResponse.json({ success: true, factor: updated });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update factor" }, { status: 500 });
  }
}
