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
      <div className="bg-emerald-50/90 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold tracking-wide uppercase">Data Source: Live Integrated Adapter</span>
          <span className="text-emerald-700">({sourceName})</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-700 font-medium">
          <span>Confidence Score: {(confidenceRating * 100).toFixed(0)}%</span>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="Demonstration Notice"
      className="bg-amber-50/95 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2 shadow-sm"
    >
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
          <AlertTriangle className="relative w-4 h-4 text-amber-600 shrink-0" />
        </div>
        <div>
          <span className="font-bold tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300 uppercase text-[11px] mr-2">
            Data Source: Simulated / Demo Mode
          </span>
          <span className="text-amber-900 font-semibold">
            Evaluation Transparency Notice:
          </span>{" "}
          <span className="text-amber-800">
            Metrics are generated using deterministic synthetic profiles for hackathon evaluation. No physical DIU hardware or electrical infrastructure was installed or accessed.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-amber-800 text-[11px] font-mono">
        <span className="bg-white/80 px-2.5 py-1 rounded border border-amber-200">
          Source: {sourceName}
        </span>
        <span className="bg-white/80 px-2.5 py-1 rounded border border-amber-200">
          Verification: Synthetic Baseline
        </span>
      </div>
    </aside>
  );
}
