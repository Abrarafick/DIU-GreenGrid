import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { detectEnergyAnomalies } from "@/lib/ai/anomaly";
import { generateAiRecommendations } from "@/lib/ai/recommendations";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const priorityFilter = searchParams.get("priority") || undefined;

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

    const anomalyResult = detectEnergyAnomalies(metrics, buildings, energySources);
    const recommendationResult = generateAiRecommendations(
      anomalyResult.anomalies,
      metrics,
      buildings
    );

    // Check database for any recommendations converted to ActionImprovement
    const dbRecs = await db.aiRecommendation.findMany();
    const dbRecStatusMap = new Map(dbRecs.map((r) => [r.id, r]));

    const mergedRecommendations = recommendationResult.recommendations.map((r) => {
      const match = dbRecStatusMap.get(r.id);
      if (match) {
        return {
          ...r,
          status: match.status as any,
          linkedActionId: match.linkedActionId || undefined,
        };
      }
      return r;
    });

    let filtered = mergedRecommendations;
    if (priorityFilter && priorityFilter !== "ALL") {
      filtered = filtered.filter((r) => r.priority === priorityFilter);
    }

    return NextResponse.json({
      success: true,
      category: recommendationResult.category,
      categoryLabel: recommendationResult.categoryLabel,
      isSimulated: recommendationResult.isSimulated,
      totalRecommendations: filtered.length,
      priorityCounts: {
        critical: recommendationResult.criticalCount,
        high: recommendationResult.highCount,
        medium: recommendationResult.mediumCount,
        low: recommendationResult.lowCount,
      },
      totalEstimatedWeeklySavingsKwh: recommendationResult.totalEstimatedWeeklySavingsKwh,
      recommendations: filtered,
    });
  } catch (error: any) {
    console.error("AI Recommendations API error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI recommendations" },
      { status: 500 }
    );
  }
}
