"use client";

import React from "react";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

interface DataSourceBannerProps {
  isSimulated?: boolean;
  confidenceRating?: number;
  sourceName?: string;
}

export function DataSourceBanner({
  isSimulated = true,
  confidenceRating = 0.0,
  sourceName = "Hackathon Evaluation Simulation Engine",
}: DataSourceBannerProps) {
  if (!isSimulated) {
    return (
      <div className="bg-emerald-950/60 border-b border-emerald-500/30 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold tracking-wide uppercase">Data Source: Live Integrated Adapter</span>
          <span className="text-emerald-400/80">({sourceName})</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <span>Confidence Score: {(confidenceRating * 100).toFixed(0)}%</span>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="Demonstration Notice"
      className="bg-amber-950/70 border-b border-amber-500/40 px-4 py-2.5 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
          <AlertTriangle className="relative w-4 h-4 text-amber-400 shrink-0" />
        </div>
        <div>
          <span className="font-bold tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 uppercase text-[11px] mr-2">
            Data Source: Simulated / Demo Mode
          </span>
          <span className="text-amber-100 font-medium">
            Evaluation Transparency Notice:
          </span>{" "}
          <span className="text-amber-200/90">
            Metrics are generated using deterministic synthetic profiles for hackathon evaluation. No physical DIU hardware or electrical infrastructure was installed or accessed.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-amber-300/80 text-[11px]">
        <span className="bg-slate-900/80 px-2 py-1 rounded border border-amber-500/20">
          Source: {sourceName}
        </span>
        <span className="bg-slate-900/80 px-2 py-1 rounded border border-amber-500/20">
          Verification: Synthetic Baseline
        </span>
      </div>
    </aside>
  );
}
