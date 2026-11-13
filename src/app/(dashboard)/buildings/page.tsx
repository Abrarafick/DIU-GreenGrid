import React from "react";
import { db } from "@/lib/db";
import { BuildingRankingsBarChart } from "@/components/analytics/BuildingRankingsBarChart";
import { Building2, Layers, Users, Zap, AlertTriangle, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BuildingsPage() {
  const [buildings, metrics] = await Promise.all([
    db.building.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
    db.energyMetric.findMany({
      orderBy: { timestamp: "asc" },
      include: { building: true },
    }),
  ]);

  let totalCampusConsumption = 0;
  const buildingMap: Record<string, any> = {};

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
    totalCampusConsumption += m.kwhConsumed;
    if (m.buildingId && buildingMap[m.buildingId]) {
      const b = buildingMap[m.buildingId];
      b.totalConsumptionKwh += m.kwhConsumed;

      const date = new Date(m.timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      const isWeekend = day === 5 || day === 6;

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
        totalCampusConsumption > 0
          ? Number(((total / totalCampusConsumption) * 100).toFixed(1))
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
        isHighConsumer: false,
      };
    })
    .sort((a, b) => b.totalConsumptionKwh - a.totalConsumptionKwh);

  buildingRankings.forEach((b, idx) => {
    if (idx === 0 || b.percentageOfTotal > 25.0) {
      b.isHighConsumer = true;
    }
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-400" />
          Campus Facilities & Building-wise Consumption Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Comparative electricity demand, facility energy rankings, daytime peak vs. off-peak baseload segregation, and Energy Use Intensity (EUI).
        </p>
      </div>

      {/* Building Rankings Bar Chart */}
      <BuildingRankingsBarChart rankings={buildingRankings} />

      {/* Comprehensive Building Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildingRankings.map((b, idx) => (
          <div
            key={b.id}
            className={`p-5 rounded-2xl border space-y-4 transition-all ${
              b.isHighConsumer
                ? "bg-slate-900/95 border-cyan-500/40 shadow-lg shadow-cyan-950/20"
                : "bg-slate-900/80 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400">{b.code}</span>
                  {b.isHighConsumer && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                      High Load #{idx + 1}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5">{b.name}</h3>
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

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 font-sans">Recorded Total:</span>
                <span className="font-bold text-white">{b.totalConsumptionKwh.toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 font-sans">Campus Share:</span>
                <span className="text-emerald-400 font-bold">{b.percentageOfTotal}%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 font-sans">Energy Intensity (EUI):</span>
                <span className="text-cyan-400 font-bold">{b.euiKwhPerSqm} kWh/m²</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                <span className="font-sans">Peak Share (08-17h):</span>
                <span>{b.peakFractionPercent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
