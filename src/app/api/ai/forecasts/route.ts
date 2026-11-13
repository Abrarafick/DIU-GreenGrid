import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateDemandForecasts } from "@/lib/ai/forecasting";
import { generateSolarForecast } from "@/lib/ai/solar";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get("buildingId") || undefined;

    // Fetch buildings and recent metrics
    const [buildings, metrics] = await Promise.all([
      db.building.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
      db.energyMetric.findMany({
        take: 300,
        orderBy: { timestamp: "asc" },
        include: { building: true, energySource: true, provenance: true },
      }),
    ]);

    // Generate forecasts
    const demandForecast = generateDemandForecasts(metrics, buildings);
    const solarForecast = generateSolarForecast(metrics);

    // Filter building forecast if specific building is requested
    let filteredBuildingForecasts = demandForecast.buildingForecasts;
    if (buildingId && buildingId !== "ALL") {
      filteredBuildingForecasts = demandForecast.buildingForecasts.filter(
        (b) => b.buildingId === buildingId || b.buildingCode === buildingId
      );
    }

    return NextResponse.json({
      success: true,
      category: demandForecast.category,
      categoryLabel: demandForecast.categoryLabel,
      isSimulated: demandForecast.isSimulated,
      modelVersion: demandForecast.modelVersion,
      dataSufficiencyNotice: demandForecast.dataSufficiencyNotice,
      generatedAt: demandForecast.generatedAt,
      demand: {
        campusHourly24h: demandForecast.campusHourly24h,
        campusDaily7d: demandForecast.campusDaily7d,
        buildingForecasts: filteredBuildingForecasts,
        overallConfidencePercent: demandForecast.overallConfidencePercent,
      },
      solar: solarForecast,
    });
  } catch (error: any) {
    console.error("AI Forecast API error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI forecasts" },
      { status: 500 }
    );
  }
}
