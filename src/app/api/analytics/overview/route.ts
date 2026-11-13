import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "7d"; // "24h", "7d", "30d", "all"
    const buildingId = searchParams.get("buildingId") || undefined;
    const sourceId = searchParams.get("sourceId") || undefined;

    // 1. Calculate time filter
    const now = new Date();
    let startDate: Date | undefined;

    if (timeRange === "24h") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeRange === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const where: any = {};
    if (startDate) {
      where.timestamp = { gte: startDate };
    }
    if (buildingId && buildingId !== "ALL") {
      where.buildingId = buildingId;
    }
    if (sourceId && sourceId !== "ALL") {
      where.energySourceId = sourceId;
    }

    // 2. Fetch data in parallel
    const [buildings, energySources, metrics] = await Promise.all([
      db.building.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
      db.energySource.findMany({ orderBy: { code: "asc" } }),
      db.energyMetric.findMany({
        where,
        orderBy: { timestamp: "asc" },
        include: {
          building: true,
          energySource: true,
          provenance: true,
        },
      }),
    ]);

    // 3. Central KPI Rollups
    let totalCampusConsumptionKwh = 0;
    let solarGenerationKwh = 0;
    let biogasGenerationKwh = 0;
    let dieselGenerationKwh = 0;
    let dieselLitresConsumed = 0;
    let carbonEmittedKg = 0;
    let carbonAvoidedKg = 0;
    let simulatedCount = 0;
    let latestDemandKw = 0;

    const provenanceMap: Record<string, number> = {
      REAL_API: 0,
      CSV_IMPORT: 0,
      MANUAL_ENTRY: 0,
      SIMULATED_DEMO: 0,
    };

    metrics.forEach((m) => {
      totalCampusConsumptionKwh += m.kwhConsumed;
      solarGenerationKwh += m.solarKwhGenerated;
      biogasGenerationKwh += m.biogasKwhGenerated;
      dieselGenerationKwh += m.generatorKwhGenerated;
      dieselLitresConsumed += m.dieselLitres;
      carbonEmittedKg += m.carbonKgEmitted;
      carbonAvoidedKg += m.carbonKgAvoided;

      if (m.peakDemandKw && m.peakDemandKw > latestDemandKw) {
        latestDemandKw = m.peakDemandKw;
      }

      if (m.isSimulated) {
        simulatedCount++;
        provenanceMap.SIMULATED_DEMO++;
      } else if (m.provenance?.ingestionMethod === "API_CONNECTOR") {
        provenanceMap.REAL_API++;
      } else if (m.provenance?.ingestionMethod === "CSV_EXCEL_IMPORT") {
        provenanceMap.CSV_IMPORT++;
      } else if (m.provenance?.ingestionMethod === "MANUAL_ENTRY") {
        provenanceMap.MANUAL_ENTRY++;
      } else {
        provenanceMap.SIMULATED_DEMO++;
      }
    });

    const totalRenewableKwh = solarGenerationKwh + biogasGenerationKwh;
    const renewableSharePercent =
      totalCampusConsumptionKwh > 0
        ? Math.min(100, Number(((totalRenewableKwh / totalCampusConsumptionKwh) * 100).toFixed(1)))
        : 0;

    // Grid import is the balance drawn from utility after solar self-consumption
    const gridImportKwh = Math.max(
      0,
      Number((totalCampusConsumptionKwh - totalRenewableKwh - dieselGenerationKwh).toFixed(1))
    );
    const gridDependencyPercent =
      totalCampusConsumptionKwh > 0
        ? Math.min(100, Number(((gridImportKwh / totalCampusConsumptionKwh) * 100).toFixed(1)))
        : 0;

    // 4. Building-wise Analytics & Ranking
    const buildingMap: Record<string, {
      id: string;
      code: string;
      name: string;
      primaryFunction: string;
      totalFloorAreaSqM: number;
      occupancyCapacity: number;
      baselineDailyKwh: number;
      totalConsumptionKwh: number;
      peakUsageKwh: number;
      offPeakUsageKwh: number;
    }> = {};

    buildings.forEach((b) => {
      buildingMap[b.id] = {
        id: b.id,
        code: b.code,
        name: b.name,
        primaryFunction: b.primaryFunction,
        totalFloorAreaSqM: b.totalFloorAreaSqM,
        occupancyCapacity: b.occupancyCapacity,
        baselineDailyKwh: b.baselineDailyKwh,
        totalConsumptionKwh: 0,
        peakUsageKwh: 0,
        offPeakUsageKwh: 0,
      };
    });

    metrics.forEach((m) => {
      if (m.buildingId && buildingMap[m.buildingId]) {
        const b = buildingMap[m.buildingId];
        b.totalConsumptionKwh += m.kwhConsumed;

        // Classify Peak (08:00 to 17:00 weekdays) vs Off-Peak
        const date = new Date(m.timestamp);
        const hour = date.getHours();
        const day = date.getDay(); // 0: Sun, 5: Fri, 6: Sat
        const isWeekend = day === 5 || day === 6; // Bangladesh weekend

        if (!isWeekend && hour >= 8 && hour < 18) {
          b.peakUsageKwh += m.kwhConsumed;
        } else {
          b.offPeakUsageKwh += m.kwhConsumed;
        }
      }
    });

    const buildingRankings = Object.values(buildingMap)
      .map((b) => {
        const total = Number(b.totalConsumptionKwh.toFixed(1));
        const pct =
          totalCampusConsumptionKwh > 0
            ? Number(((total / totalCampusConsumptionKwh) * 100).toFixed(1))
            : 0;
        const eui = Number((total / b.totalFloorAreaSqM).toFixed(3));
        const peakPct = total > 0 ? Number(((b.peakUsageKwh / total) * 100).toFixed(1)) : 0;
        return {
          ...b,
          totalConsumptionKwh: total,
          percentageOfTotal: pct,
          euiKwhPerSqm: eui,
          peakUsageKwh: Number(b.peakUsageKwh.toFixed(1)),
          offPeakUsageKwh: Number(b.offPeakUsageKwh.toFixed(1)),
          peakFractionPercent: peakPct,
          isHighConsumer: false, // will mark top consumers
        };
      })
      .sort((a, b) => b.totalConsumptionKwh - a.totalConsumptionKwh);

    // Flag high consumers (top 2 or > 25% share)
    buildingRankings.forEach((b, idx) => {
      if (idx === 0 || b.percentageOfTotal > 25.0) {
        b.isHighConsumer = true;
      }
    });

    // 5. Time-Series Trends for Charts (Grouped by time slot)
    const timeSlotsMap: Map<string, {
      timestamp: Date;
      label: string;
      consumptionKwh: number;
      solarKwh: number;
      dieselKwh: number;
      biogasKwh: number;
      gridKwh: number;
      renewableKwh: number;
    }> = new Map();

    metrics.forEach((m) => {
      const d = new Date(m.timestamp);
      // Grouping key: for 24h, group by hour; for 7d/30d, group by 4h block or day
      const key =
        timeRange === "24h"
          ? `${d.toISOString().slice(0, 13)}:00`
          : timeRange === "7d"
          ? `${d.toISOString().slice(0, 10)} ${String(Math.floor(d.getHours() / 4) * 4).padStart(2, "0")}:00`
          : d.toISOString().slice(0, 10);

      let slot = timeSlotsMap.get(key);
      if (!slot) {
        const displayLabel =
          timeRange === "24h"
            ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : timeRange === "7d"
            ? `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${d.getHours()}:00`
            : d.toLocaleDateString([], { month: "short", day: "numeric" });

        slot = {
          timestamp: d,
          label: displayLabel,
          consumptionKwh: 0,
          solarKwh: 0,
          dieselKwh: 0,
          biogasKwh: 0,
          gridKwh: 0,
          renewableKwh: 0,
        };
        timeSlotsMap.set(key, slot);
      }

      slot.consumptionKwh += m.kwhConsumed;
      slot.solarKwh += m.solarKwhGenerated;
      slot.dieselKwh += m.generatorKwhGenerated;
      slot.biogasKwh += m.biogasKwhGenerated;
    });

    const timeSeriesTrends = Array.from(timeSlotsMap.values()).map((s) => {
      const ren = s.solarKwh + s.biogasKwh;
      const grid = Math.max(0, s.consumptionKwh - ren - s.dieselKwh);
      const renPct = s.consumptionKwh > 0 ? Math.min(100, (ren / s.consumptionKwh) * 100) : 0;
      return {
        timestamp: s.timestamp.toISOString(),
        label: s.label,
        consumptionKwh: Number(s.consumptionKwh.toFixed(1)),
        solarKwh: Number(s.solarKwh.toFixed(1)),
        dieselKwh: Number(s.dieselKwh.toFixed(1)),
        biogasKwh: Number(s.biogasKwh.toFixed(1)),
        gridKwh: Number(grid.toFixed(1)),
        renewableKwh: Number(ren.toFixed(1)),
        renewablePercent: Number(renPct.toFixed(1)),
      };
    });

    // 6. Energy Source Distribution (Donut / Pie format)
    const energySourceDistribution = [
      { name: "Government Grid", value: gridImportKwh, color: "#3b82f6", unit: "kWh" },
      { name: "Rooftop Solar PV", value: Number(solarGenerationKwh.toFixed(1)), color: "#eab308", unit: "kWh" },
      { name: "Diesel Generator", value: Number(dieselGenerationKwh.toFixed(1)), color: "#f97316", unit: "kWh" },
      { name: "Biogas Pilot Plant", value: Number(biogasGenerationKwh.toFixed(1)), color: "#84cc16", unit: "kWh" },
    ].filter((item) => item.value > 0);

    // 7. Energy Flow Model (Sources -> Substation -> Buildings)
    const energyFlow = {
      sources: [
        { name: "Government Grid Incomer", kwh: gridImportKwh, type: "GRID", color: "#3b82f6" },
        { name: "Campus Rooftop Solar PV", kwh: Number(solarGenerationKwh.toFixed(1)), type: "SOLAR", color: "#eab308" },
        { name: "Campus Standby Genset", kwh: Number(dieselGenerationKwh.toFixed(1)), type: "GENERATOR", color: "#f97316" },
        { name: "Biogas Pilot Digester", kwh: Number(biogasGenerationKwh.toFixed(1)), type: "BIOGAS", color: "#84cc16" },
      ].filter((s) => s.kwh > 0),
      hub: {
        name: "DIU Ashulia Main Distribution Sub-station",
        totalThroughputKwh: Number(totalCampusConsumptionKwh.toFixed(1)),
      },
      consumers: buildingRankings.map((b) => ({
        code: b.code,
        name: b.name,
        kwh: b.totalConsumptionKwh,
        percentage: b.percentageOfTotal,
      })),
      architectureNotice: "Direct synchronous distribution bus. Zero battery storage or external export assumed.",
    };

    // 8. Heatmap matrix (Day of week 0-6 vs Hour 0, 4, 8, 12, 16, 20)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = [0, 4, 8, 12, 16, 20];
    const heatmapGrid: Array<{ day: string; dayIndex: number; hour: number; avgKwh: number; count: number }> = [];

    for (let d = 0; d < 7; d++) {
      for (const h of hours) {
        heatmapGrid.push({ day: days[d], dayIndex: d, hour: h, avgKwh: 0, count: 0 });
      }
    }

    metrics.forEach((m) => {
      const date = new Date(m.timestamp);
      const d = date.getDay();
      const hBlock = Math.floor(date.getHours() / 4) * 4;
      const cell = heatmapGrid.find((c) => c.dayIndex === d && c.hour === hBlock);
      if (cell) {
        cell.avgKwh += m.kwhConsumed;
        cell.count++;
      }
    });

    const heatmap = heatmapGrid.map((c) => ({
      day: c.day,
      hour: `${String(c.hour).padStart(2, "0")}:00`,
      value: c.count > 0 ? Number((c.avgKwh / c.count).toFixed(1)) : 0,
    }));

    return NextResponse.json({
      summary: {
        totalCampusConsumptionKwh: Number(totalCampusConsumptionKwh.toFixed(1)),
        solarGenerationKwh: Number(solarGenerationKwh.toFixed(1)),
        biogasGenerationKwh: Number(biogasGenerationKwh.toFixed(1)),
        gridImportKwh: Number(gridImportKwh.toFixed(1)),
        dieselGenerationKwh: Number(dieselGenerationKwh.toFixed(1)),
        dieselLitresConsumed: Number(dieselLitresConsumed.toFixed(1)),
        totalRenewableGenerationKwh: Number(totalRenewableKwh.toFixed(1)),
        renewableContributionPercent: renewableSharePercent,
        gridDependencyPercent: gridDependencyPercent,
        latestDemandKw: Number(latestDemandKw.toFixed(1)),
        carbonEmittedKg: Number(carbonEmittedKg.toFixed(1)),
        carbonAvoidedKg: Number(carbonAvoidedKg.toFixed(1)),
        isSimulated: simulatedCount > 0,
        provenanceBreakdown: provenanceMap,
        dataProvenanceNotice:
          simulatedCount > 0
            ? "SIMULATED / DEMONSTRATION DATA (FOR HACKATHON EVALUATION - NOT ACTUAL DIU HARDWARE READINGS)"
            : "VERIFIED LIVE DATA INTEGRATION",
      },
      energyFlow,
      buildingRankings,
      timeSeriesTrends,
      energySourceDistribution,
      heatmap,
    });
  } catch (error: any) {
    console.error("Analytics overview API error:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics overview" },
      { status: 500 }
    );
  }
}
