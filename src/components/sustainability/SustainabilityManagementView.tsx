"use client";

import React, { useState, useEffect } from "react";
import {
  Leaf,
  Globe,
  Sun,
  Factory,
  Recycle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface SustainabilityData {
  summary: {
    totalCampusDemandKwh: number;
    totalSolarKwh: number;
    totalBiogasKwh: number;
    totalDieselKwh: number;
    cleanRenewableConsumedKwh: number;
    cleanRenewableSurplusKwh: number;
    gridImportKwh: number;
    dieselLitresBurned: number;
    renewableSelfConsumptionPercent: number;
    gridDependencyPercent: number;
    grossCarbonKg: number;
    avoidedCarbonKg: number;
    netCarbonKg: number;
    scope1EmissionsKg: number;
    scope2EmissionsKg: number;
    verifiedKwhSavings: number;
    verifiedCarbonSavingsKg: number;
  };
  carbonAccounting: {
    accountingStandard: string;
    nonDoubleCountingProtocol: string;
    factors: Array<{
      factorKey: string;
      name: string;
      unit: string;
      value: number;
      source: string;
      methodology: string;
      assumptions: string;
      isAuthoritative: boolean;
    }>;
  };
  sdgProgress: Array<{
    sdgCode: string;
    sdgNumber: number;
    sdgTitle: string;
    color: string;
    overallProgressPercent: number;
    achievedCount: number;
    onTrackCount: number;
    atRiskCount: number;
    indicators: Array<{
      code: string;
      name: string;
      sdgCategory: string;
      sdgTitle: string;
      unit: string;
      baselineValue: number;
      currentValue: number;
      targetValue: number;
      remainingGap: number;
      progressPercent: number;
      status: string;
      calculationMethod: string;
      documentedAssumptions: string;
      evidenceSource: string;
    }>;
  }>;
  historicalTrend: Array<{
    date: string;
    demandKwh: number;
    solarKwh: number;
    biogasKwh: number;
    cleanConsumedKwh: number;
    cleanSurplusKwh: number;
    gridImportKwh: number;
    cleanSharePercent: number;
    grossCarbonKg: number;
    avoidedCarbonKg: number;
    netCarbonKg: number;
  }>;
  targetsCount: number;
  actionsCount: number;
  verifiedActionsCount: number;
}

export function SustainabilityManagementView() {
  const [data, setData] = useState<SustainabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "sdgs" | "carbon" | "targets" | "reports">("overview");
  const [expandedSdg, setExpandedSdg] = useState<string | null>("SDG_7");
  const [showAddTargetModal, setShowAddTargetModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  // New Target Form State
  const [targetForm, setTargetForm] = useState({
    title: "",
    sdgCategory: "SDG_7",
    targetPeriod: "Q4 2026",
    baselineValue: "",
    targetValue: "",
    currentValue: "",
    unit: "%",
    targetYear: "2026",
    responsibleUnit: "DIU Sustainability Committee & Facilities Division",
    notes: "",
  });
  const [submittingTarget, setSubmittingTarget] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/sustainability/overview");
      if (!res.ok) throw new Error("Failed to fetch sustainability data");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load sustainability overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownload = async (format: "csv" | "excel", reportType: string = "all") => {
    try {
      setExportingFormat(format);
      const res = await fetch(`/api/sustainability/export?format=${format}&report=${reportType}`);
      if (!res.ok) throw new Error("Failed to export report");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DIU_GreenGrid_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.${
        format === "csv" ? "csv" : "xlsx"
      }`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert("Export failed: " + err.message);
    } finally {
      setExportingFormat(null);
    }
  };

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingTarget(true);
      const res = await fetch("/api/sustainability/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetForm,
          baselineValue: parseFloat(targetForm.baselineValue),
          targetValue: parseFloat(targetForm.targetValue),
          currentValue: targetForm.currentValue ? parseFloat(targetForm.currentValue) : parseFloat(targetForm.baselineValue),
          targetYear: parseInt(targetForm.targetYear, 10),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create target");
      }

      setShowAddTargetModal(false);
      setTargetForm({
        title: "",
        sdgCategory: "SDG_7",
        targetPeriod: "Q4 2026",
        baselineValue: "",
        targetValue: "",
        currentValue: "",
        unit: "%",
        targetYear: "2026",
        responsibleUnit: "DIU Sustainability Committee & Facilities Division",
        notes: "",
      });
      fetchData();
    } catch (err: any) {
      alert("Target creation failed: " + err.message);
    } finally {
      setSubmittingTarget(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400">Computing campus sustainability & SDG indicators...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{error || "Failed to load sustainability metrics"}</span>
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, carbonAccounting, sdgProgress, historicalTrend } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
            Sustainability & UN Sustainable Development Goals (SDG)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Empirical environmental accounting for Daffodil International University. Fully mapped to SDG 7, 9, 12, and 13.
            Strictly non-financial (kWh, litres, kg CO₂e).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleDownload("excel", "all")}
            disabled={exportingFormat !== null}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exportingFormat === "excel" ? "Generating..." : "Export Excel (.xlsx)"}</span>
          </button>

          <button
            onClick={() => handleDownload("csv", "all")}
            disabled={exportingFormat !== null}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 border border-slate-700"
          >
            <FileText className="w-4 h-4" />
            <span>{exportingFormat === "csv" ? "Generating..." : "Export CSV"}</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700"
            title="Open printable summary view"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
            title="Refresh calculations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2">
        {[
          { id: "overview", label: "Executive Overview & Trends", icon: TrendingUp },
          { id: "sdgs", label: "SDG Indicators & Gaps", icon: Target },
          { id: "carbon", label: "GHG Accounting & Inventory", icon: Globe },
          { id: "targets", label: "Target Management", icon: ShieldCheck },
          { id: "reports", label: "Reporting & Export Hub", icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top 4 Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Renewable Contribution */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-amber-300">Clean Energy Contribution</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-300">
                {summary.renewableSelfConsumptionPercent}%
              </div>
              <div className="text-[11px] text-slate-400">
                Target: <span className="font-bold text-slate-300">50.0%</span> • Gap:{" "}
                <span className="font-bold text-amber-400 font-mono">
                  {Math.max(0, 50.0 - summary.renewableSelfConsumptionPercent).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, (summary.renewableSelfConsumptionPercent / 50.0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Grid Dependency */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-cyan-300">Grid Utility Dependency</span>
                <Factory className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-300">
                {summary.gridDependencyPercent}%
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Net Import:</span>
                <span className="font-mono text-slate-200">{summary.gridImportKwh.toLocaleString()} kWh</span>
              </div>
              <div className="text-[10px] text-slate-500 italic">
                Substation incomer supply deficit
              </div>
            </div>

            {/* Avoided Emissions */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-emerald-300">Avoided GHG Emissions</span>
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-300">
                {summary.avoidedCarbonKg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Clean Consumed:</span>
                <span className="font-mono text-emerald-400">{summary.cleanRenewableConsumedKwh.toLocaleString()} kWh</span>
              </div>
              <div className="text-[10px] text-emerald-400/80 font-medium">
                ✓ Non-double-counted boundary applied
              </div>
            </div>

            {/* Verified Savings */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-purple-300">Verified Action Reductions</span>
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-purple-300">
                {summary.verifiedKwhSavings.toLocaleString()} <span className="text-xs font-normal text-slate-400">kWh</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>GHG Reduction:</span>
                <span className="font-mono text-purple-300">{summary.verifiedCarbonSavingsKg} kg CO₂e</span>
              </div>
              <div className="text-[10px] text-slate-400">
                From {data.verifiedActionsCount} audited conservation projects
              </div>
            </div>
          </div>

          {/* Renewable Self-Consumption vs Surplus Explanatory Callout */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3 max-w-3xl">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200">
                  Analytical Precision: Renewable Generation vs. Campus Self-Consumption
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Total rooftop solar generated was <strong className="text-slate-200 font-mono">{summary.totalSolarKwh.toLocaleString()} kWh</strong>.
                  Of this, <strong className="text-emerald-400 font-mono">{summary.cleanRenewableConsumedKwh.toLocaleString()} kWh</strong> was directly consumed
                  by campus buildings to displace grid import. The surplus of <strong className="text-amber-400 font-mono">{summary.cleanRenewableSurplusKwh.toLocaleString()} kWh</strong> occurred
                  during midday peak solar hours when generation exceeded demand. In compliance with strict carbon accounting standards,
                  this unutilized surplus is accounted separately and is <em>never</em> credited as avoided emissions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-right font-mono text-xs border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Gross Generated</div>
                <div className="text-slate-200 font-bold">{(summary.totalSolarKwh + summary.totalBiogasKwh).toLocaleString()} kWh</div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-400 uppercase">Self-Consumed</div>
                <div className="text-emerald-300 font-bold">{summary.cleanRenewableConsumedKwh.toLocaleString()} kWh</div>
              </div>
              <div>
                <div className="text-[10px] text-amber-400 uppercase">Unused Surplus</div>
                <div className="text-amber-300 font-bold">{summary.cleanRenewableSurplusKwh.toLocaleString()} kWh</div>
              </div>
            </div>
          </div>

          {/* Historical Sustainability Trend Chart */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Historical Sustainability & Emissions Trajectory
                </h3>
                <p className="text-[11px] text-slate-400">
                  Daily trend of campus demand, consumed clean solar, and net carbon footprint (kg CO₂e).
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {historicalTrend.length} Days Evaluated
              </div>
            </div>

            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historicalTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fontSize: 10 }} unit=" kWh" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 10 }} unit=" kg" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar yAxisId="left" dataKey="demandKwh" name="Campus Demand (kWh)" fill="#3b82f6" opacity={0.6} radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="cleanConsumedKwh" name="Clean Energy Consumed (kWh)" fill="#10b981" opacity={0.8} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="grossCarbonKg" name="Gross Carbon (kg CO₂e)" stroke="#f87171" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="netCarbonKg" name="Net Carbon (kg CO₂e)" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SDG INDICATORS & GAPS */}
      {activeTab === "sdgs" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sdgProgress.map((sdg) => (
              <div
                key={sdg.sdgCode}
                onClick={() => setExpandedSdg(expandedSdg === sdg.sdgCode ? null : sdg.sdgCode)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  expandedSdg === sdg.sdgCode
                    ? "bg-slate-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase"
                    style={{ backgroundColor: `${sdg.color}20`, color: sdg.color }}
                  >
                    SDG {sdg.sdgNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">
                    {sdg.overallProgressPercent}% Achieved
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2 leading-tight">{sdg.sdgTitle}</h4>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${sdg.overallProgressPercent}%`, backgroundColor: sdg.color }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>{sdg.indicators.length} indicators</span>
                  <div className="flex items-center gap-1 font-semibold text-emerald-400">
                    <span>{expandedSdg === sdg.sdgCode ? "Collapse" : "Inspect Gaps"}</span>
                    {expandedSdg === sdg.sdgCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Drilldown Details for Selected SDG */}
          {expandedSdg && (
            <div className="space-y-4">
              {sdgProgress
                .filter((s) => s.sdgCode === expandedSdg)
                .map((sdg) => (
                  <div key={sdg.sdgCode} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: sdg.color }}
                        />
                        SDG {sdg.sdgNumber}: {sdg.sdgTitle} — Quantified Indicator Framework
                      </h3>
                      <span className="text-xs text-slate-400">
                        {sdg.achievedCount} Achieved • {sdg.onTrackCount} On Track • {sdg.atRiskCount} Needs Attention
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {sdg.indicators.map((ind) => (
                        <div
                          key={ind.code}
                          className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-200 font-mono">
                                  Indicator {ind.code}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                    ind.status === "ACHIEVED"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : ind.status === "ON_TRACK"
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  }`}
                                >
                                  {ind.status.replace(/_/g, " ")}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold text-white">{ind.name}</h4>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xl font-bold font-mono text-emerald-400">
                                {ind.currentValue}
                              </span>
                              <span className="text-xs text-slate-400 ml-1">{ind.unit}</span>
                            </div>
                          </div>

                          {/* Baseline vs Current vs Target vs Remaining Gap */}
                          <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center font-mono">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-sans">Baseline</span>
                              <span className="text-xs font-bold text-slate-400">{ind.baselineValue} {ind.unit}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-sans">Current</span>
                              <span className="text-xs font-bold text-slate-200">{ind.currentValue} {ind.unit}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-sans">Target</span>
                              <span className="text-xs font-bold text-emerald-400">{ind.targetValue} {ind.unit}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-sans">Gap to Goal</span>
                              <span className="text-xs font-bold text-amber-400">{ind.remainingGap} {ind.unit}</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Target Realization Progress:</span>
                              <span className="font-bold text-slate-200 font-mono">{ind.progressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, ind.progressPercent)}%`,
                                  backgroundColor: sdg.color,
                                }}
                              />
                            </div>
                          </div>

                          {/* Documentation, Method & Evidence */}
                          <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Mathematical Formulation:
                              </span>
                              <code className="text-[11px] text-slate-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 block mt-0.5">
                                {ind.calculationMethod}
                              </code>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Assumptions & Accounting Boundary:
                              </span>
                              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                                {ind.documentedAssumptions}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Auditable Evidence Source:
                              </span>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                🔗 {ind.evidenceSource}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GHG ACCOUNTING & INVENTORY */}
      {activeTab === "carbon" && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                Greenhouse Gas (GHG) Corporate Protocol Inventory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated strictly in accordance with the <em>GHG Protocol Corporate Accounting and Reporting Standard</em> (Operational Control Approach).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-400">Scope 1 (Direct Emissions)</span>
                <div className="text-xl font-bold font-mono text-slate-200">
                  {summary.scope1EmissionsKg.toLocaleString()} <span className="text-xs text-slate-400">kg CO₂e</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Combustion of {summary.dieselLitresBurned} L diesel fuel in standby backup generators.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400">Scope 2 (Indirect Emissions)</span>
                <div className="text-xl font-bold font-mono text-slate-200">
                  {summary.scope2EmissionsKg.toLocaleString()} <span className="text-xs text-slate-400">kg CO₂e</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Purchased electricity imported from the national utility grid ({summary.gridImportKwh.toLocaleString()} kWh).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Net Operational Carbon Balance</span>
                <div className="text-xl font-bold font-mono text-emerald-300">
                  {summary.netCarbonKg.toLocaleString()} <span className="text-xs text-slate-400">kg CO₂e</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Gross footprint minus on-campus clean renewable avoided emissions.
                </p>
              </div>
            </div>

            {/* Anti-Double-Counting Protocol Card */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Strict Non-Double-Counting Protocol</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {carbonAccounting.nonDoubleCountingProtocol}
              </p>
            </div>
          </div>

          {/* Emission Factors Table */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Documented Emission Factors & Conversion Parameters
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                  <tr>
                    <th className="p-3">Factor Key</th>
                    <th className="p-3">Source & Title</th>
                    <th className="p-3">Numerical Value</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Methodology & Source Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {carbonAccounting.factors.map((f) => (
                    <tr key={f.factorKey} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-emerald-400">{f.factorKey}</td>
                      <td className="p-3 font-medium text-slate-200">{f.name}</td>
                      <td className="p-3 font-mono font-bold text-slate-100">{f.value}</td>
                      <td className="p-3 text-slate-400 font-mono">{f.unit}</td>
                      <td className="p-3 text-[11px] text-slate-400 max-w-md">
                        <strong>Source:</strong> {f.source}
                        <br />
                        <strong>Method:</strong> {f.methodology}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TARGET MANAGEMENT */}
      {activeTab === "targets" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                Institutional Sustainability Targets & Goals
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized administrators and facility managers can configure campus sustainability commitments.
              </p>
            </div>

            <button
              onClick={() => setShowAddTargetModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors self-start shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Define New Target</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sdgProgress.flatMap((s) => s.indicators).map((ind) => (
              <div
                key={ind.code}
                className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                    SDG {ind.code}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">2026 Milestone</span>
                </div>

                <h4 className="text-sm font-bold text-slate-100">{ind.name}</h4>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Current</span>
                    <span className="text-lg font-bold font-mono text-slate-200">{ind.currentValue} {ind.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Goal Target</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">{ind.targetValue} {ind.unit}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, ind.progressPercent)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Remaining Gap:</span>
                  <span className="font-mono font-bold text-amber-400">{ind.remainingGap} {ind.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REPORTING & EXPORT HUB */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                Formal Sustainability Reports & Data Export Center
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate auditable reports for DIU Syndicate, Academic Council, and international sustainability ranking submissions (THE Impact, UI GreenMetric).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                {
                  id: "monthly",
                  title: "Monthly Campus Sustainability Report",
                  desc: "Comprehensive monthly energy balance, demand, solar generation, grid import, and net carbon balances.",
                },
                {
                  id: "sdg",
                  title: "UN SDG Progress & Indicators Report",
                  desc: "Detailed indicators for SDG 7, 9, 12, 13 with mathematical formulations, baselines, targets, and gaps.",
                },
                {
                  id: "carbon",
                  title: "Carbon Accounting & GHG Inventory",
                  desc: "Scope 1 diesel combustion, Scope 2 grid emissions, and strictly non-double-counted avoided emissions.",
                },
                {
                  id: "actions",
                  title: "Green Campus Verified Savings Audit",
                  desc: "Complete audit trail of before-and-after kWh measurements, verified permanent savings, and engineering sign-offs.",
                },
                {
                  id: "all",
                  title: "Full Multi-Sheet Comprehensive Dossier",
                  desc: "All institutional sustainability sheets bundled into one formal Microsoft Excel (.xlsx) workbook.",
                },
              ].map((rep) => (
                <div
                  key={rep.id}
                  className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-100">{rep.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{rep.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleDownload("excel", rep.id)}
                      disabled={exportingFormat !== null}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Excel (.xlsx)</span>
                    </button>
                    <button
                      onClick={() => handleDownload("csv", rep.id)}
                      disabled={exportingFormat !== null}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD TARGET MODAL */}
      {showAddTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Define Institutional Sustainability Target
              </h3>
              <button
                onClick={() => setShowAddTargetModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTarget} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Achieve 50% Clean Energy Self-Consumption by Q4 2026"
                  value={targetForm.title}
                  onChange={(e) => setTargetForm({ ...targetForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SDG Category *</label>
                  <select
                    value={targetForm.sdgCategory}
                    onChange={(e) => setTargetForm({ ...targetForm, sdgCategory: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SDG_7">SDG 7 — Clean Energy</option>
                    <option value="SDG_9">SDG 9 — Infrastructure</option>
                    <option value="SDG_12">SDG 12 — Consumption</option>
                    <option value="SDG_13">SDG 13 — Climate Action</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Period *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 2026"
                    value={targetForm.targetPeriod}
                    onChange={(e) => setTargetForm({ ...targetForm, targetPeriod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Baseline Value *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="38.0"
                    value={targetForm.baselineValue}
                    onChange={(e) => setTargetForm({ ...targetForm, baselineValue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Goal *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="50.0"
                    value={targetForm.targetValue}
                    onChange={(e) => setTargetForm({ ...targetForm, targetValue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="%, kWh, kg CO2e"
                    value={targetForm.unit}
                    onChange={(e) => setTargetForm({ ...targetForm, unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Responsible Unit</label>
                <input
                  type="text"
                  value={targetForm.responsibleUnit}
                  onChange={(e) => setTargetForm({ ...targetForm, responsibleUnit: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTargetModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTarget}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingTarget ? "Saving..." : "Create Target"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT-FRIENDLY PDF SUMMARY VIEW MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-950 border border-slate-700 text-slate-900 rounded-2xl w-full max-w-4xl p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">DIU GreenGrid — Formal Sustainability Executive Summary</h2>
                  <p className="text-xs text-slate-400">Daffodil International University • Ashulia Smart Campus Operational Audit</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Dossier</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans">Total Campus Demand</span>
                  <div className="text-sm font-bold text-white">{summary.totalCampusDemandKwh.toLocaleString()} kWh</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans">Clean Energy Consumed</span>
                  <div className="text-sm font-bold text-emerald-400">{summary.cleanRenewableConsumedKwh.toLocaleString()} kWh</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans">Renewable Contribution</span>
                  <div className="text-sm font-bold text-amber-400">{summary.renewableSelfConsumptionPercent}%</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans">Net GHG Emissions</span>
                  <div className="text-sm font-bold text-purple-400">{summary.netCarbonKg.toLocaleString()} kg CO₂e</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-2">Sustainable Development Goals (SDG) Status</h4>
                <div className="space-y-2">
                  {sdgProgress.flatMap((s) => s.indicators).map((ind) => (
                    <div key={ind.code} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-emerald-400 font-mono">SDG {ind.code}:</span> {ind.name}
                        <span className="text-[11px] text-slate-400 block font-mono">Method: {ind.calculationMethod}</span>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="text-white font-bold">{ind.currentValue} {ind.unit}</span> / <span className="text-slate-400">{ind.targetValue} {ind.unit}</span>
                        <span className="text-[10px] text-amber-400 block">Gap: {ind.remainingGap} {ind.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                <p><strong>Accounting Standard:</strong> GHG Protocol Corporate Standard (Operational Control Approach).</p>
                <p><strong>Emission Factors:</strong> Bangladesh Grid Combined Margin (0.637 kg CO₂e/kWh, DoE), Diesel Fuel (2.68 kg CO₂e/L, IPCC 2006).</p>
                <p><strong>Verified Savings:</strong> {summary.verifiedKwhSavings.toLocaleString()} kWh permanent savings audited across {data.verifiedActionsCount} completed engineering interventions.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
