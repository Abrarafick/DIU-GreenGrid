"use client";

import React from "react";
import { Building2, Activity, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { BuildingEnergyIntelligenceSummary } from "@/lib/ai/anomaly";

interface BuildingIntelligenceProps {
  intelligenceList: BuildingEnergyIntelligenceSummary[];
  onSelectBuilding?: (buildingCode: string) => void;
}

export function BuildingIntelligenceCards({
  intelligenceList,
  onSelectBuilding,
}: BuildingIntelligenceProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "HIGH":
        return "bg-orange-500/15 text-orange-300 border-orange-500/30";
      case "MEDIUM":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "LOW":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 85) return "text-emerald-400";
    if (score >= 70) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Building Energy Intelligence & Baseline Diagnostics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Normalized Energy Use Intensity (EUI), baseline deviation tracking, and AI anomaly state per campus facility.
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 self-start sm:self-auto">
          {intelligenceList.length} Facilities Evaluated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {intelligenceList.map((b) => {
          const isHighVariance = b.euiVariancePercent > 15;
          return (
            <div
              key={b.buildingId}
              onClick={() => onSelectBuilding && onSelectBuilding(b.buildingCode)}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {b.buildingCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getSeverityBadge(
                        b.highestSeverity
                      )}`}
                    >
                      {b.highestSeverity === "NORMAL" ? "NOMINAL" : `${b.highestSeverity} ANOMALY`}
                    </span>
                  </div>

                  {/* Health Score */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Health Score</span>
                    <span className={`text-sm font-bold font-mono ${getHealthColor(b.healthScore)}`}>
                      {b.healthScore}/100
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight">{b.buildingName}</h4>
                <div className="text-[11px] text-slate-400 truncate">{b.primaryFunction}</div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Current Daily</span>
                  <span className="font-bold text-white">{b.currentConsumptionKwh.toLocaleString()}</span>{" "}
                  <span className="text-[10px] text-slate-400 font-sans">kWh</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Target Baseline</span>
                  <span className="font-bold text-slate-300">{b.baselineDailyKwh.toLocaleString()}</span>{" "}
                  <span className="text-[10px] text-slate-400 font-sans">kWh</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Observed EUI</span>
                  <span className="font-bold text-cyan-300">{b.observedEuiKwhPerSqm}</span>{" "}
                  <span className="text-[10px] text-slate-400 font-sans">kWh/m²</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Variance</span>
                  <span
                    className={`font-bold ${
                      b.euiVariancePercent > 0 ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {b.euiVariancePercent > 0 ? `+${b.euiVariancePercent}%` : `${b.euiVariancePercent}%`}
                  </span>
                </div>
              </div>

              {/* Pattern Explanation & Action */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs">
                <div className="text-[11px] text-slate-300 leading-snug">
                  <span className="font-semibold text-slate-200 block mb-0.5">Pattern Analysis:</span>
                  <p className="text-slate-400 leading-relaxed">{b.patternExplanation}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-emerald-400 block mb-0.5">Suggested Action:</span>
                  <p className="text-slate-300">{b.recommendedAction}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
