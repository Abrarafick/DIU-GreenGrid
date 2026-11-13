"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap, AlertCircle, RefreshCw } from "lucide-react";
import { ActionableRecommendation, RecommendationPriority } from "@/lib/ai/recommendations";
import { UserSession } from "@/types";

interface RecommendationsPanelProps {
  recommendations: ActionableRecommendation[];
  user: UserSession | null;
  onRecommendationDispatched?: () => void;
}

export function RecommendationsPanel({
  recommendations,
  user,
  onRecommendationDispatched,
}: RecommendationsPanelProps) {
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localRecs, setLocalRecs] = useState<ActionableRecommendation[]>(recommendations);

  const canDispatch = user?.role === "ADMIN" || user?.role === "FACILITY_MANAGER";

  const handleDispatch = async (rec: ActionableRecommendation) => {
    setDispatchingId(rec.id);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/recommendations/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: rec.id,
          title: rec.title,
          detectedIssue: rec.detectedIssue,
          suggestedAction: rec.suggestedAction,
          assignedUnit: rec.assignedUnit,
          priority: rec.priority,
          targetBuildingCode: rec.targetBuildingCode,
          estimatedWeeklyKwhSavings: rec.estimatedWeeklyKwhSavings,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to convert recommendation");
      }

      const json = await res.json();
      setSuccessMessage(`Successfully dispatched '${rec.title}' to Action Management!`);

      // Update local item status
      setLocalRecs((prev) =>
        prev.map((r) =>
          r.id === rec.id
            ? { ...r, status: "CONVERTED_TO_ACTION", linkedActionId: json.actionItem?.id }
            : r
        )
      );

      if (onRecommendationDispatched) {
        onRecommendationDispatched();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setDispatchingId(null);
    }
  };

  const getPriorityBadge = (priority: RecommendationPriority) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "HIGH":
        return "bg-orange-500/15 text-orange-300 border-orange-500/30";
      case "MEDIUM":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "LOW":
      default:
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Actionable AI Energy Optimization Recommendations
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase font-mono">
              Engineering Advisory
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational interventions generated from root-cause anomaly detection. Strictly non-financial; measured in technical kWh savings.
          </p>
        </div>

        <div className="text-[11px] text-slate-400 font-mono bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {localRecs.length} Actionable Recommendations
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {localRecs.map((rec) => {
          const isConverted = rec.status === "CONVERTED_TO_ACTION";
          const isPending = dispatchingId === rec.id;

          return (
            <div
              key={rec.id}
              className={`p-5 rounded-xl border transition-all ${
                isConverted
                  ? "bg-slate-950/40 border-slate-800/60 opacity-80"
                  : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono border ${getPriorityBadge(
                        rec.priority
                      )}`}
                    >
                      {rec.priority} PRIORITY
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {rec.targetBuildingCode}
                    </span>
                    <span className="text-[11px] text-slate-400 font-sans">
                      Assigned: <strong className="text-slate-300">{rec.assignedUnit}</strong>
                    </span>
                    {isConverted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Dispatched to Action Item
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white">{rec.title}</h4>

                  {/* Core Content Grid */}
                  <div className="space-y-2 text-xs">
                    <div className="text-[11px] leading-relaxed text-slate-300">
                      <span className="font-semibold text-slate-200">Detected Issue: </span>
                      {rec.detectedIssue}
                    </div>

                    <div className="text-[11px] leading-relaxed text-slate-400">
                      <span className="font-semibold text-slate-300">Supporting Evidence: </span>
                      {rec.supportingEvidence}
                    </div>

                    <div className="text-[11px] leading-relaxed text-slate-400">
                      <span className="font-semibold text-slate-300">Technical Reasoning: </span>
                      {rec.technicalReasoning}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-300">
                      <span className="font-semibold text-emerald-200 block mb-0.5">
                        Suggested Operational Intervention:
                      </span>
                      {rec.suggestedAction}
                    </div>
                  </div>
                </div>

                {/* Right Action / Savings Column */}
                <div className="lg:w-64 shrink-0 space-y-3 flex flex-col justify-between pt-2 lg:pt-0 lg:border-l lg:border-slate-800/80 lg:pl-4">
                  {/* Estimated Savings Pill */}
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs space-y-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block tracking-wider font-mono">
                      Estimated Technical Impact
                    </span>
                    <div className="text-lg font-bold text-emerald-300 font-mono">
                      ~{rec.estimatedWeeklyKwhSavings.toLocaleString()} kWh/week
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {rec.expectedOutcomeNotice}
                    </p>
                  </div>

                  {/* Dispatch Action Item Button */}
                  {canDispatch ? (
                    <button
                      onClick={() => handleDispatch(rec)}
                      disabled={isConverted || isPending}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        isConverted
                          ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700/60"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95"
                      }`}
                    >
                      {isPending ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : isConverted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Dispatched</span>
                        </>
                      ) : (
                        <>
                          <span>Dispatch as Action Item</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-400 text-center font-mono">
                      Auditor view (read-only)
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
