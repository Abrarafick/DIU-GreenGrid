import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeSdgAnalytics } from "@/lib/sustainability/sdg";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [metrics, buildings, targets, actions] = await Promise.all([
      db.energyMetric.findMany({ orderBy: { timestamp: "asc" } }),
      db.building.findMany(),
      db.sustainabilityTarget.findMany({ orderBy: { createdAt: "asc" } }),
      db.actionImprovement.findMany({ include: { targetBuilding: true } }),
    ]);

    const sdgSummaries = computeSdgAnalytics(metrics, buildings, targets, actions);

    return NextResponse.json({
      success: true,
      sdgs: sdgSummaries,
      institutionalTargets: targets,
    });
  } catch (error: any) {
    console.error("SDGs fetch error:", error);
    return NextResponse.json({ error: "Failed to compute SDG analytics" }, { status: 500 });
  }
}
