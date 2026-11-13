"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Building2, AlertTriangle, Layers, TrendingUp } from "lucide-react";

interface BuildingRanking {
  id: string;
  code: string;
  name: string;
  primaryFunction: string;
  totalFloorAreaSqM: number;
  occupancyCapacity: number;
  totalConsumptionKwh: number;
  percentageOfTotal: number;
  euiKwhPerSqm: number;
  peakUsageKwh: number;
  offPeakUsageKwh: number;
  peakFractionPercent: number;
  isHighConsumer: boolean;
}

interface RankingsProps {
  rankings: BuildingRanking[];
}

export function BuildingRankingsBarChart({ rankings }: RankingsProps) {
  if (!rankings || rankings.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-500 text-xs">
        No building rankings available.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const bldg = rankings.find((r) => r.code === label);
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-bold text-white">{bldg?.name || label}</span>
            <span className="font-mono text-emerald-400 font-bold">{label}</span>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Peak Usage (08-17h):</span>
              <span className="font-bold text-cyan-400">{bldg?.peakUsageKwh.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Off-Peak Baseload:</span>
              <span className="font-bold text-slate-300">{bldg?.offPeakUsageKwh.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between text-emerald-400 border-t border-slate-800 pt-1">
              <span>EUI (kWh/m²):</span>
              <span className="font-bold">{bldg?.euiKwhPerSqm}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Campus Building Consumption Ranking & Peak vs. Off-Peak Split
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked from highest facility load to lowest, with daytime peak vs. off-peak baseload segregation.
          </p>
        </div>
        <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
          Ranked by Total kWh
        </span>
      </div>

      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rankings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="code"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />

            <Bar
              dataKey="peakUsageKwh"
              name="Daytime Peak (08:00 - 17:00)"
              stackId="a"
              fill="#06b6d4"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="offPeakUsageKwh"
              name="Off-Peak / Night Baseload"
              stackId="a"
              fill="#334155"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* High-Consumption Callout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
        {rankings.map((b, idx) => (
          <div
            key={b.id}
            className={`p-3 rounded-xl border space-y-1.5 ${
              b.isHighConsumer
                ? "bg-slate-950/80 border-cyan-500/30"
                : "bg-slate-950/50 border-slate-800/80"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-emerald-400">{b.code}</span>
                <span className="text-slate-300 font-semibold truncate max-w-[120px]">{b.name}</span>
              </div>
              {b.isHighConsumer && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  Rank #{idx + 1}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[11px] text-slate-400">Total: {b.totalConsumptionKwh.toLocaleString()} kWh</span>
              <span className="text-white font-bold">{b.percentageOfTotal}% share</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
              <span>EUI: {b.euiKwhPerSqm} kWh/m²</span>
              <span>Peak: {b.peakFractionPercent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
