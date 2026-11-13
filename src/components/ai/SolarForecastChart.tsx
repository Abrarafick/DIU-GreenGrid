"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Sun, CloudSun, AlertCircle, Info, Zap } from "lucide-react";
import { SolarForecastResponse } from "@/lib/ai/solar";

interface SolarForecastProps {
  solarData: SolarForecastResponse;
}

export function SolarForecastChart({ solarData }: SolarForecastProps) {
  const isWeatherDisconnected =
    solarData.weatherIntegrationStatus === "UNAVAILABLE (HISTORICAL_CLEAR_SKY_ESTIMATE)";

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Solar PV Generation Forecasting (850 kWp Rooftop)
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono border ${
                isWeatherDisconnected
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              }`}
            >
              {isWeatherDisconnected ? "CLEAR-SKY MODEL (NO LIVE WEATHER)" : "WEATHER API CONNECTED"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Diurnal solar radiation model parameterized for Ashulia latitude (23.8763° N) and 850 kWp installed PV.
          </p>
        </div>

        {/* 24-Hour Projected Yield Pill */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20 text-xs text-right self-start sm:self-auto font-mono">
          <span className="text-[10px] text-slate-400 uppercase block">Next 24h Projected Yield</span>
          <span className="text-base font-bold text-amber-400">
            {solarData.estimatedNext24hYieldKwh.toLocaleString()} kWh
          </span>
        </div>
      </div>

      {/* Mandatory Weather Transparency Notice */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/30 text-xs text-slate-300 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-0.5 text-[11px] leading-relaxed">
          <span className="font-bold text-amber-300">Weather Transparency Standard: </span>
          <span className="text-slate-400">{solarData.weatherNotice}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={solarData.diurnalCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="solarArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, "auto"]} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-xl text-xs space-y-1.5 font-mono">
                    <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1">
                      Time: {d.label} BST
                    </span>
                    <div className="text-amber-400 font-bold">
                      Predicted Output: {d.predictedKw.toLocaleString()} kW ({d.predictedKwh.toLocaleString()} kWh)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Clear-Sky Benchmark: {d.clearSkyBenchmarkKwh.toLocaleString()} kW
                    </div>
                    {d.isPeakGenerationWindow && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        Peak Solar Window (Optimal Self-Consumption)
                      </span>
                    )}
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
            />

            <Area
              type="monotone"
              dataKey="predictedKw"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#solarArea)"
              name="Forecasted Generation (kW)"
            />
            <Line
              type="monotone"
              dataKey="clearSkyBenchmarkKwh"
              stroke="#fbbf24"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              dot={false}
              name="Clear-Sky Theoretical Maximum (kW)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Renewable Self-Consumption Optimization Notice */}
      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-start gap-2.5">
        <Zap className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
        <div className="space-y-0.5 text-[11px] leading-relaxed">
          <span className="font-bold text-emerald-200">Renewable Self-Consumption Guidance: </span>
          <span className="text-emerald-300/90">{solarData.selfConsumptionOpportunityNotice}</span>
        </div>
      </div>
    </div>
  );
}
