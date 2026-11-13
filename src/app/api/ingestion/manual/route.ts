import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { calculateCarbonMetrics } from "@/lib/carbon";
import { parseNormalizedTimestamp } from "@/lib/ingestion/normalizer";

export async function POST(request: Request) {
  try {
    const session = await requireAuth(["ADMIN", "FACILITY_MANAGER"]);
    const body = await request.json();

    const {
      timestamp: rawTime,
      buildingId,
      energySourceId,
      kwhConsumed = 0.0,
      solarKwhGenerated = 0.0,
      dieselLitres = 0.0,
      generatorRuntimeHours = 0.0,
      generatorKwhGenerated = 0.0,
      biogasM3Consumed = 0.0,
      biogasKwhGenerated = 0.0,
      peakDemandKw = null,
      powerFactor = null,
      notes,
      isSimulated = false,
    } = body;

    const parsedDate = parseNormalizedTimestamp(rawTime);
    if (!parsedDate) {
      return NextResponse.json(
        { error: "Invalid timestamp. Please provide a valid date/time." },
        { status: 400 }
      );
    }

    // Validation: prevent negative quantities
    if (
      kwhConsumed < 0 ||
      solarKwhGenerated < 0 ||
      dieselLitres < 0 ||
      generatorRuntimeHours < 0 ||
      generatorKwhGenerated < 0 ||
      biogasM3Consumed < 0 ||
      biogasKwhGenerated < 0
    ) {
      return NextResponse.json(
        { error: "Energy, runtime, and fuel quantities cannot be negative." },
        { status: 400 }
      );
    }

    // Duplicate check
    const windowStart = new Date(parsedDate.getTime() - 10 * 60 * 1000);
    const windowEnd = new Date(parsedDate.getTime() + 10 * 60 * 1000);

    const duplicate = await db.energyMetric.findFirst({
      where: {
        timestamp: { gte: windowStart, lte: windowEnd },
        buildingId: buildingId || undefined,
        energySourceId: energySourceId || undefined,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "A reading for this facility/source already exists within 10 minutes of this timestamp." },
        { status: 409 }
      );
    }

    // Fetch active emission factors
    const factors = await db.emissionFactorConfig.findMany();
    const gridFactor = factors.find((f) => f.factorKey === "GRID_ELECTRICITY_CO2")?.value ?? 0.637;
    const dieselFactor = factors.find((f) => f.factorKey === "DIESEL_FUEL_CO2")?.value ?? 2.68;

    // Carbon calculation
    const carbonResult = calculateCarbonMetrics({
      gridKwhConsumed: Number(kwhConsumed),
      solarKwhGenerated: Number(solarKwhGenerated) + Number(biogasKwhGenerated),
      dieselLitresConsumed: Number(dieselLitres),
      gridFactorOverride: gridFactor,
      dieselFactorOverride: dieselFactor,
    });

    // Provenance resolution
    const provCode = isSimulated ? "DEMO_SIMULATION_ENGINE" : "MANUAL_LOG_ENTRY";
    let provenance = await db.dataSourceProvenance.findUnique({
      where: { code: provCode },
    });

    if (!provenance) {
      provenance = await db.dataSourceProvenance.create({
        data: {
          code: provCode,
          name: isSimulated ? "Demonstration Simulation Engine" : "Authorized Manual Facility Entry",
          ingestionMethod: isSimulated ? "DEMO_SIMULATION" : "MANUAL_ENTRY",
          isSimulated,
          confidenceRating: isSimulated ? 0.0 : 0.85,
          sourceDetails: `Logged by authorized user: ${session.email}`,
          description: "Manual log recorded through the DIU GreenGrid portal.",
        },
      });
    }

    // Insert record
    const metric = await db.energyMetric.create({
      data: {
        timestamp: parsedDate,
        buildingId: buildingId || null,
        energySourceId: energySourceId || null,
        provenanceId: provenance.id,
        isSimulated,
        kwhConsumed: Number(kwhConsumed),
        solarKwhGenerated: Number(solarKwhGenerated),
        dieselLitres: Number(dieselLitres),
        generatorRuntimeHours: Number(generatorRuntimeHours),
        generatorKwhGenerated: Number(generatorKwhGenerated),
        biogasM3Consumed: Number(biogasM3Consumed),
        biogasKwhGenerated: Number(biogasKwhGenerated),
        peakDemandKw: peakDemandKw !== null && peakDemandKw !== undefined && peakDemandKw !== "" ? Number(peakDemandKw) : null,
        powerFactor: powerFactor !== null && powerFactor !== undefined && powerFactor !== "" ? Number(powerFactor) : null,
        carbonKgEmitted: carbonResult.totalCarbonKgEmitted,
        carbonKgAvoided: carbonResult.carbonKgAvoidedBySolar,
        notes: notes ? String(notes).trim() : null,
        rawPayload: JSON.stringify({ enteredBy: session.email, input: body }),
      },
    });

    // Audit Log
    await db.auditLog.create({
      data: {
        action: "MANUAL_READING_RECORDED",
        performedBy: session.email,
        details: `Manual reading logged for ${parsedDate.toISOString()} (Grid: ${kwhConsumed} kWh, Solar: ${solarKwhGenerated} kWh, Diesel: ${dieselLitres} L, Biogas: ${biogasKwhGenerated} kWh). Simulated: ${isSimulated}`,
      },
    });

    return NextResponse.json({
      success: true,
      metric,
      carbonResult,
    });
  } catch (error: any) {
    console.error("Manual entry error:", error);
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to record manual entry" }, { status: 500 });
  }
}
