"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Calendar, Clock, ShieldCheck, Info } from "lucide-react";
import { HourlyForecastPoint, DailyForecastPoint } from "@/lib/ai/forecasting";

interface ForecastChartProps {
  hourly24h: HourlyForecastPoint[];
  daily7d: DailyForecastPoint[];
  category: string;
  confidencePercent: number;
}

export function CampusDemandForecastChart({
  hourly24h,
  daily7d,
  category,
  confidencePercent,
}: ForecastChartProps) {
  const [horizon, setHorizon] = useState<"24h" | "7d">("24h");

  const chartData: any[] = horizon === "24h"
    ? hourly24h.map((p) => ({
        ...p,
        displayLabel: p.label,
      }))
    : daily7d.map((p) => ({
        ...p,
        displayLabel: `${p.dayName} (${p.date.slice(5)})`,
      }));

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Campus Electricity Demand Forecasting
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase font-mono">
              {confidencePercent}% Statistical CI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Diurnal cyclical decomposition and EWMA trend with upper and lower statistical uncertainty bands.
          </p>
        </div>

        {/* Horizon Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setHorizon("24h")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              horizon === "24h"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Next 24 Hours</span>
          </button>
          <button
            onClick={() => setHorizon("7d")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              horizon === "7d"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Next 7 Days</span>
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="confidenceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis
              dataKey="displayLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-xl text-xs space-y-1.5 font-mono">
                    <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1">
                      {horizon === "24h" ? `Time: ${d.label} BST` : `Day: ${d.dayName} (${d.date})`}
                    </span>
                    <div className="text-emerald-400 font-bold">
                      Predicted Demand: {d.predictedKwh.toLocaleString()} kWh
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Upper Bound (90% CI): {d.upperBoundKwh.toLocaleString()} kWh</div>
                      <div>Lower Bound (90% CI): {d.lowerBoundKwh.toLocaleString()} kWh</div>
                      {d.isWeekend !== undefined && (
                        <div className="text-amber-400">
                          Profile: {d.isWeekend ? "Weekend Reduced Draw" : "Standard Academic Schedule"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
            />

            {/* Confidence Interval Band */}
            <Area
              type="monotone"
              dataKey="upperBoundKwh"
              stroke="transparent"
              fill="url(#confidenceArea)"
              name="90% Confidence Band (Upper)"
            />
            <Area
              type="monotone"
              dataKey="lowerBoundKwh"
              stroke="#059669"
              strokeDasharray="2 2"
              fill="transparent"
              name="Lower Uncertainty Bound"
            />

            {/* Central Forecast Line */}
            <Line
              type="monotone"
              dataKey="predictedKwh"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10b981" }}
              name="Projected Demand (kWh)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Explanatory Footer */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {horizon === "24h"
              ? "Hourly profile tracks 08:00–17:00 academic surge vs. 23:00–05:00 unoccupied baseload."
              : "7-Day projection models weekday operational schedules vs. Friday/Saturday weekend reductions."}
          </span>
        </div>
        <span className="font-mono text-slate-400 font-semibold uppercase text-[10px]">
          Z-Score Residual CI: ±1.645σ
        </span>
      </div>
    </div>
  );
}
