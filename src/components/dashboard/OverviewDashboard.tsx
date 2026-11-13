"use client";

import React, { useState } from "react";
import {
  Zap,
  Sun,
  Flame,
  Leaf,
  CheckCircle,
  Clock,
  Building2,
  Sliders,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  Biohazard,
  Info,
} from "lucide-react";
import { UserSession } from "@/types";

interface OverviewData {
  summary: {
    totalKwhConsumed: number;
    totalSolarGeneratedKwh: number;
    renewableSharePercent: number;
    dieselLitres: number; // Strictly technical monitoring
    generatorRuntimeHours: number;
    carbonEmittedKg: number;
    carbonAvoidedKg: number;
    totalVerifiedKwhSavings: number;
    isSimulated: boolean;
    dataProvenanceNotice: string;
  };
  buildings: Array<{
    id: string;
    code: string;
    name: string;
    totalFloorAreaSqM: number;
    occupancyCapacity: number;
    primaryFunction: string;
    recordedKwh: number;
    solarContributionKwh: number;
    euiKwhPerSqm: number;
  }>;
  energySources: Array<{
    id: string;
    code: string;
    name: string;
    sourceType: string;
    ratedCapacityKw: number;
    configuredProvider: string;
    monitoringMethod: string;
    operationalStatus?: string;
    isActive?: boolean;
  }>;
  emissionFactors: Array<{
    id: string;
    factorKey: string;
    factorName: string;
    unit: string;
    value: number;
    sourceDocumentation: string;
    methodology?: string;
    assumptions: string;
    isAuthoritative?: boolean;
  }>;
  actionItems: Array<{
    id: string;
    title: string;
    detectedIssue: string;
    recommendedAction: string;
    assignedTeam: string;
    completionStatus: string;
    priority: string;
    beforeKwh?: number | null;
    afterKwh?: number | null;
    verifiedKwhSavings?: number | null;
  }>;
}

interface OverviewDashboardProps {
  initialData: OverviewData;
  user: UserSession | null;
}

