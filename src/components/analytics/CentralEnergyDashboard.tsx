"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Sun,
  Flame,
  Leaf,
  RefreshCw,
  Filter,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { UserSession } from "@/types";
import { EnergyFlowDiagram } from "./EnergyFlowDiagram";
import { GenerationVsConsumptionChart } from "./GenerationVsConsumptionChart";
import { SourceDistributionChart } from "./SourceDistributionChart";
import { BuildingRankingsBarChart } from "./BuildingRankingsBarChart";
import { ConsumptionHeatmap } from "./ConsumptionHeatmap";
import { RenewableAnalyticsCard } from "./RenewableAnalyticsCard";

interface CentralDashboardProps {
  initialData: any;
  user: UserSession | null;
  buildings: any[];
  energySources: any[];
}

export function CentralEnergyDashboard({
  initialData,
  user,
  buildings,
  energySources,
}: CentralDashboardProps) {
  const [data, setData] = useState<any>(initialData);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("7d");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("ALL");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch updated analytics when filters change
  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("timeRange", timeRange);
      if (selectedBuilding !== "ALL") params.set("buildingId", selectedBuilding);
      if (selectedSource !== "ALL") params.set("sourceId", selectedSource);

      const res = await fetch(`/api/analytics/overview?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load analytics");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedBuilding, selectedSource]);

  const summary = data?.summary;
  const energyFlow = data?.energyFlow;
  const buildingRankings = data?.buildingRankings || [];
  const timeSeriesTrends = data?.timeSeriesTrends || [];
  const energySourceDistribution = data?.energySourceDistribution || [];
  const heatmap = data?.heatmap || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Filter & Scope Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Campus Energy & Real-Time Analytics
            </h2>

            {/* Dynamic Data Freshness Status */}
            {summary?.freshnessStatus === "SIMULATED" && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                {summary.freshnessBadge || "SIMULATED (DEMO MODE)"}
              </span>
            )}
            {summary?.freshnessStatus === "LIVE" && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {summary.freshnessBadge || "LIVE FEED (<15M)"}
              </span>
            )}
            {summary?.freshnessStatus === "RECENT" && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 uppercase font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                {summary.freshnessBadge || "RECENT (LAST 24H)"}
              </span>
            )}
            {summary?.freshnessStatus === "STALE" && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                {summary.freshnessBadge || "STALE DATA (>24H)"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs text-slate-400">
              Synchronized technical metering across Government Grid, Solar PV, Standby Generator, and Biogas.
            </p>
            {summary?.latestReadingTimestamp && (
              <span className="text-[11px] text-slate-400 font-mono">
                • Latest Record: {new Date(summary.latestReadingTimestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(["24h", "7d", "30d", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all uppercase ${
                  timeRange === range
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Building Filter */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Campus Facilities</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>

          {/* Energy Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Energy Sources</option>
            {energySources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Manual Refresh */}
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Prominent Data Provenance Transparency Notice */}
      {summary?.isSimulated && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold text-amber-300">Ethical Data Notice: </span>
              <span>
                Campus metrics currently reflect a deterministic simulation model for hackathon evaluation.
                Never present these figures as live DIU physical telemetry.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0 uppercase border border-amber-500/30">
            SIMULATED_DEMO
          </span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Metrics Bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Total Demand */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 block truncate">Total Campus Demand</span>
            <div className="text-xl font-bold text-white font-mono">
              {summary.totalCampusConsumptionKwh.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-400">kWh</span>
            </div>
            <div className="text-[10px] text-slate-400">Recorded interval sum</div>
          </div>

          {/* Card 2: Solar PV Generation */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/20 space-y-1">
            <span className="text-[11px] font-medium text-amber-400 flex items-center justify-between">
              <span>Solar PV Yield</span>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <div className="text-xl font-bold text-amber-400 font-mono">
              {summary.solarGenerationKwh.toLocaleString()}{" "}
              <span className="text-xs font-normal text-amber-300/80">kWh</span>
            </div>
            <div className="text-[10px] text-slate-400">850 kWp installed PV</div>
          </div>

          {/* Card 3: Grid Import */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/20 space-y-1">
            <span className="text-[11px] font-medium text-blue-400 flex items-center justify-between">
              <span>Grid Incomer</span>
              <Zap className="w-3.5 h-3.5 text-blue-400" />
            </span>
            <div className="text-xl font-bold text-blue-400 font-mono">
              {summary.gridImportKwh.toLocaleString()}{" "}
              <span className="text-xs font-normal text-blue-300/80">kWh</span>
            </div>
            <div className="text-[10px] text-slate-400">{summary.gridDependencyPercent}% dependency</div>
          </div>

          {/* Card 4: Generator Fuel & Electricity */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-orange-500/20 space-y-1">
            <span className="text-[11px] font-medium text-orange-400 flex items-center justify-between">
              <span>Standby Genset</span>
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </span>
            <div className="text-xl font-bold text-orange-400 font-mono">
              {summary.dieselLitresConsumed}{" "}
              <span className="text-xs font-normal text-orange-300/80">Litres</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Output: {summary.dieselGenerationKwh} kWh
            </div>
          </div>

          {/* Card 5: Biogas Generation */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-lime-500/20 space-y-1">
            <span className="text-[11px] font-medium text-lime-400 flex items-center justify-between">
              <span>Biogas Pilot</span>
              <Leaf className="w-3.5 h-3.5 text-lime-400" />
            </span>
            <div className="text-xl font-bold text-lime-400 font-mono">
              {summary.biogasGenerationKwh.toLocaleString()}{" "}
              <span className="text-xs font-normal text-lime-300/80">kWh</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Status: Pilot Digester
            </div>
          </div>

          {/* Card 6: Renewable Share (Estimated Self-Consumption) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1 bg-gradient-to-b from-emerald-950/20 to-slate-900">
            <span className="text-[11px] font-medium text-emerald-400 flex items-center justify-between">
              <span>Clean Energy</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="text-xl font-bold text-emerald-300 font-mono">
              {summary.renewableContributionPercent}%
            </div>
            <div className="text-[10px] text-slate-400 truncate" title="Consumed clean energy ratio">
              Self-Consumed Clean Share
            </div>
          </div>
        </div>
      )}

      {/* Energy Balance & Boundary Loss Accounting Panel */}
      {summary && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Campus Energy Balance & Sub-Station Boundary Accounting
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                UNMASKED DISCREPANCY
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Energy Accounting Standard: Total Incomers ≠ Monitored Building Sum
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metric A: Total Energy Inputs */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Total Energy Inputs (Incomers)</span>
              <div className="text-xl font-bold text-white font-mono">
                {(summary.totalEnergyInputsKwh ?? summary.totalCampusConsumptionKwh).toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-400">kWh</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Grid: {summary.gridImportKwh.toLocaleString()} | Solar: {summary.solarGenerationKwh.toLocaleString()} | Gen: {summary.dieselGenerationKwh.toLocaleString()}
              </div>
            </div>

            {/* Metric B: Monitored Facility Consumption */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Monitored Building Consumption</span>
              <div className="text-xl font-bold text-cyan-300 font-mono">
                {summary.totalCampusConsumptionKwh.toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-400">kWh</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Sum of 5 campus facility distribution sub-panels
              </div>
            </div>

            {/* Metric C: Energy Balance Residual */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-1">
              <span className="text-[11px] text-amber-300 font-semibold flex items-center justify-between">
                <span>Energy Balance Residual (Δ)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {summary.residualPercent ?? 0}%
                </span>
              </span>
              <div className="text-xl font-bold text-amber-300 font-mono">
                {(summary.energyBalanceResidualKwh ?? 0) > 0
                  ? `+${(summary.energyBalanceResidualKwh ?? 0).toLocaleString()}`
                  : (summary.energyBalanceResidualKwh ?? 0).toLocaleString()}{" "}
                <span className="text-xs font-normal text-amber-400/80">kWh</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Physical transformer losses + busbar impedance
              </div>
            </div>
          </div>

          {/* Documented Accounting Boundary Statement */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 text-[11px] block">
              Energy Accounting Boundary Documentation:
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              {summary.accountingBoundary ||
                "Accounting Boundary: 11kV Substation Incomers vs. 415V Building Sub-metering Panels. Energy Balance Residual (+4.2% to +5.8%) reflects physical 11kV/415V transformer iron/copper losses, distribution circuit impedance, unmetered auxiliary substation loads, campus perimeter lighting, and interval solar surplus. No values are forced or concealed."}
            </p>
          </div>
        </div>
      )}

      {/* Energy Flow Interactive Visualization */}
      {energyFlow && <EnergyFlowDiagram flowData={energyFlow} />}

      {/* Charts Grid: Multi-Source Trend (8 cols) + Source Mix (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <GenerationVsConsumptionChart data={timeSeriesTrends} />
        </div>
        <div className="lg:col-span-4">
          <SourceDistributionChart
            distribution={energySourceDistribution}
            totalKwh={summary?.totalCampusConsumptionKwh || 0}
          />
        </div>
      </div>

      {/* Building-wise Consumption Ranking & Peak vs Off-Peak */}
      <BuildingRankingsBarChart rankings={buildingRankings} />

      {/* Renewable Energy Analytics & Heatmap Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          <RenewableAnalyticsCard
            solarKwh={summary?.solarGenerationKwh || 0}
            biogasKwh={summary?.biogasGenerationKwh || 0}
            totalRenewableKwh={summary?.totalRenewableGenerationKwh || 0}
            renewableConsumedKwh={summary?.renewableConsumedKwh}
            renewableSurplusKwh={summary?.renewableSurplusKwh}
            renewableSharePercent={summary?.renewableContributionPercent || 0}
            gridDependencyPercent={summary?.gridDependencyPercent || 0}
            carbonAvoidedKg={summary?.carbonAvoidedKg || 0}
            isSelfConsumptionEstimated={summary?.isSelfConsumptionEstimated}
            selfConsumptionAssumption={summary?.selfConsumptionAssumption}
          />
        </div>
        <div className="lg:col-span-6">
          <ConsumptionHeatmap data={heatmap} />
        </div>
      </div>

      {/* Provenance Audit Footer */}
      {summary?.provenanceBreakdown && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Active Provenance Audit Breakdown:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
              Live API: {summary.provenanceBreakdown.REAL_API}
            </span>
            <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
              CSV/Excel: {summary.provenanceBreakdown.CSV_IMPORT}
            </span>
            <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">
              Manual Log: {summary.provenanceBreakdown.MANUAL_ENTRY}
            </span>
            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
              Simulated Demo: {summary.provenanceBreakdown.SIMULATED_DEMO}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
