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
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-display">
          <Building2 className="w-5 h-5 text-emerald-400" />
          Campus Facilities & Building-wise Consumption Analytics
        </h2>
        <p className="text-xs text-emerald-200/60 mt-0.5">
          Comparative electricity demand, facility energy rankings, daytime peak vs. off-peak baseload segregation, and Energy Use Intensity (EUI).
        </p>
      </div>

      {/* Building Rankings Bar Chart */}
      <div className="glass-panel rounded-3xl p-6">
        <BuildingRankingsBarChart rankings={buildingRankings} />
      </div>

      {/* Comprehensive Building Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {buildingRankings.map((b, idx) => (
          <div
            key={b.id}
            className={`p-5 rounded-3xl transition-all ${
              b.code === "FabLab"
                ? "glass-panel-glow border-emerald-400/40 shadow-[0_4px_25px_rgba(52,211,153,0.25)] ring-1 ring-[#6ee7b7]/40"
                : b.isHighConsumer
                ? "glass-panel border-emerald-500/30 shadow-lg shadow-emerald-950/20"
                : "glass-panel"
            }`}
          >
            <div className="flex items-center justify-between border-b border-emerald-500/15 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${b.code === "FabLab" ? "text-[#6ee7b7]" : "text-emerald-400"}`}>
                    {b.code}
                  </span>
                  {b.code === "FabLab" ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#6ee7b7] border border-emerald-500/40 font-bold uppercase clay-badge">
                      Prototyping Maker Lab
                    </span>
                  ) : b.isHighConsumer ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold uppercase clay-badge">
                      High Load #{idx + 1}
                    </span>
                  ) : null}
                </div>
                <h3 className="text-sm font-bold text-white mt-1 font-display">{b.name}</h3>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full border clay-badge ${
                b.code === "FabLab"
                  ? "bg-emerald-500/15 text-[#6ee7b7] border-emerald-500/30 font-medium"
                  : "bg-emerald-950/60 text-emerald-200/80 border-emerald-500/20"
              }`}>
                {b.primaryFunction.split("&")[0]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="bg-[#0b1c15]/70 p-3 rounded-2xl border border-emerald-500/15">
                <span className="text-[10px] text-emerald-300/70 flex items-center gap-1 font-medium">
                  <Layers className="w-3 h-3 text-emerald-400" /> Floor Area
                </span>
                <span className="text-sm font-bold text-white mt-1 block font-mono">
                  {b.totalFloorAreaSqM.toLocaleString()} m²
                </span>
              </div>
              <div className="bg-[#0b1c15]/70 p-3 rounded-2xl border border-emerald-500/15">
                <span className="text-[10px] text-emerald-300/70 flex items-center gap-1 font-medium">
                  <Users className="w-3 h-3 text-teal-400" /> Occupancy
                </span>
                <span className="text-sm font-bold text-white mt-1 block font-mono">
                  {b.occupancyCapacity.toLocaleString()} persons
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#081510]/90 border border-emerald-500/15 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-emerald-100/80">
                <span className="text-emerald-300/60 font-sans">Recorded Total:</span>
                <span className="font-bold text-white">{b.totalConsumptionKwh.toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between text-emerald-100/80">
                <span className="text-emerald-300/60 font-sans">Campus Share:</span>
                <span className="text-[#6ee7b7] font-bold">{b.percentageOfTotal}%</span>
              </div>
              <div className="flex justify-between text-emerald-100/80">
                <span className="text-emerald-300/60 font-sans">Energy Intensity (EUI):</span>
                <span className="text-emerald-300 font-bold">{b.euiKwhPerSqm} kWh/m²</span>
              </div>
              <div className="flex justify-between text-emerald-400/60 text-[11px] pt-1.5 border-t border-emerald-500/15">
                <span className="font-sans">Peak Share (08-17h):</span>
                <span className="font-semibold text-emerald-300">{b.peakFractionPercent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
