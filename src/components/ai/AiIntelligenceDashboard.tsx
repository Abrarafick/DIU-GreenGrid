"use client";

import React, { useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Sun,
  ShieldAlert,
} from "lucide-react";
import { CampusDemandForecastChart } from "./CampusDemandForecastChart";
import { SolarForecastChart } from "./SolarForecastChart";
import { BuildingIntelligenceCards } from "./BuildingIntelligenceCards";
import { AnomalyAlertFeed } from "./AnomalyAlertFeed";
import { RecommendationsPanel } from "./RecommendationsPanel";
import { UserSession } from "@/types";

interface DashboardProps {
  initialForecasts: any;
  initialAnomalies: any;
  initialRecommendations: any;
  buildings: any[];
  user: UserSession | null;
}

export function AiIntelligenceDashboard({
  initialForecasts,
  initialAnomalies,
  initialRecommendations,
  buildings,
  user,
}: DashboardProps) {
  const [forecasts, setForecasts] = useState<any>(initialForecasts);
  const [anomalies, setAnomalies] = useState<any>(initialAnomalies);
  const [recommendations, setRecommendations] = useState<any>(initialRecommendations);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAiData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const bParam = selectedBuilding !== "ALL" ? `?buildingId=${selectedBuilding}` : "";
      const [fRes, aRes, rRes] = await Promise.all([
        fetch(`/api/ai/forecasts${bParam}`),
        fetch(`/api/ai/anomalies${bParam}`),
        fetch(`/api/ai/recommendations`),
      ]);

      if (!fRes.ok || !aRes.ok || !rRes.ok) {
        throw new Error("Failed to refresh AI intelligence metrics");
      }

      const [fJson, aJson, rJson] = await Promise.all([fRes.json(), aRes.json(), rRes.json()]);

      setForecasts(fJson);
      setAnomalies(aJson);
      setRecommendations(rJson);
    } catch (err: any) {
      setError(err.message || "Failed to update AI engine data");
    } finally {
      setIsLoading(false);
    }
  };

  const isSimulated = forecasts?.isSimulated || anomalies?.isSimulated || true;
  const categoryLabel = forecasts?.categoryLabel || "SIMULATED DEMONSTRATION";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Reliability Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
              AI Energy Intelligence & Predictive Analytics
            </h2>

            {/* AI Reliability Category Badge */}
            <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              {categoryLabel}
            </span>

            <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
              Model: {forecasts?.modelVersion || "v1.2.0-statistical-hybrid"}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            24-hour & 7-day cyclical demand projections, solar yield bell curves, statistical anomaly detection, and operational advisory.
          </p>
        </div>

        {/* Building Filter & Refresh */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Campus Facilities</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.code}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchAiData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
            title="Re-run AI Analytics Engine"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mandatory AI Reliability Notice */}
      {isSimulated && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold text-amber-300">Mandatory AI Transparency Notice: </span>
              <span>{forecasts?.dataSufficiencyNotice || "Predictions generated via deterministic simulation model for hackathon evaluation. Never present these simulated inferences as real physical DIU operational measurements."}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0 uppercase border border-amber-500/30">
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

      {/* Top Forecasts Grid: Campus Demand Forecast + Solar PV Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <CampusDemandForecastChart
            hourly24h={forecasts?.demand?.campusHourly24h || []}
            daily7d={forecasts?.demand?.campusDaily7d || []}
            category={forecasts?.category || "SIMULATED_DEMONSTRATION"}
            confidencePercent={forecasts?.demand?.overallConfidencePercent || 90}
          />
        </div>
        <div className="lg:col-span-5">
          {forecasts?.solar && <SolarForecastChart solarData={forecasts.solar} />}
        </div>
      </div>

      {/* Building-wise Energy Intelligence Diagnostics */}
      {anomalies?.buildingIntelligence && (
        <BuildingIntelligenceCards
          intelligenceList={anomalies.buildingIntelligence}
          onSelectBuilding={(code) => setSelectedBuilding(code)}
        />
      )}

      {/* Anomaly Event Feed + Actionable Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          <AnomalyAlertFeed anomalies={anomalies?.anomalies || []} />
        </div>
        <div className="lg:col-span-6">
          <RecommendationsPanel
            recommendations={recommendations?.recommendations || []}
            user={user}
            onRecommendationDispatched={fetchAiData}
          />
        </div>
      </div>
    </div>
  );
}
