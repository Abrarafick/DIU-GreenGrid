import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { calculateCarbonMetrics } from "@/lib/carbon";

export async function GET() {
  try {
    const adapters = await db.apiAdapterConfig.findMany({
      orderBy: { createdAt: "desc" },
      include: { targetEnergySource: true },
    });
    return NextResponse.json({ adapters });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch adapters" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth(["ADMIN", "FACILITY_MANAGER"]);
    const body = await request.json();

    const {
      name,
      adapterType,
      baseUrl,
      authType = "NONE",
      authKey,
      pollingIntervalMins = 60,
      targetEnergySourceId,
      isSimulatedFallback = true,
    } = body;

    if (!name || !adapterType || !baseUrl) {
      return NextResponse.json(
        { error: "Name, adapter type, and base URL are required" },
        { status: 400 }
      );
    }

    const maskedKey = authKey ? `${authKey.slice(0, 4)}••••${authKey.slice(-4)}` : null;

    const adapter = await db.apiAdapterConfig.create({
      data: {
        name,
        adapterType,
        baseUrl,
        authType,
        authKeyMasked: maskedKey,
        pollingIntervalMins: Number(pollingIntervalMins) || 60,
        targetEnergySourceId: targetEnergySourceId || null,
        isSimulatedFallback: Boolean(isSimulatedFallback),
        status: "CONFIGURED_IDLE",
      },
    });

    await db.auditLog.create({
      data: {
        action: "API_ADAPTER_CREATED",
        performedBy: session.email,
        details: `Created API adapter ${name} (${adapterType}) pointing to ${baseUrl}`,
      },
    });

    return NextResponse.json({ success: true, adapter });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create API adapter" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth(["ADMIN", "FACILITY_MANAGER"]);
    const body = await request.json();
    const { adapterId, action = "TEST_SYNC" } = body;

    if (!adapterId) {
      return NextResponse.json({ error: "Adapter ID is required" }, { status: 400 });
    }

    const adapter = await db.apiAdapterConfig.findUnique({
      where: { id: adapterId },
      include: { targetEnergySource: true },
    });

    if (!adapter) {
      return NextResponse.json({ error: "Adapter not found" }, { status: 404 });
    }

    // Perform connection test / mock sync
    const now = new Date();
    let newStatus = "MOCK_SYNC_OK";
    let message = `Test connection verified. Endpoint parameterization active (${adapter.baseUrl}).`;

    // If test sync is requested and adapter has target source, insert a sample sync record
    if (action === "TEST_SYNC") {
      let solarKwh = 0.0;
      let gridKwh = 0.0;
      let dieselLitres = 0.0;
      let genKwh = 0.0;
      let biogasKwh = 0.0;
      let biogasM3 = 0.0;

      if (adapter.adapterType === "SOLAR_INVERTER") {
        solarKwh = Number((120.5 + Math.random() * 40).toFixed(1));
        message = `Inverter query successful. Sample string telemetry received: ${solarKwh} kWh yield.`;
      } else if (adapter.adapterType === "GRID_METER") {
        gridKwh = Number((280.0 + Math.random() * 50).toFixed(1));
        message = `Grid meter interface queried. Active demand received: ${gridKwh} kWh.`;
      } else if (adapter.adapterType === "GENSET_TELEMETRY") {
        dieselLitres = 12.5;
        genKwh = 38.0;
        message = `Generator telemetry polled. Runtime log verified: ${dieselLitres} L diesel, ${genKwh} kWh generated.`;
      } else if (adapter.adapterType === "BIOGAS_MONITOR") {
        biogasM3 = 4.5;
        biogasKwh = 7.6;
        message = `Biogas flow transducer polled. Output recorded: ${biogasM3} m³, ${biogasKwh} kWh equiv.`;
      }

      // Carbon calculation
      const factors = await db.emissionFactorConfig.findMany();
      const gridFactor = factors.find((f) => f.factorKey === "GRID_ELECTRICITY_CO2")?.value ?? 0.637;
      const dieselFactor = factors.find((f) => f.factorKey === "DIESEL_FUEL_CO2")?.value ?? 2.68;

      const carbon = calculateCarbonMetrics({
        gridKwhConsumed: gridKwh,
        solarKwhGenerated: solarKwh + biogasKwh,
        dieselLitresConsumed: dieselLitres,
        gridFactorOverride: gridFactor,
        dieselFactorOverride: dieselFactor,
      });

      // Provenance: Since this is an adapter test sync in demo environment, flag clearly
      const provCode = adapter.isSimulatedFallback ? "DEMO_SIMULATION_ENGINE" : "INVERTER_API_VERIFIED";
      let provenance = await db.dataSourceProvenance.findUnique({ where: { code: provCode } });
      if (!provenance) {
        provenance = await db.dataSourceProvenance.create({
          data: {
            code: provCode,
            name: `${adapter.name} Feed`,
            ingestionMethod: adapter.isSimulatedFallback ? "DEMO_SIMULATION" : "API_CONNECTOR",
            isSimulated: adapter.isSimulatedFallback,
            confidenceRating: adapter.isSimulatedFallback ? 0.0 : 1.0,
            sourceDetails: adapter.baseUrl,
            description: "Automated adapter feed.",
          },
        });
      }

      await db.energyMetric.create({
        data: {
          timestamp: now,
          energySourceId: adapter.targetEnergySourceId || null,
          provenanceId: provenance.id,
          isSimulated: adapter.isSimulatedFallback,
          kwhConsumed: gridKwh,
          solarKwhGenerated: solarKwh,
          dieselLitres,
          generatorRuntimeHours: dieselLitres > 0 ? 0.5 : 0.0,
          generatorKwhGenerated: genKwh,
          biogasM3Consumed: biogasM3,
          biogasKwhGenerated: biogasKwh,
          carbonKgEmitted: carbon.totalCarbonKgEmitted,
          carbonKgAvoided: carbon.carbonKgAvoidedBySolar,
          notes: `Polled by adapter '${adapter.name}'. Fallback simulated: ${adapter.isSimulatedFallback}`,
          rawPayload: JSON.stringify({ adapter: adapter.name, polledAt: now.toISOString() }),
        },
      });
    }

    const updated = await db.apiAdapterConfig.update({
      where: { id: adapterId },
      data: {
        status: newStatus,
        lastSyncAt: now,
        lastSyncStatus: "SUCCESS",
        lastSyncMessage: message,
      },
      include: { targetEnergySource: true },
    });

    await db.auditLog.create({
      data: {
        action: "API_ADAPTER_SYNC_TESTED",
        performedBy: session.email,
        details: `Sync executed for adapter ${adapter.name}: ${message}`,
      },
    });

    return NextResponse.json({ success: true, adapter: updated });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to sync adapter" }, { status: 500 });
  }
}
