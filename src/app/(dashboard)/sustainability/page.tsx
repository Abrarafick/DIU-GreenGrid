import React from "react";
import { db } from "@/lib/db";
import { Leaf, Globe, Sun, Factory, Recycle, ShieldCheck, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SustainabilityPage() {
  const emissionFactors = await db.emissionFactorConfig.findMany();
  const metrics = await db.energyMetric.findMany({
    take: 200,
    orderBy: { timestamp: "desc" },
  });

  let totalConsumed = 0;
  let totalSolar = 0;
  let totalEmitted = 0;
  let totalAvoided = 0;

  metrics.forEach((m) => {
    totalConsumed += m.kwhConsumed;
    totalSolar += m.solarKwhGenerated;
    totalEmitted += m.carbonKgEmitted;
    totalAvoided += m.carbonKgAvoided;
  });

  const cleanPercent =
    totalConsumed > 0 ? Number(((totalSolar / totalConsumed) * 100).toFixed(1)) : 0;

  const actions = await db.actionImprovement.findMany({
    where: { completionStatus: "COMPLETED_VERIFIED" },
  });
  const verifiedKwhSavings = actions.reduce((sum, a) => sum + (a.verifiedKwhSavings || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-400" />
          Sustainability & Sustainable Development Goals (SDGs)
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Quantifiable environmental accounting mapped strictly to United Nations SDG targets. Zero financial proxies.
        </p>
      </div>

      {/* SDG Goal Cards: SDG 7, 9, 12, 13 (and optional 11) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SDG 7 */}
        <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              SDG 7
            </span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Affordable & Clean Energy</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Solar Share:</span>
              <span className="font-bold text-amber-300 font-mono">{cleanPercent}%</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Rooftop Generation:</span>
              <span className="font-mono">{totalSolar.toLocaleString()} kWh</span>
            </div>
          </div>
        </div>

        {/* SDG 9 */}
        <div className="p-5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
              SDG 9
            </span>
            <Factory className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Industry, Innovation & Infra</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Software Digitalization:</span>
              <span className="font-bold text-blue-300 font-mono">100% Core</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Hardware Additions:</span>
              <span className="font-mono text-emerald-400 font-bold">0 Devices</span>
            </div>
          </div>
        </div>

        {/* SDG 12 */}
        <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              SDG 12
            </span>
            <Recycle className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Responsible Consumption</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Verified Savings:</span>
              <span className="font-bold text-purple-300 font-mono">
                {verifiedKwhSavings.toLocaleString()} kWh
              </span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Waste Mitigation:</span>
              <span className="font-mono">Idle Load Curfew</span>
            </div>
          </div>
        </div>

        {/* SDG 13 */}
        <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              SDG 13
            </span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Climate Action</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Solar CO₂ Avoided:</span>
              <span className="font-bold text-emerald-300 font-mono">
                {Number(totalAvoided.toFixed(1)).toLocaleString()} kg
              </span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Grid Emissions:</span>
              <span className="font-mono">{Number(totalEmitted.toFixed(1)).toLocaleString()} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carbon Emission Calculation Methodology */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">
            Documented GHG Emission Factors & Calculation Standard
          </h3>
        </div>

        <div className="space-y-3">
          {emissionFactors.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{f.factorName}</span>
                  <code className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {f.factorKey}
                  </code>
                </div>
                <p className="text-slate-400 text-[11px]">
                  <strong className="text-slate-400">Source:</strong> {f.sourceDocumentation}
                </p>
                <p className="text-slate-400 text-[11px]">
                  <strong className="text-slate-400">Assumptions:</strong> {f.assumptions}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xl font-bold text-emerald-400 font-mono block">
                  {f.value}
                </span>
                <span className="text-[11px] text-slate-400">{f.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
