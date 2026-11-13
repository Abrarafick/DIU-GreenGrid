import React from "react";
import { db } from "@/lib/db";
import { Building2, Layers, Users, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BuildingsPage() {
  const buildings = await db.building.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
    include: {
      metrics: {
        take: 30,
        orderBy: { timestamp: "desc" },
      },
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          Campus Facilities & Building Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Detailed floor area profiles, occupancy capacities, and energy use intensity baselines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.map((b) => {
          const totalKwh = b.metrics.reduce((acc, m) => acc + m.kwhConsumed, 0);
          const eui = Number((totalKwh / b.totalFloorAreaSqM).toFixed(3));
          return (
            <div
              key={b.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-400 block">{b.code}</span>
                  <h3 className="text-sm font-bold text-white">{b.name}</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {b.primaryFunction.split("&")[0]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-cyan-400" /> Floor Area
                  </span>
                  <span className="text-sm font-bold text-slate-200 mt-1 block">
                    {b.totalFloorAreaSqM.toLocaleString()} m²
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" /> Occupancy
                  </span>
                  <span className="text-sm font-bold text-slate-200 mt-1 block">
                    {b.occupancyCapacity.toLocaleString()} persons
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Baseline Daily Target</span>
                  <span className="font-mono text-slate-200 font-semibold">{b.baselineDailyKwh} kWh</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Sample EUI</span>
                  <span className="font-mono text-cyan-400 font-bold">{eui} kWh/m²</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
