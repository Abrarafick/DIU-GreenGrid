"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Zap, Sun, Flame, Leaf } from "lucide-react";

interface TrendPoint {
  timestamp: string;
  label: string;
  consumptionKwh: number;
  solarKwh: number;
  dieselKwh: number;
  biogasKwh: number;
  gridKwh: number;
  renewableKwh: number;
  renewablePercent: number;
}

interface ChartProps {
  data: TrendPoint[];
}

export function GenerationVsConsumptionChart({ data }: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-500 text-xs">
        No telemetry trends available for the selected filter range.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">
            {label}
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 font-mono">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="font-sans text-slate-300">{entry.name}:</span>
              </span>
              <span className="font-bold text-white">{entry.value.toLocaleString()} kWh</span>
            </div>
          ))}
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
            <Zap className="w-4 h-4 text-emerald-400" />
            Generation vs. Campus Consumption Multi-Source Profile
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized comparison between total facility demand, solar PV output, grid import, and auxiliary generation.
          </p>
        </div>
        <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
          Unit: kWh / Interval
        </span>
      </div>

      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="label"
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
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              iconType="circle"
            />

            {/* Solar PV Area */}
            <Area
              type="monotone"
              dataKey="solarKwh"
              name="Rooftop Solar PV"
              stroke="#eab308"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#solarGradient)"
            />

            {/* Grid Incomer Area */}
            <Area
              type="monotone"
              dataKey="gridKwh"
              name="Government Grid Import"
              stroke="#3b82f6"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#gridGradient)"
            />

            {/* Campus Total Consumption Line */}
            <Line
              type="monotone"
              dataKey="consumptionKwh"
              name="Total Campus Demand"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={{ r: 2, fill: "#06b6d4" }}
              activeDot={{ r: 5 }}
            />

            {/* Generator kWh Line */}
            <Line
              type="monotone"
              dataKey="dieselKwh"
              name="Diesel Generator"
              stroke="#f97316"
              strokeWidth={1.5}
              dot={false}
            />

            {/* Biogas Output Line */}
            <Line
              type="monotone"
              dataKey="biogasKwh"
              name="Biogas Pilot"
              stroke="#84cc16"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
