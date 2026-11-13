import React from "react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { EnergyDataIntegrationView } from "@/components/ingestion/EnergyDataIntegrationView";

export const dynamic = "force-dynamic";

export default async function DataSourcesPage() {
  const session = await getSession();

  const [sources, provenances, adapters, batches, readings, buildings] = await Promise.all([
    db.energySource.findMany({ orderBy: { code: "asc" } }),
    db.dataSourceProvenance.findMany({ orderBy: { confidenceRating: "desc" } }),
    db.apiAdapterConfig.findMany({
      orderBy: { createdAt: "desc" },
      include: { targetEnergySource: true },
    }),
    db.ingestionBatch.findMany({
      orderBy: { createdAt: "desc" },
      include: { provenance: true },
    }),
    db.energyMetric.findMany({
      take: 60,
      orderBy: { timestamp: "desc" },
      include: {
        building: true,
        energySource: true,
        provenance: true,
      },
    }),
    db.building.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <EnergyDataIntegrationView
      initialSources={sources}
      initialProvenances={provenances}
      initialAdapters={adapters}
      initialBatches={batches}
      initialReadings={readings}
      buildings={buildings}
      user={session}
    />
  );
}
