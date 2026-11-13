"use client";

import React from "react";
import { Sun, Leaf, Globe, Zap, ArrowUpRight, ShieldCheck } from "lucide-react";

interface RenewableProps {
  solarKwh: number;
  biogasKwh: number;
  totalRenewableKwh: number;
  renewableSharePercent: number;
  gridDependencyPercent: number;
  carbonAvoidedKg: number;
}

export function RenewableAnalyticsCard({
  solarKwh,
  biogasKwh,
  totalRenewableKwh,
  renewableSharePercent,
  gridDependencyPercent,
  carbonAvoidedKg,
}: RenewableProps) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-emerald-950/20 border border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            Renewable Generation & Clean Grid Penetration
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            On-campus rooftop solar PV arrays and organic waste biogas clean energy offset metrics.
          </p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
          SDG 7 Clean Energy
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Renewable Output */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Renewable Yield</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {totalRenewableKwh.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Solar: {solarKwh.toLocaleString()}</span>
            <span>Biogas: {biogasKwh.toLocaleString()}</span>
          </div>
        </div>

        {/* Clean Energy Share */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Campus Renewable Share</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {renewableSharePercent}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, renewableSharePercent)}%` }}
            />
          </div>
        </div>

        {/* Grid Dependency */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-blue-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>National Grid Dependency</span>
            <Zap className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400 font-mono">
            {gridDependencyPercent}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, gridDependencyPercent)}%` }}
            />
          </div>
        </div>

        {/* Avoided Emissions */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avoided Scope 2 Emissions</span>
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-300 font-mono">
            {carbonAvoidedKg.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            Calculated via DoE grid factor (0.637)
          </div>
        </div>
      </div>
    </div>
  );
}
