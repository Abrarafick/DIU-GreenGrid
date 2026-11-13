import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateDemandForecasts } from "@/lib/ai/forecasting";
import { generateSolarForecast } from "@/lib/ai/solar";
import { detectEnergyAnomalies } from "@/lib/ai/anomaly";
import { generateAiRecommendations } from "@/lib/ai/recommendations";
import { AiIntelligenceDashboard } from "@/components/ai/AiIntelligenceDashboard";

export const dynamic = "force-dynamic";

export default async function AiIntelligencePage() {
  const session = await getSession();

  const [buildings, energySources, metrics, dbRecs] = await Promise.all([
    db.building.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
    db.energySource.findMany({ orderBy: { code: "asc" } }),
    db.energyMetric.findMany({
      take: 300,
      orderBy: { timestamp: "asc" },
      include: {
        building: true,
        energySource: true,
        provenance: true,
      },
    }),
    db.aiRecommendation.findMany(),
  ]);

  // Initial computation
  const demandForecast = generateDemandForecasts(metrics, buildings);
  const solarForecast = generateSolarForecast(metrics);
  const anomalyResult = detectEnergyAnomalies(metrics, buildings, energySources);
  const recommendationResult = generateAiRecommendations(
    anomalyResult.anomalies,
    metrics,
    buildings
  );

  // Merge status with database records
  const dbRecMap = new Map(dbRecs.map((r) => [r.id, r]));
  const mergedRecs = recommendationResult.recommendations.map((r) => {
    const match = dbRecMap.get(r.id);
    if (match) {
      return {
        ...r,
        status: match.status as any,
        linkedActionId: match.linkedActionId || undefined,
      };
    }
    return r;
  });

  const initialForecasts = {
    category: demandForecast.category,
    categoryLabel: demandForecast.categoryLabel,
    isSimulated: demandForecast.isSimulated,
    modelVersion: demandForecast.modelVersion,
    dataSufficiencyNotice: demandForecast.dataSufficiencyNotice,
    generatedAt: demandForecast.generatedAt,
    demand: {
      campusHourly24h: demandForecast.campusHourly24h,
      campusDaily7d: demandForecast.campusDaily7d,
      buildingForecasts: demandForecast.buildingForecasts,
      overallConfidencePercent: demandForecast.overallConfidencePercent,
    },
    solar: solarForecast,
  };

  const initialAnomalies = {
    category: anomalyResult.category,
    categoryLabel: anomalyResult.categoryLabel,
    isSimulated: anomalyResult.isSimulated,
    totalAnomaliesCount: anomalyResult.totalAnomaliesCount,
    severityCounts: {
      critical: anomalyResult.criticalCount,
      high: anomalyResult.highCount,
      medium: anomalyResult.mediumCount,
      low: anomalyResult.lowCount,
    },
    anomalies: anomalyResult.anomalies,
    buildingIntelligence: anomalyResult.buildingIntelligence,
  };

  const initialRecommendations = {
    category: recommendationResult.category,
    categoryLabel: recommendationResult.categoryLabel,
    isSimulated: recommendationResult.isSimulated,
    totalRecommendations: mergedRecs.length,
    priorityCounts: {
      critical: recommendationResult.criticalCount,
      high: recommendationResult.highCount,
      medium: recommendationResult.mediumCount,
      low: recommendationResult.lowCount,
    },
    totalEstimatedWeeklySavingsKwh: recommendationResult.totalEstimatedWeeklySavingsKwh,
    recommendations: mergedRecs,
  };

  return (
    <AiIntelligenceDashboard
      initialForecasts={initialForecasts}
      initialAnomalies={initialAnomalies}
      initialRecommendations={initialRecommendations}
      buildings={buildings}
      user={session}
    />
  );
}
