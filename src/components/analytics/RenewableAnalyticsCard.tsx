"use client";

import React from "react";
import { Sun, Leaf, Globe, Zap, ArrowUpRight, ShieldCheck, Info } from "lucide-react";

interface RenewableProps {
  solarKwh: number;
  biogasKwh: number;
  totalRenewableKwh: number;
  renewableConsumedKwh?: number;
  renewableSurplusKwh?: number;
  renewableSharePercent: number;
  gridDependencyPercent: number;
  carbonAvoidedKg: number;
  isSelfConsumptionEstimated?: boolean;
  selfConsumptionAssumption?: string;
}

export function RenewableAnalyticsCard({
  solarKwh,
  biogasKwh,
  totalRenewableKwh,
  renewableConsumedKwh,
  renewableSurplusKwh,
  renewableSharePercent,
  gridDependencyPercent,
  carbonAvoidedKg,
  isSelfConsumptionEstimated = true,
  selfConsumptionAssumption,
}: RenewableProps) {
  const consumed = renewableConsumedKwh ?? totalRenewableKwh;
  const surplus = renewableSurplusKwh ?? 0;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-emerald-950/20 border border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              Renewable Self-Consumption & Clean Grid Penetration
            </h3>
            {isSelfConsumptionEstimated && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ESTIMATED SELF-CONSUMPTION
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            On-campus solar PV arrays & organic waste biogas. Excludes unutilized solar surplus from campus consumption.
          </p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
          SDG 7 Clean Energy
        </span>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Consumed Renewable vs Gross */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Renewable Consumed</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {consumed.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Gross: {totalRenewableKwh.toLocaleString()} kWh</span>
            <span className="text-amber-400">Surplus: {surplus.toLocaleString()} kWh</span>
          </div>
        </div>

        {/* Metric 2: Clean Energy Share */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Renewable Contribution</span>
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
          <div className="text-[10px] text-slate-400 pt-0.5">
            Formula: Consumed Clean / Total Demand
          </div>
        </div>

        {/* Metric 3: National Grid Dependency */}
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
          <div className="text-[10px] text-slate-400 pt-0.5">
            Utility incomer reliance
          </div>
        </div>

        {/* Metric 4: Avoided Emissions */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avoided Emissions</span>
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-300 font-mono">
            {carbonAvoidedKg.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
            Grid factor benchmark: 0.637 kg/kWh
          </div>
        </div>
      </div>

      {/* Accounting Assumption & Transparency Notice */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-300 block">
            Self-Consumption Accounting Boundary & Assumptions:
          </span>
          <p className="text-[11px] leading-relaxed text-slate-400">
            {selfConsumptionAssumption ||
              "Calculated via interval-based minimum matching between available solar/biogas generation and monitored facility demand per 4-hour cycle. Generation exceeding instantaneous load during low-occupancy windows is classified as surplus/unutilized due to absence of campus battery storage or net-metering export infrastructure, and is not credited as campus consumption."}
          </p>
        </div>
      </div>
    </div>
  );
}
