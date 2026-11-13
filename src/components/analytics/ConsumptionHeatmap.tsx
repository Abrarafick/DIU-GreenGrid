"use client";

import React, { useState } from "react";
import { Clock, Calendar } from "lucide-react";

interface HeatmapCell {
  day: string;
  hour: string;
  value: number; // average kWh
}

interface HeatmapProps {
  data: HeatmapCell[];
}

export function ConsumptionHeatmap({ data }: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-500 text-xs">
        No temporal heatmap data available.
      </div>
    );
  }

  // Calculate max value for color scaling
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

  // Heatmap color generator
  const getCellColor = (val: number) => {
    if (val === 0) return "bg-slate-950 border-slate-800/40 text-slate-600";
    const ratio = val / maxValue;
    if (ratio < 0.25) return "bg-emerald-950/40 border-emerald-900/40 text-emerald-300";
    if (ratio < 0.5) return "bg-emerald-900/50 border-emerald-700/50 text-emerald-200";
    if (ratio < 0.75) return "bg-emerald-600/60 border-emerald-500/60 text-emerald-100";
    return "bg-cyan-500/70 border-cyan-400 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]";
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Campus Demand Heatmap Matrix (Day of Week vs. Hour of Day)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Temporal load density distribution. Highlights peak lecture windows vs. off-hours idle energy baseload.
          </p>
        </div>

        {/* Legend Scale */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
          <span>Off-Peak</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
            <span className="w-3 h-3 rounded bg-emerald-950/40 border border-emerald-900/40" />
            <span className="w-3 h-3 rounded bg-emerald-900/50 border border-emerald-700/50" />
            <span className="w-3 h-3 rounded bg-emerald-600/60 border border-emerald-500/60" />
            <span className="w-3 h-3 rounded bg-cyan-500/70 border border-cyan-400" />
          </div>
          <span>Peak</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[550px]">
          {/* Header Row: Hours */}
          <div className="grid grid-cols-7 gap-2 pb-2 text-center text-xs font-mono text-slate-400 border-b border-slate-800/80">
            <div className="text-left pl-2 font-sans font-bold text-slate-300">Day / Hour</div>
            {hours.map((h) => (
              <div key={h} className="font-semibold">{h}</div>
            ))}
          </div>

          {/* Rows: Days */}
          <div className="space-y-2 pt-2">
            {days.map((day) => {
              const isWeekend = day === "Fri" || day === "Sat";
              return (
                <div key={day} className="grid grid-cols-7 gap-2 items-center text-xs">
                  <div className={`text-left pl-2 font-bold font-sans ${isWeekend ? "text-amber-400" : "text-slate-300"}`}>
                    {day} {isWeekend && <span className="text-[10px] text-slate-500 font-normal">(Wknd)</span>}
                  </div>

                  {hours.map((hour) => {
                    const cell = data.find((d) => d.day === day && d.hour === hour);
                    const val = cell ? cell.value : 0;
                    const isHovered = hoveredCell?.day === day && hoveredCell?.hour === hour;
                    return (
                      <div
                        key={`${day}-${hour}`}
                        onMouseEnter={() => setHoveredCell(cell || { day, hour, value: 0 })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-9 rounded-lg border flex items-center justify-center font-mono text-xs transition-all cursor-pointer ${getCellColor(
                          val
                        )} ${isHovered ? "scale-105 z-10" : ""}`}
                      >
                        {val > 0 ? `${Math.round(val)}` : "—"}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hover Readout */}
      {hoveredCell && (
        <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 flex items-center justify-between font-mono bg-slate-950/60 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-sans font-bold text-white">{hoveredCell.day} at {hoveredCell.hour}</span>
          </div>
          <div>
            Average Load: <span className="text-emerald-400 font-bold">{hoveredCell.value.toLocaleString()} kWh</span>
          </div>
        </div>
      )}
    </div>
  );
}
