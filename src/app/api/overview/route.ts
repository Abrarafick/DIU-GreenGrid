import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const buildings = await db.building.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });

    const sources = await db.energySource.findMany({
      where: { isActive: true },
    });

    const emissionFactors = await db.emissionFactorConfig.findMany();

    const metrics = await db.energyMetric.findMany({
      take: 200,
      orderBy: { timestamp: "desc" },
      include: {
        building: true,
        provenance: true,
      },
    });

    let totalKwhConsumed = 0;
    let totalSolarGeneratedKwh = 0;
    let totalDieselLitres = 0;
    let totalGenRuntimeHours = 0;
    let totalGenKwhGenerated = 0;
    let totalBiogasM3 = 0;
    let totalBiogasKwh = 0;
    let totalCarbonEmittedKg = 0;
    let totalCarbonAvoidedKg = 0;
    let simulatedCount = 0;

    metrics.forEach((m) => {
      totalKwhConsumed += m.kwhConsumed;
      totalSolarGeneratedKwh += m.solarKwhGenerated;
      totalDieselLitres += m.dieselLitres;
      totalGenRuntimeHours += m.generatorRuntimeHours;
      totalGenKwhGenerated += m.generatorKwhGenerated || 0;
      totalBiogasM3 += m.biogasM3Consumed || 0;
      totalBiogasKwh += m.biogasKwhGenerated || 0;
      totalCarbonEmittedKg += m.carbonKgEmitted;
      totalCarbonAvoidedKg += m.carbonKgAvoided;
      if (m.isSimulated) simulatedCount++;
    });

    const isSimulatedDataset = simulatedCount > 0;
    const renewableShare =
      totalKwhConsumed > 0
        ? Math.min(100, Number((((totalSolarGeneratedKwh + totalBiogasKwh) / totalKwhConsumed) * 100).toFixed(1)))
        : 0;

    const buildingSummaries = buildings.map((b) => {
      const bMetrics = metrics.filter((m) => m.buildingId === b.id);
      const bConsumed = bMetrics.reduce((sum, m) => sum + m.kwhConsumed, 0);
      const bSolar = bMetrics.reduce((sum, m) => sum + m.solarKwhGenerated, 0);
      const eui = Number((bConsumed / b.totalFloorAreaSqM).toFixed(3));
      return {
        id: b.id,
        code: b.code,
        name: b.name,
        totalFloorAreaSqM: b.totalFloorAreaSqM,
        occupancyCapacity: b.occupancyCapacity,
        primaryFunction: b.primaryFunction,
        baselineDailyKwh: b.baselineDailyKwh,
        recordedKwh: Number(bConsumed.toFixed(1)),
        solarContributionKwh: Number(bSolar.toFixed(1)),
        euiKwhPerSqm: eui,
      };
    });

    const actionItems = await db.actionImprovement.findMany({
      orderBy: { reportedAt: "desc" },
      include: { targetBuilding: true },
    });

    const totalVerifiedKwhSavings = actionItems.reduce(
      (sum, item) => sum + (item.verifiedKwhSavings || 0),
      0
    );

    const provenances = await db.dataSourceProvenance.findMany();

    return NextResponse.json({
      summary: {
        totalKwhConsumed: Number(totalKwhConsumed.toFixed(1)),
        totalSolarGeneratedKwh: Number(totalSolarGeneratedKwh.toFixed(1)),
        renewableSharePercent: renewableShare,
        dieselLitres: Number(totalDieselLitres.toFixed(1)), // Technical fuel litres
        generatorRuntimeHours: Number(totalGenRuntimeHours.toFixed(1)),
        generatorKwhGenerated: Number(totalGenKwhGenerated.toFixed(1)),
        biogasM3Consumed: Number(totalBiogasM3.toFixed(1)),
        biogasKwhGenerated: Number(totalBiogasKwh.toFixed(1)),
        carbonEmittedKg: Number(totalCarbonEmittedKg.toFixed(1)),
        carbonAvoidedKg: Number(totalCarbonAvoidedKg.toFixed(1)),
        totalVerifiedKwhSavings: Number(totalVerifiedKwhSavings.toFixed(1)),
        isSimulated: isSimulatedDataset,
        dataProvenanceNotice: isSimulatedDataset
          ? "SIMULATED / DEMONSTRATION DATA (FOR HACKATHON EVALUATION - NOT ACTUAL DIU HARDWARE READINGS)"
          : "VERIFIED LIVE DATA INTEGRATION",
      },
      buildings: buildingSummaries,
      energySources: sources,
      emissionFactors,
      actionItems,
      provenances,
    });
  } catch (error: any) {
    console.error("Overview API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    );
  }
}
