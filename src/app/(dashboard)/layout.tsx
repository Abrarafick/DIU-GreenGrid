import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";
import { DataSourceBanner } from "@/components/shared/DataSourceBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Check if current dataset is simulated or live
  const simulatedCount = await db.energyMetric.count({
    where: { isSimulated: true },
  });
  const isSimulated = simulatedCount > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 selection:bg-emerald-500/20 selection:text-emerald-800">
      {/* Prominent Data Provenance Banner */}
      <DataSourceBanner
        isSimulated={isSimulated}
        confidenceRating={isSimulated ? 0.0 : 1.0}
        sourceName={
          isSimulated
            ? "Hackathon Evaluation Simulation Engine (Synthetic)"
            : "DIU Inverter / Meter Active Adapters"
        }
      />

      {/* Main Header */}
      <Header user={session} />

      {/* Body with Sidebar and Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(16,185,129,0.05),rgba(248,250,252,0))]">
          {children}
        </main>
      </div>
    </div>
  );
}
