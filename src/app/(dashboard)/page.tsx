import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { OverviewDashboard } from "@/components/dashboard/OverviewDashboard";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await getSession();

  // 1. Fetch buildings
  const buildings = await db.building.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });

  // 2. Fetch energy sources
  const sources = await db.energySource.findMany({
    where: { isActive: true },
  });

  // 3. Fetch emission factors
  const emissionFactors = await db.emissionFactorConfig.findMany();

  // 4. Fetch metrics
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
  let totalCarbonEmittedKg = 0;
  let totalCarbonAvoidedKg = 0;
  let simulatedCount = 0;

  metrics.forEach((m) => {
    totalKwhConsumed += m.kwhConsumed;
    totalSolarGeneratedKwh += m.solarKwhGenerated;
    totalDieselLitres += m.dieselLitres;
    totalGenRuntimeHours += m.generatorRuntimeHours;
    totalCarbonEmittedKg += m.carbonKgEmitted;
    totalCarbonAvoidedKg += m.carbonKgAvoided;
    if (m.isSimulated) simulatedCount++;
  });

  const isSimulatedDataset = simulatedCount > 0;
  const renewableShare =
    totalKwhConsumed > 0
      ? Math.min(100, Number(((totalSolarGeneratedKwh / totalKwhConsumed) * 100).toFixed(1)))
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

  const initialData = {
    summary: {
      totalKwhConsumed: Number(totalKwhConsumed.toFixed(1)),
      totalSolarGeneratedKwh: Number(totalSolarGeneratedKwh.toFixed(1)),
      renewableSharePercent: renewableShare,
      dieselLitres: Number(totalDieselLitres.toFixed(1)), // strictly technical monitoring
      generatorRuntimeHours: Number(totalGenRuntimeHours.toFixed(1)),
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
  };

  return <OverviewDashboard initialData={initialData} user={session} />;
}
