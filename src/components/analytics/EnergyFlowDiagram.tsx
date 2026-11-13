"use client";

import React, { useState } from "react";
import { Zap, Sun, Flame, Leaf, Building2, ShieldCheck, ArrowRight } from "lucide-react";

interface EnergyFlowProps {
  flowData: {
    sources: Array<{ name: string; kwh: number; type: string; color: string }>;
    hub: { name: string; totalThroughputKwh: number };
    consumers: Array<{ code: string; name: string; kwh: number; percentage: number }>;
    architectureNotice: string;
  };
}

export function EnergyFlowDiagram({ flowData }: EnergyFlowProps) {
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);
  const [hoveredConsumer, setHoveredConsumer] = useState<string | null>(null);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "SOLAR":
        return <Sun className="w-4 h-4 text-amber-400" />;
      case "BIOGAS":
        return <Leaf className="w-4 h-4 text-lime-400" />;
      case "GENERATOR":
        return <Flame className="w-4 h-4 text-orange-400" />;
      case "GRID":
      default:
        return <Zap className="w-4 h-4 text-blue-400" />;
    }
  };

  const totalKwh = flowData.hub.totalThroughputKwh || 1;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
      {/* Header & Constraints */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Interactive Campus Energy Flow Architecture
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronous electricity distribution from active power feeds through the campus substation bus into monitored facilities.
          </p>
        </div>
        <div className="text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 flex items-center gap-1.5 self-start md:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>{flowData.architectureNotice}</span>
        </div>
      </div>

      {/* 3-Column Flow Layout: Sources -> Hub -> Consumers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Column: Generation & Incomer Sources (4 Cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
            Active Energy Sources
          </span>

          {flowData.sources.map((source) => {
            const pct = Number(((source.kwh / totalKwh) * 100).toFixed(1));
            const isHovered = hoveredSource === source.name;
            return (
              <div
                key={source.name}
                onMouseEnter={() => setHoveredSource(source.name)}
                onMouseLeave={() => setHoveredSource(null)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? "bg-slate-800/90 border-emerald-500/60 shadow-lg"
                    : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(source.type)}
                    <span className="text-xs font-bold text-slate-200">{source.name}</span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono"
                    style={{ color: source.color, backgroundColor: `${source.color}15` }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-400">Total Feed:</span>
                  <span className="font-mono font-bold text-white">{source.kwh.toLocaleString()} kWh</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Column: Central Substation Distribution Hub (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-700/80 shadow-2xl relative">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-2">
            <Zap className="w-6 h-6 fill-emerald-400/20" />
          </div>

          <h4 className="text-xs font-bold text-white text-center tracking-tight">
            DIU Sub-station Distribution Bus
          </h4>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
            Synchronous Main Incomer
          </span>

          <div className="mt-3 text-center">
            <div className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">
              {totalKwh.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">
              Total Throughput (kWh)
            </span>
          </div>

          <div className="w-full mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Bus Voltage: 11 kV / 415 V</span>
            <span className="text-emerald-400 font-bold">100% Synchronized</span>
          </div>
        </div>

        {/* Right Column: Campus Consumer Facilities (4 Cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
            Monitored Campus Facilities
          </span>

          {flowData.consumers.map((c) => {
            const isHovered = hoveredConsumer === c.code;
            return (
              <div
                key={c.code}
                onMouseEnter={() => setHoveredConsumer(c.code)}
                onMouseLeave={() => setHoveredConsumer(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? "bg-slate-800/90 border-cyan-500/60 shadow-lg"
                    : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-mono font-bold text-emerald-400">{c.code}</span>
                    <span className="text-slate-300 text-[11px] truncate max-w-[120px]">{c.name}</span>
                  </div>
                  <span className="font-mono text-cyan-300 font-semibold text-[11px]">
                    {c.percentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 pt-1 border-t border-slate-800/60 font-mono">
                  <span>Draw:</span>
                  <span className="font-bold text-white">{c.kwh.toLocaleString()} kWh</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
