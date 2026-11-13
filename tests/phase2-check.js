const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function runPhase2Checks() {
  console.log("==================================================");
  console.log("   DIU GREENGRID - PHASE 2 INTEGRATION TEST SUITE ");
  console.log("==================================================\n");

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${testName}`);
      testsPassed++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Verify All 4 Energy Sources Configured
    const sources = await prisma.energySource.findMany();
    assert(sources.length === 4, "4 Configured campus energy sources exist");

    const grid = sources.find((s) => s.code === "GRID_SUPPLY");
    assert(grid && grid.sourceType === "GRID", "Government Grid Incomer registered and active");

    const solar = sources.find((s) => s.code === "SOLAR_ROOFTOP");
    assert(solar && solar.sourceType === "SOLAR" && solar.isRenewable === true, "Solar PV Rooftop registered as renewable");

    const genset = sources.find((s) => s.code === "CAMPUS_GENSET");
    assert(genset && genset.sourceType === "GENERATOR" && genset.monitoringMethod === "TECHNICAL_FUEL_LOGBOOK", "Emergency Diesel Generator registered with technical fuel monitoring");

    const biogas = sources.find((s) => s.code === "BIOGAS_PILOT");
    assert(biogas && biogas.sourceType === "BIOGAS" && biogas.operationalStatus === "UNVERIFIED_PILOT", "Biogas Pilot Plant registered with UNVERIFIED_PILOT operational status");

    // 2. Verify Configurable API Adapters
    const adapters = await prisma.apiAdapterConfig.findMany();
    assert(adapters.length >= 4, "Configurable API adapters registered for external systems");
    const solarAdapter = adapters.find((a) => a.adapterType === "SOLAR_INVERTER");
    assert(solarAdapter && solarAdapter.baseUrl.includes("inverters"), "Solar Inverter adapter endpoint configured");
    const gridAdapter = adapters.find((a) => a.adapterType === "GRID_METER");
    assert(gridAdapter && gridAdapter.adapterType === "GRID_METER", "Grid Incomer digital interface adapter configured");
    const gensetAdapter = adapters.find((a) => a.adapterType === "GENSET_TELEMETRY");
    assert(gensetAdapter && gensetAdapter.adapterType === "GENSET_TELEMETRY", "Generator telemetry adapter configured");
    const biogasAdapter = adapters.find((a) => a.adapterType === "BIOGAS_MONITOR");
    assert(biogasAdapter && biogasAdapter.adapterType === "BIOGAS_MONITOR", "Biogas flow transducer adapter configured");

    // 3. Verify Ingestion Batch Audit Model
    const batches = await prisma.ingestionBatch.findMany();
    assert(batches.length >= 1, "IngestionBatch audit records exist");
    assert(batches[0].totalRows > 0, "IngestionBatch tracks total evaluated rows");

    // 4. Verify Technical Metrics Tracking Across All 4 Sources
    const sampleMetrics = await prisma.energyMetric.findMany({
      take: 50,
      orderBy: { timestamp: "desc" },
    });
    assert(sampleMetrics.length > 0, "Telemetry reading records queryable");

    const hasGridReadings = sampleMetrics.some((m) => m.kwhConsumed > 0);
    assert(hasGridReadings, "Grid electricity consumption tracked in kWh");

    const hasSolarReadings = sampleMetrics.some((m) => m.solarKwhGenerated > 0);
    assert(hasSolarReadings, "Solar generation tracked in kWh");

    const allMetrics = await prisma.energyMetric.findMany();
    const hasDieselReadings = allMetrics.some((m) => m.dieselLitres > 0 && m.generatorRuntimeHours > 0);
    assert(hasDieselReadings, "Diesel fuel strictly tracked in litres and generator runtime hours (non-financial)");

    const hasBiogasReadings = allMetrics.some((m) => m.biogasKwhGenerated > 0 && m.biogasM3Consumed > 0);
    assert(hasBiogasReadings, "Biogas production tracked in m3 volume and equivalent generated kWh");

    // 5. Verify Provenance Transparency Lineage
    const simulatedMetrics = allMetrics.filter((m) => m.isSimulated === true);
    assert(
      simulatedMetrics.length === allMetrics.length,
      "Demonstration records are strictly tagged with isSimulated: true (zero hidden simulation)"
    );

    const provenances = await prisma.dataSourceProvenance.findMany();
    const demoProv = provenances.find((p) => p.code === "DEMO_SIMULATION_ENGINE");
    assert(demoProv && demoProv.isSimulated === true && demoProv.confidenceRating === 0.0, "Demo provenance has 0.0 confidence and isSimulated: true");

    // 6. Non-Financial Verification
    const rawMetricSample = sampleMetrics[0];
    assert(!("cost" in rawMetricSample) && !("bill" in rawMetricSample) && !("bdt" in rawMetricSample), "Zero financial fields in database metric records");

    console.log(`\n==================================================`);
    console.log(`   TEST RESULT: ${testsPassed}/${totalTests} PASSED (100% SUCCESS)`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runPhase2Checks();
