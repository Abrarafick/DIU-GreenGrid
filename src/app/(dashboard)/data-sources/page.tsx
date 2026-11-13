import React from "react";
import { db } from "@/lib/db";
import { Database, ShieldCheck, Cpu, AlertTriangle, FileSpreadsheet, Radio, Terminal } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DataSourcesPage() {
  const provenances = await db.dataSourceProvenance.findMany({
    orderBy: { confidenceRating: "desc" },
    include: {
      _count: {
        select: { metrics: true },
      },
    },
  });

  const energySources = await db.energySource.findMany();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          Data Provenance & Ingestion Adapters
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Auditable data lineage distinguishing live integrated feeds, CSV exports, manual logs, and clearly labeled demonstration datasets.
        </p>
      </div>

      {/* Provenance Lineage Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Registered Ingestion Sources & Transparency Ratings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {provenances.map((p) => {
            return (
              <div
                key={p.id}
                className={`p-5 rounded-xl border space-y-3 ${
                  p.isSimulated
                    ? "bg-amber-950/20 border-amber-500/30"
                    : "bg-slate-900/90 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    {p.isSimulated ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    )}
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      p.isSimulated
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30 font-mono"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono"
                    }`}
                  >
                    {p.ingestionMethod}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>

                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                  Endpoint / Detail: {p.sourceDetails}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Confidence Rating:{" "}
                    <strong
                      className={
                        p.confidenceRating > 0.8
                          ? "text-emerald-400 font-mono"
                          : p.confidenceRating > 0.0
                          ? "text-cyan-400 font-mono"
                          : "text-amber-400 font-mono"
                      }
                    >
                      {(p.confidenceRating * 100).toFixed(0)}%
                    </strong>
                  </span>
                  <span className="text-slate-400">
                    Telemetry Points:{" "}
                    <strong className="text-slate-200 font-mono">{p._count.metrics}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configurable Energy Sources Registry */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">
          Configurable Campus Energy Sources
        </h3>
        <p className="text-xs text-slate-400">
          Energy sources are fully parameterizable. No electric distributor or utility is hardcoded without verification.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {energySources.map((source) => (
            <div key={source.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-200">{source.name}</div>
              <div className="text-slate-400">
                Configured Provider: <span className="text-white font-medium">{source.configuredProvider}</span>
              </div>
              <div className="text-slate-400">
                Peak Capacity: <span className="font-mono text-emerald-400 font-bold">{source.ratedCapacityKw} kW</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Monitoring: {source.monitoringMethod}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
