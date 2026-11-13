"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface SourceItem {
  name: string;
  value: number;
  color: string;
  unit: string;
}

interface ChartProps {
  distribution: SourceItem[];
  totalKwh: number;
}

export function SourceDistributionChart({ distribution, totalKwh }: ChartProps) {
  if (!distribution || distribution.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-500 text-xs">
        No distribution metrics available.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct = totalKwh > 0 ? ((data.value / totalKwh) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 p-2.5 rounded-xl shadow-2xl text-xs space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <span>{data.name}</span>
          </div>
          <div className="font-mono text-slate-300">
            {data.value.toLocaleString()} kWh ({pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-white">Campus Energy Source Mix</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Proportional contribution from each generation & incomer feed.
        </p>
      </div>

      <div className="h-60 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              stroke="#0f172a"
              strokeWidth={2}
            >
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-extrabold text-white font-mono">
            {totalKwh >= 1000 ? `${(totalKwh / 1000).toFixed(1)}k` : totalKwh}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">kWh Mix</span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
        {distribution.map((entry) => {
          const pct = totalKwh > 0 ? ((entry.value / totalKwh) * 100).toFixed(1) : 0;
          return (
            <div key={entry.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-[11px] text-slate-300 truncate">{entry.name}</span>
              </div>
              <span className="font-mono font-bold text-white text-[11px]">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
