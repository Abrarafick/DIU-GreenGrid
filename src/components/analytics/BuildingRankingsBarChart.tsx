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
        <div className="bg-[#0b1c15]/95 border border-emerald-500/30 p-3 rounded-2xl shadow-2xl text-xs space-y-1.5 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1 gap-3">
            <span className="font-bold text-white font-display">{bldg?.name || label}</span>
            <span className="font-mono text-[#6ee7b7] font-bold">{label}</span>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-emerald-100/80">
              <span>Daytime Peak (08-17h):</span>
              <span className="font-bold text-[#6ee7b7]">{bldg?.peakUsageKwh.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between text-emerald-300/60">
              <span>Off-Peak Baseload:</span>
              <span className="font-bold text-emerald-200">{bldg?.offPeakUsageKwh.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between text-emerald-400 border-t border-emerald-500/20 pt-1 font-bold">
              <span>EUI (kWh/m²):</span>
              <span>{bldg?.euiKwhPerSqm}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/10 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Campus Building Consumption Ranking & Peak vs. Off-Peak Split
          </h3>
          <p className="text-xs text-emerald-200/60 mt-0.5">
            Ranked from highest facility load to lowest, with daytime peak vs. off-peak baseload segregation across 9 facilities.
          </p>
        </div>
        <span className="text-[11px] text-emerald-300 font-mono clay-pill px-3 py-1">
          Ranked by Total kWh
        </span>
      </div>

      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rankings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#143023" vertical={false} />
            <XAxis
              dataKey="code"
              stroke="#6ee7b7"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#143023" }}
            />
            <YAxis
              stroke="#6ee7b7"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#143023" }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />

            <Bar
              dataKey="peakUsageKwh"
              name="Daytime Peak (08:00 - 17:00)"
              stackId="a"
              fill="#10b981"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="offPeakUsageKwh"
              name="Off-Peak / Night Baseload"
              stackId="a"
              fill="#064e3b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* High-Consumption Callout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-emerald-500/10">
        {rankings.map((b, idx) => (
          <div
            key={b.id}
            className={`p-3.5 rounded-2xl border space-y-1.5 transition-all ${
              b.code === "FabLab"
                ? "bg-emerald-950/40 border-[#6ee7b7]/40 shadow-[0_2px_12px_rgba(110,231,183,0.15)]"
                : b.isHighConsumer
                ? "bg-[#0c1e16]/80 border-emerald-500/30"
                : "bg-[#091611]/60 border-emerald-500/15"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className={`font-mono font-bold ${b.code === "FabLab" ? "text-[#6ee7b7]" : "text-emerald-400"}`}>
                  {b.code}
                </span>
                <span className="text-white font-semibold truncate max-w-[120px]">{b.name}</span>
              </div>
              {b.code === "FabLab" ? (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[#6ee7b7] border border-emerald-500/40 font-bold uppercase clay-badge">
                  Maker Lab
                </span>
              ) : b.isHighConsumer ? (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold uppercase clay-badge">
                  Rank #{idx + 1}
                </span>
              ) : null}
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[11px] text-emerald-300/70">Total: {b.totalConsumptionKwh.toLocaleString()} kWh</span>
              <span className="text-white font-bold">{b.percentageOfTotal}% share</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-400/60 pt-1 border-t border-emerald-500/15 font-mono">
              <span>EUI: {b.euiKwhPerSqm} kWh/m²</span>
              <span>Peak: {b.peakFractionPercent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