export function OverviewDashboard({ initialData, user }: OverviewDashboardProps) {
  const [data, setData] = useState<OverviewData>(initialData);
  const [showFactorModal, setShowFactorModal] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<any>(null);
  const [factorValue, setFactorValue] = useState("");
  const [factorAssumptions, setFactorAssumptions] = useState("");
  const [factorError, setFactorError] = useState("");
  const [savingFactor, setSavingFactor] = useState(false);

  // Quick Action Modal State
  const [showActionModal, setShowActionModal] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState("");
  const [newActionIssue, setNewActionIssue] = useState("");
  const [newActionRecommendation, setNewActionRecommendation] = useState("");
  const [newActionTeam, setNewActionTeam] = useState("Electrical Maintenance Unit");
  const [newActionPriority, setNewActionPriority] = useState("MEDIUM");
  const [newActionBuilding, setNewActionBuilding] = useState(data.buildings[0]?.id || "");
  const [newActionBeforeKwh, setNewActionBeforeKwh] = useState("");
  const [newActionAfterKwh, setNewActionAfterKwh] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const canEdit = user?.role === "ADMIN" || user?.role === "FACILITY_MANAGER";

  const handleEditFactor = (factor: any) => {
    setSelectedFactor(factor);
    setFactorValue(factor.value.toString());
    setFactorAssumptions(factor.assumptions || "");
    setFactorError("");
    setShowFactorModal(true);
  };

  const handleSaveFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFactorError("");
    const num = parseFloat(factorValue);
    if (isNaN(num) || num <= 0) {
      setFactorError("Please enter a valid positive number.");
      return;
    }

    setSavingFactor(true);
    try {
      const res = await fetch("/api/emission-factors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedFactor.id,
          value: num,
          assumptions: factorAssumptions,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update factor");
      }

      const refresh = await fetch("/api/overview");
      const updated = await refresh.json();
      setData(updated);
      setShowFactorModal(false);
    } catch (err: any) {
      setFactorError(err.message);
    } finally {
      setSavingFactor(false);
    }
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionSubmitting(true);
    try {
      const payload: any = {
        title: newActionTitle,
        detectedIssue: newActionIssue,
        recommendedAction: newActionRecommendation,
        assignedTeam: newActionTeam,
        priority: newActionPriority,
        targetBuildingId: newActionBuilding || null,
      };

      if (newActionBeforeKwh) payload.beforeKwh = parseFloat(newActionBeforeKwh);
      if (newActionAfterKwh) payload.afterKwh = parseFloat(newActionAfterKwh);

      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create action");
      }

      const refresh = await fetch("/api/overview");
      const updated = await refresh.json();
      setData(updated);
      setShowActionModal(false);
      setNewActionTitle("");
      setNewActionIssue("");
      setNewActionRecommendation("");
      setNewActionBeforeKwh("");
      setNewActionAfterKwh("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Scope */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Campus Energy & Grid Balance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time technical energy monitoring, carbon offset accounting, and verified reduction initiatives.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowActionModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Energy Improvement Action</span>
          </button>
        )}
      </div>

      {/* Primary KPI Metrics (Strictly Technical - No Financials) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Consumption */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Energy Consumed</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">
              {data.summary.totalKwhConsumed.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-400">kWh</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across 5 monitored campus facilities</p>
          </div>
        </div>

        {/* Card 2: Solar PV Generation */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Solar PV Generated</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-400">
              {data.summary.totalSolarGeneratedKwh.toLocaleString()}{" "}
              <span className="text-xs font-normal text-amber-300/80">kWh</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {data.summary.renewableSharePercent}% Clean Share
              </span>
              <span className="text-[11px] text-slate-400">850 kWp installed</span>
            </div>
          </div>
        </div>

        {/* Card 3: Diesel Generator Technical Monitoring (Litres, Zero Financials) */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Generator Fuel & Runtime</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-orange-400">
              {data.summary.dieselLitres}{" "}
              <span className="text-xs font-normal text-orange-300/80">Litres</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-300">
                {data.summary.generatorRuntimeHours} operating hrs
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                • Technical Log
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Verified kWh Savings */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 relative overflow-hidden bg-gradient-to-b from-emerald-950/20 to-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Verified Action Savings</span>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-300">
              {data.summary.totalVerifiedKwhSavings.toLocaleString()}{" "}
              <span className="text-xs font-normal text-emerald-400">kWh Saved</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              From verified facility efficiency interventions
            </p>
          </div>
        </div>
      </div>

      {/* Grid Power Architecture Notice & Sources (Including Biogas Pilot with UNVERIFIED Label) */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Configured Campus Energy Sources & Operational Status
            </h3>
          </div>
          <div className="text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Architecture: No battery storage or automated controls assumed. Biogas pilot unverified.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.energySources.map((source) => {
            const isUnverified = source.operationalStatus === "UNVERIFIED_PILOT" || !source.isActive;
            return (
              <div
                key={source.id}
                className={`p-3.5 rounded-lg border space-y-2 ${
                  isUnverified
                    ? "bg-slate-950/40 border-slate-800/60 opacity-80"
                    : "bg-slate-950/70 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{source.name}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      source.sourceType === "SOLAR"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : source.sourceType === "GRID"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : source.sourceType === "BIOGAS"
                        ? "bg-lime-500/20 text-lime-300 border border-lime-500/30"
                        : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                    }`}
                  >
                    {source.sourceType}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                      isUnverified
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {source.operationalStatus === "UNVERIFIED_PILOT"
                      ? "UNVERIFIED / PILOT (0 kWh)"
                      : "OPERATIONAL"}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">{source.ratedCapacityKw} kW</span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Provider: <span className="text-slate-300">{source.configuredProvider}</span>
                </div>

                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  Method: {source.monitoringMethod.replace(/_/g, " ")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Building Consumption Analytics & EUI */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Campus Facilities & Energy Use Intensity (EUI)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            EUI Unit: <code className="text-cyan-300 bg-slate-800 px-1 py-0.5 rounded text-[11px]">kWh / m²</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="py-2.5 px-3 font-medium">Code</th>
                <th className="py-2.5 px-3 font-medium">Facility Name</th>
                <th className="py-2.5 px-3 font-medium">Primary Function</th>
                <th className="py-2.5 px-3 font-medium text-right">Floor Area (m²)</th>
                <th className="py-2.5 px-3 font-medium text-right">Occupancy</th>
                <th className="py-2.5 px-3 font-medium text-right">Recorded kWh</th>
                <th className="py-2.5 px-3 font-medium text-right">EUI (kWh/m²)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.buildings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">{b.code}</td>
                  <td className="py-3 px-3 font-semibold text-slate-200">{b.name}</td>
                  <td className="py-3 px-3 text-slate-400">{b.primaryFunction}</td>
                  <td className="py-3 px-3 text-right font-mono">{b.totalFloorAreaSqM.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-mono">{b.occupancyCapacity.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-mono text-white font-bold">
                    {b.recordedKwh.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                      {b.euiKwhPerSqm}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documented Emission Factors & Methodology Section */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Documented Carbon Emission Factors & Transparent Methodology
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Citations, conversion mathematics, and non-authoritative baseline disclaimers.
            </p>
          </div>
          <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
            Status: Reference Benchmark Defaults (Subject to Annual SREDA / DoE Verification)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.emissionFactors.map((factor) => (
            <div
              key={factor.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{factor.factorName}</span>
                {canEdit && (
                  <button
                    onClick={() => handleEditFactor(factor)}
                    className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/30 transition-colors"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Configure</span>
                  </button>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-emerald-400 font-mono">{factor.value}</span>
                <span className="text-xs text-slate-400">{factor.unit}</span>
                <span className="text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 ml-auto">
                  Non-Authoritative Benchmark
                </span>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 space-y-1.5">
                <div>
                  <span className="text-slate-400 font-medium">Source Citation: </span>
                  <span className="text-slate-300">{factor.sourceDocumentation}</span>
                </div>
                {factor.methodology && (
                  <div>
                    <span className="text-slate-400 font-medium">Calculation Methodology: </span>
                    <span className="text-slate-400 font-mono text-[10px]">{factor.methodology}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 font-medium">Assumptions & Caveats: </span>
                  <span className="text-slate-400">{factor.assumptions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action & Improvement Management Preview */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Action & Improvement Management
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Tracking Detected Issues, Teams, Before/After Consumption & Verified Savings
          </span>
        </div>

        <div className="space-y-3">
          {data.actionItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      item.completionStatus === "COMPLETED_VERIFIED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {item.completionStatus.replace(/_/g, " ")}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                </div>
                <div className="text-[11px] text-slate-400">
                  Assigned: <span className="font-semibold text-slate-300">{item.assignedTeam}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                    Detected Issue:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.detectedIssue}</p>
                </div>
                <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                    Recommended Action:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.recommendedAction}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  {item.beforeKwh !== null && item.beforeKwh !== undefined && (
                    <div className="text-slate-400 text-[11px]">
                      Baseline:{" "}
                      <span className="font-mono text-slate-200 font-semibold">{item.beforeKwh} kWh</span>
                    </div>
                  )}
                  {item.afterKwh !== null && item.afterKwh !== undefined && (
                    <div className="text-slate-400 text-[11px]">
                      Post-Action:{" "}
                      <span className="font-mono text-slate-200 font-semibold">{item.afterKwh} kWh</span>
                    </div>
                  )}
                </div>

                {item.verifiedKwhSavings !== null && item.verifiedKwhSavings !== undefined ? (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified Savings: {item.verifiedKwhSavings} kWh</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-400/80 italic">
                    Savings verification currently in measurement cycle
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Emission Factor Modal */}
      {showFactorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Configure {selectedFactor?.factorName}
            </h3>
            <p className="text-xs text-slate-400">
              Ensure updated values cite authorized national or IPCC benchmarks.
            </p>

            {factorError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {factorError}
              </div>
            )}

            <form onSubmit={handleSaveFactor} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Factor Numerical Value ({selectedFactor?.unit})
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={factorValue}
                  onChange={(e) => setFactorValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Calculation Assumptions & Citation Note
                </label>
                <textarea
                  value={factorAssumptions}
                  onChange={(e) => setFactorAssumptions(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFactorModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFactor}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {savingFactor ? "Saving..." : "Save Factor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Log Energy Improvement Action
            </h3>
            <p className="text-xs text-slate-400">
              Record detected energy issues, recommendations, and baseline/post-intervention measurements.
            </p>

            <form onSubmit={handleCreateAction} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Action Initiative Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. AB-01 Corridor Lighting Scheduling"
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Detected Issue
                </label>
                <textarea
                  placeholder="Describe the energy leak or abnormal surge observed..."
                  value={newActionIssue}
                  onChange={(e) => setNewActionIssue(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Recommended Action
                </label>
                <textarea
                  placeholder="Intervention steps to resolve the issue..."
                  value={newActionRecommendation}
                  onChange={(e) => setNewActionRecommendation(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assigned Team
                  </label>
                  <input
                    type="text"
                    value={newActionTeam}
                    onChange={(e) => setNewActionTeam(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Facility
                  </label>
                  <select
                    value={newActionBuilding}
                    onChange={(e) => setNewActionBuilding(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {data.buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Before Baseline (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Optional baseline"
                    value={newActionBeforeKwh}
                    onChange={(e) => setNewActionBeforeKwh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    After Measured (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Optional post-action"
                    value={newActionAfterKwh}
                    onChange={(e) => setNewActionAfterKwh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {actionSubmitting ? "Logging..." : "Create Action Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
