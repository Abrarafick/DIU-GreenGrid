import React from "react";
import { db } from "@/lib/db";
import { CheckSquare, CheckCircle, Clock, AlertTriangle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ActionsPage() {
  const actions = await db.actionImprovement.findMany({
    orderBy: { reportedAt: "desc" },
    include: { targetBuilding: true },
  });

  const totalVerifiedSavings = actions.reduce(
    (sum, a) => sum + (a.verifiedKwhSavings || 0),
    0
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            Action & Improvement Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational energy conservation initiatives: issue detection, team assignment, baseline vs. after-intervention consumption, and verified kWh savings.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Verified Savings</div>
            <div className="text-base font-bold text-emerald-300 font-mono">
              {totalVerifiedSavings.toLocaleString()} kWh Saved
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {actions.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    item.completionStatus === "COMPLETED_VERIFIED"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {item.completionStatus.replace(/_/g, " ")}
                </span>
                <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                {item.targetBuilding && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                    {item.targetBuilding.code}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400">
                Assigned Team: <span className="font-semibold text-slate-200">{item.assignedTeam}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-400 block">
                  Detected Energy Leak / Issue:
                </span>
                <p className="text-slate-300 leading-relaxed">{item.detectedIssue}</p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                  Recommended Technical Action:
                </span>
                <p className="text-slate-300 leading-relaxed">{item.recommendedAction}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] text-slate-400 block">Before Baseline</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {item.beforeKwh !== null ? `${item.beforeKwh} kWh` : "Pending baseline"}
                  </span>
                </div>
                {item.afterKwh !== null && (
                  <>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">After Measured</span>
                      <span className="font-mono text-emerald-300 font-bold">{item.afterKwh} kWh</span>
                    </div>
                  </>
                )}
                {item.verificationMethod && (
                  <div className="hidden lg:block border-l border-slate-800 pl-4">
                    <span className="text-[10px] text-slate-400 block">Verification Method</span>
                    <span className="text-slate-300 text-[11px]">{item.verificationMethod}</span>
                  </div>
                )}
              </div>

              {item.verifiedKwhSavings !== null ? (
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified Savings: {item.verifiedKwhSavings} kWh</span>
                </div>
              ) : (
                <div className="text-[11px] text-amber-400/80 italic flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Verification cycle in measurement</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
