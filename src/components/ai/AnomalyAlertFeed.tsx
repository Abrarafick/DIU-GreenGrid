"use client";

import React, { useState } from "react";
import { AlertTriangle, AlertCircle, Clock, ArrowUpRight, Filter, ShieldAlert } from "lucide-react";
import { DetectedAnomaly, AnomalySeverity } from "@/lib/ai/anomaly";

interface AnomalyAlertFeedProps {
  anomalies: DetectedAnomaly[];
}

export function AnomalyAlertFeed({ anomalies }: AnomalyAlertFeedProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

  const filtered =
    selectedSeverity === "ALL"
      ? anomalies
      : anomalies.filter((a) => a.severity === selectedSeverity);

  const getSeverityStyle = (severity: AnomalySeverity) => {
    switch (severity) {
      case "CRITICAL":
        return {
          badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
          border: "border-rose-500/30",
          iconColor: "text-rose-400",
        };
      case "HIGH":
        return {
          badge: "bg-orange-500/15 text-orange-300 border-orange-500/30",
          border: "border-orange-500/30",
          iconColor: "text-orange-400",
        };
      case "MEDIUM":
        return {
          badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          border: "border-amber-500/30",
          iconColor: "text-amber-400",
        };
      case "LOW":
      default:
        return {
          badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
          border: "border-blue-500/30",
          iconColor: "text-blue-400",
        };
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              AI Anomaly Detection Event Feed
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase font-mono">
              {filtered.length} Active Events
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical Z-Score outliers, nighttime HVAC leaks, sudden midday solar drops, and off-hour draw.
          </p>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto font-mono">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all uppercase text-[11px] ${
                selectedSeverity === sev
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Anomaly Feed Items */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No active anomalies matching the selected filter.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((anom) => {
            const style = getSeverityStyle(anom.severity);
            return (
              <div
                key={anom.id}
                className={`p-4 rounded-xl bg-slate-950/70 border ${style.border} space-y-3 transition-all`}
              >
                {/* Event Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono border ${style.badge}`}
                    >
                      {anom.severity} SEVERITY
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {anom.buildingCode}
                    </span>
                    <span className="text-xs font-bold text-white">{anom.anomalyLabel}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{anom.formattedTime}</span>
                  </div>
                </div>

                {/* Empirical Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs py-2 px-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Observed Value:</span>
                    <span className="font-bold text-rose-300">
                      {anom.observedValue.toLocaleString()} {anom.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Expected Baseline:</span>
                    <span className="font-bold text-slate-300">
                      {anom.expectedBaseline.toLocaleString()} {anom.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Deviation:</span>
                    <span className="font-bold text-amber-400">
                      {anom.deviationPercent > 0 ? `+${anom.deviationPercent}%` : `${anom.deviationPercent}%`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Statistical Z-Score:</span>
                    <span className="font-bold text-cyan-300">
                      {anom.zScore !== null ? `+${anom.zScore}σ` : "N/A (Step Loss)"}
                    </span>
                  </div>
                </div>

                {/* Evidence & Root Cause */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="text-[11px] leading-relaxed text-slate-300">
                    <span className="font-semibold text-slate-200">Supporting Evidence: </span>
                    {anom.supportingEvidence}
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-400">
                    <span className="font-semibold text-slate-300">Detected Root Cause: </span>
                    {anom.detectedRootCause}
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300">
                    <span className="font-semibold text-emerald-200">Suggested Action: </span>
                    {anom.suggestedAction}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
