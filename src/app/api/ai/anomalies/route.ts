import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { detectEnergyAnomalies } from "@/lib/ai/anomaly";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const severityFilter = searchParams.get("severity") || undefined;
    const buildingFilter = searchParams.get("buildingId") || undefined;

    // Fetch buildings, energy sources, and metrics
    const [buildings, energySources, metrics] = await Promise.all([
      db.building.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
      db.energySource.findMany({ orderBy: { code: "asc" } }),
      db.energyMetric.findMany({
        take: 300,
        orderBy: { timestamp: "asc" },
        include: { building: true, energySource: true, provenance: true },
      }),
    ]);

    const result = detectEnergyAnomalies(metrics, buildings, energySources);

    // Apply optional filters
    let filteredAnomalies = result.anomalies;
    if (severityFilter && severityFilter !== "ALL") {
      filteredAnomalies = filteredAnomalies.filter((a) => a.severity === severityFilter);
    }
    if (buildingFilter && buildingFilter !== "ALL") {
      filteredAnomalies = filteredAnomalies.filter(
        (a) => a.buildingId === buildingFilter || a.buildingCode === buildingFilter
      );
    }

    // Persist top anomalies to database audit table if not already populated
    try {
      const existingCount = await db.energyAnomaly.count();
      if (existingCount === 0 && result.anomalies.length > 0) {
        for (const anom of result.anomalies.slice(0, 10)) {
          await db.energyAnomaly.create({
            data: {
              timestamp: new Date(anom.timestamp),
              buildingId: anom.buildingId,
              buildingCode: anom.buildingCode,
              anomalyType: anom.anomalyType,
              severity: anom.severity,
              observedValue: anom.observedValue,
              expectedBaseline: anom.expectedBaseline,
              deviationPercent: anom.deviationPercent,
              zScore: anom.zScore,
              supportingEvidence: anom.supportingEvidence,
              detectedRootCause: anom.detectedRootCause,
              suggestedAction: anom.suggestedAction,
              category: anom.category,
              isResolved: false,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Could not cache anomalies to database:", dbErr);
    }

    return NextResponse.json({
      success: true,
      category: result.category,
      categoryLabel: result.categoryLabel,
      isSimulated: result.isSimulated,
      totalAnomaliesCount: filteredAnomalies.length,
      severityCounts: {
        critical: result.criticalCount,
        high: result.highCount,
        medium: result.mediumCount,
        low: result.lowCount,
      },
      anomalies: filteredAnomalies,
      buildingIntelligence: result.buildingIntelligence,
    });
  } catch (error: any) {
    console.error("AI Anomalies API error:", error);
    return NextResponse.json(
      { error: "Failed to detect energy anomalies" },
      { status: 500 }
    );
  }
}
