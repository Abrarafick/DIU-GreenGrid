"use client";

import React, { useState } from "react";
import {
  Database,
  FileSpreadsheet,
  Upload,
  Download,
  PlusCircle,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Flame,
  Sun,
  Zap,
  Leaf,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  FileText,
} from "lucide-react";
import { UserSession } from "@/types";

interface IngestionViewProps {
  initialSources: any[];
  initialProvenances: any[];
  initialAdapters: any[];
  initialBatches: any[];
  initialReadings: any[];
  buildings: any[];
  user: UserSession | null;
}

export function EnergyDataIntegrationView({
  initialSources,
  initialProvenances,
  initialAdapters,
  initialBatches,
  initialReadings,
  buildings,
  user,
}: IngestionViewProps) {
  const [activeTab, setActiveTab] = useState<
    "sources" | "import" | "manual" | "adapters" | "readings" | "history"
  >("import");

  const [sources, setSources] = useState(initialSources);
  const [provenances, setProvenances] = useState(initialProvenances);
  const [adapters, setAdapters] = useState(initialAdapters);
  const [batches, setBatches] = useState(initialBatches);
  const [readings, setReadings] = useState(initialReadings);

  // File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadIsSimulated, setUploadIsSimulated] = useState(false);
  const [uploadBuilding, setUploadBuilding] = useState("");
  const [uploadSource, setUploadSource] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState("");

  // Manual Entry Form State
  const [manualTime, setManualTime] = useState(new Date().toISOString().slice(0, 16));
  const [manualSource, setManualSource] = useState(sources[0]?.id || "");
  const [manualBuilding, setManualBuilding] = useState("");
  const [manualKwh, setManualKwh] = useState("");
  const [manualSolarKwh, setManualSolarKwh] = useState("");
  const [manualDieselLitres, setManualDieselLitres] = useState("");
  const [manualGenHours, setManualGenHours] = useState("");
  const [manualGenKwh, setManualGenKwh] = useState("");
  const [manualBiogasM3, setManualBiogasM3] = useState("");
  const [manualBiogasKwh, setManualBiogasKwh] = useState("");
  const [manualPeakKw, setManualPeakKw] = useState("");
  const [manualPf, setManualPf] = useState("0.95");
  const [manualNotes, setManualNotes] = useState("");
  const [manualIsSimulated, setManualIsSimulated] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualFeedback, setManualFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Readings Filter State
  const [filterSource, setFilterSource] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterSimulated, setFilterSimulated] = useState("");
  const [isLoadingReadings, setIsLoadingReadings] = useState(false);

  // Syncing Adapter state
  const [syncingAdapterId, setSyncingAdapterId] = useState<string | null>(null);

  const canEdit = user?.role === "ADMIN" || user?.role === "FACILITY_MANAGER";

  // Refresh readings
  const refreshReadings = async () => {
    setIsLoadingReadings(true);
    try {
      const params = new URLSearchParams();
      if (filterSource) params.set("energySourceId", filterSource);
      if (filterBuilding) params.set("buildingId", filterBuilding);
      if (filterSimulated) params.set("isSimulated", filterSimulated);

      const res = await fetch(`/api/ingestion/readings?${params.toString()}`);
      const data = await res.json();
      if (data.readings) {
        setReadings(data.readings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingReadings(false);
    }
  };

  // Handle File Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a CSV or Excel file to upload.");
      return;
    }

    setUploadError("");
    setUploadResult(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("isSimulated", uploadIsSimulated ? "true" : "false");
      if (uploadBuilding) formData.append("buildingId", uploadBuilding);
      if (uploadSource) formData.append("energySourceId", uploadSource);
      if (uploadDescription) formData.append("description", uploadDescription);

      const res = await fetch("/api/ingestion/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadResult(data.summary);
      setUploadFile(null);

      // Refresh batches & readings
      const batchesRes = await fetch("/api/ingestion/history");
      const batchesData = await batchesRes.json();
      if (batchesData.batches) setBatches(batchesData.batches);
      refreshReadings();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Manual Data Entry Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualFeedback(null);
    setIsSubmittingManual(true);

    try {
      const payload: any = {
        timestamp: manualTime,
        energySourceId: manualSource || null,
        buildingId: manualBuilding || null,
        isSimulated: manualIsSimulated,
        notes: manualNotes,
      };

      if (manualKwh) payload.kwhConsumed = parseFloat(manualKwh);
      if (manualSolarKwh) payload.solarKwhGenerated = parseFloat(manualSolarKwh);
      if (manualDieselLitres) payload.dieselLitres = parseFloat(manualDieselLitres);
      if (manualGenHours) payload.generatorRuntimeHours = parseFloat(manualGenHours);
      if (manualGenKwh) payload.generatorKwhGenerated = parseFloat(manualGenKwh);
      if (manualBiogasM3) payload.biogasM3Consumed = parseFloat(manualBiogasM3);
      if (manualBiogasKwh) payload.biogasKwhGenerated = parseFloat(manualBiogasKwh);
      if (manualPeakKw) payload.peakDemandKw = parseFloat(manualPeakKw);
      if (manualPf) payload.powerFactor = parseFloat(manualPf);

      const res = await fetch("/api/ingestion/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setManualFeedback({
        type: "success",
        msg: `Reading successfully recorded. Net Carbon Avoided: ${data.carbonResult?.carbonKgAvoidedBySolar || 0} kg CO2e.`,
      });

      // Clear numbers
      setManualKwh("");
      setManualSolarKwh("");
      setManualDieselLitres("");
      setManualGenHours("");
      setManualGenKwh("");
      setManualBiogasM3("");
      setManualBiogasKwh("");
      setManualPeakKw("");
      setManualNotes("");

      refreshReadings();
    } catch (err: any) {
      setManualFeedback({ type: "error", msg: err.message });
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Handle Adapter Test Sync
  const handleTestAdapter = async (adapterId: string) => {
    setSyncingAdapterId(adapterId);
    try {
      const res = await fetch("/api/ingestion/adapters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adapterId, action: "TEST_SYNC" }),
      });
      const data = await res.json();
      if (data.adapter) {
        setAdapters((prev) =>
          prev.map((a) => (a.id === adapterId ? data.adapter : a))
        );
      }
      refreshReadings();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingAdapterId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          Energy Data Integration & Ingestion Portal
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Multi-source integration for Government Grid, Solar PV, Standby Generator, and Biogas. Supports CSV/Excel batch imports, authorized manual entries, and existing system API connectors.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("import")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "import"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>CSV & Excel Import</span>
        </button>

        <button
          onClick={() => setActiveTab("manual")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "manual"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Manual Log Entry</span>
        </button>

        <button
          onClick={() => setActiveTab("adapters")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "adapters"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>API Adapters</span>
        </button>

        <button
          onClick={() => setActiveTab("readings")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "readings"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Audit Reading Records ({readings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "history"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Import History ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sources")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "sources"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Configured Sources</span>
        </button>
      </div>

      {/* TAB 1: CSV & EXCEL IMPORT */}
      {activeTab === "import" && (
        <div className="space-y-6">
          {/* Downloadable Templates Section */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Download Standard Ingestion Templates
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Pre-formatted CSV templates with validation headers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              <a
                href="/api/ingestion/templates/grid_meters"
                download
                className="p-3 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 flex flex-col justify-between text-xs transition-colors group"
              >
                <div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase block">Grid Incomer</span>
                  <div className="font-semibold text-slate-200 mt-1">Grid & Buildings</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 group-hover:translate-x-0.5 transition-transform mt-3">
                  <span>Download CSV</span>
                  <Download className="w-3 h-3" />
                </div>
              </a>

              <a
                href="/api/ingestion/templates/solar_inverters"
                download
                className="p-3 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 flex flex-col justify-between text-xs transition-colors group"
              >
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">Solar PV</span>
                  <div className="font-semibold text-slate-200 mt-1">Inverter Export</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 group-hover:translate-x-0.5 transition-transform mt-3">
                  <span>Download CSV</span>
                  <Download className="w-3 h-3" />
                </div>
              </a>

              <a
                href="/api/ingestion/templates/diesel_generator"
                download
                className="p-3 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 flex flex-col justify-between text-xs transition-colors group"
              >
                <div>
                  <span className="text-[10px] text-orange-400 font-bold uppercase block">Genset</span>
                  <div className="font-semibold text-slate-200 mt-1">Diesel & Runtime</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 group-hover:translate-x-0.5 transition-transform mt-3">
                  <span>Download CSV</span>
                  <Download className="w-3 h-3" />
                </div>
              </a>

              <a
                href="/api/ingestion/templates/biogas_pilot"
                download
                className="p-3 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 flex flex-col justify-between text-xs transition-colors group"
              >
                <div>
                  <span className="text-[10px] text-lime-400 font-bold uppercase block">Biogas</span>
                  <div className="font-semibold text-slate-200 mt-1">Pilot Production</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 group-hover:translate-x-0.5 transition-transform mt-3">
                  <span>Download CSV</span>
                  <Download className="w-3 h-3" />
                </div>
              </a>

              <a
                href="/api/ingestion/templates/unified_multi_source"
                download
                className="p-3 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 flex flex-col justify-between text-xs transition-colors group"
              >
                <div>
                  <span className="text-[10px] text-purple-400 font-bold uppercase block">Master</span>
                  <div className="font-semibold text-slate-200 mt-1">Unified Multi-Source</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 group-hover:translate-x-0.5 transition-transform mt-3">
                  <span>Download CSV</span>
                  <Download className="w-3 h-3" />
                </div>
              </a>
            </div>
          </div>

          {/* Upload Form Box */}
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Upload Energy Spreadsheets</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically checks for duplicates, normalizes units, validates date formats, and computes carbon indicators.
              </p>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-6 text-center transition-colors bg-slate-950/50">
                <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs text-slate-300 font-medium">
                  {uploadFile ? uploadFile.name : "Select or drag & drop a CSV or Excel (.xlsx, .xls) file"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Maximum file size: 15 MB</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="mt-3 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                />
              </div>

              {/* Ingestion Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Facility Override (Optional)
                  </label>
                  <select
                    value={uploadBuilding}
                    onChange={(e) => setUploadBuilding(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Auto-detect from building_code column</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Energy Source Override (Optional)
                  </label>
                  <select
                    value={uploadSource}
                    onChange={(e) => setUploadSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Auto-detect from source_code column</option>
                    {sources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.sourceType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Dataset Provenance Tag
                  </label>
                  <div className="flex items-center gap-2 pt-1.5">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={uploadIsSimulated}
                        onChange={(e) => setUploadIsSimulated(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900 w-4 h-4"
                      />
                      <span className={uploadIsSimulated ? "text-amber-300 font-bold" : "text-slate-300"}>
                        {uploadIsSimulated ? "Tag as Simulated Demo Data" : "Verified Live Facility Import"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? "Validating & Ingesting..." : "Upload & Ingest Spreadsheet"}</span>
                </button>
              </div>
            </form>

            {/* Ingestion Validation Report */}
            {uploadResult && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ingestion Validation Report</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Total Rows Evaluated</span>
                    <span className="text-base font-bold text-slate-100 font-mono">{uploadResult.totalRows}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 block">Successfully Ingested</span>
                    <span className="text-base font-bold text-emerald-300 font-mono">{uploadResult.acceptedRows}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-amber-400 block">Duplicates Prevented</span>
                    <span className="text-base font-bold text-amber-300 font-mono">{uploadResult.duplicateRows}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-rose-400 block">Rejected / Invalid</span>
                    <span className="text-base font-bold text-rose-400 font-mono">{uploadResult.rejectedRows}</span>
                  </div>
                </div>

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block">
                      Validation Warning Details:
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-2">
                      {uploadResult.errors.map((err: any, idx: number) => (
                        <div key={idx} className="text-[11px] text-slate-400 bg-slate-900/60 p-1.5 rounded font-mono">
                          Row {err.row}: {err.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL DATA ENTRY */}
      {activeTab === "manual" && (
        <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Authorized Manual Data Entry</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Record technical sub-meter readings, monthly utility receipts, generator fuel additions, or biogas output.
              </p>
            </div>
            {!canEdit && (
              <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                Viewer Role: Read-only
              </span>
            )}
          </div>

          {manualFeedback && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                manualFeedback.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {manualFeedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{manualFeedback.msg}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reading Timestamp
                </label>
                <input
                  type="datetime-local"
                  required
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Energy Source
                </label>
                <select
                  value={manualSource}
                  onChange={(e) => setManualSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.sourceType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Campus Facility (Optional)
                </label>
                <select
                  value={manualBuilding}
                  onChange={(e) => setManualBuilding(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Campus Sub-station / Unassigned</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic Metric Input Fields */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-4">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                Technical Quantities & Parameters (Enter values relevant to source)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Grid Draw (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 340.5"
                    value={manualKwh}
                    onChange={(e) => setManualKwh(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Solar Generated (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 620.0"
                    value={manualSolarKwh}
                    onChange={(e) => setManualSolarKwh(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-orange-300 mb-1">
                    Diesel Fuel (Litres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 45.5"
                    value={manualDieselLitres}
                    onChange={(e) => setManualDieselLitres(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Strictly technical litres</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-orange-300 mb-1">
                    Generator Output (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 135.0"
                    value={manualGenKwh}
                    onChange={(e) => setManualGenKwh(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-lime-300 mb-1">
                    Biogas Consumed (m³)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 8.5"
                    value={manualBiogasM3}
                    onChange={(e) => setManualBiogasM3(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-lime-300 mb-1">
                    Biogas Output (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 14.2"
                    value={manualBiogasKwh}
                    onChange={(e) => setManualBiogasKwh(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Peak Demand (kW)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 110.0"
                    value={manualPeakKw}
                    onChange={(e) => setManualPeakKw(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Power Factor (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={manualPf}
                    onChange={(e) => setManualPf(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Operational Notes & Justification
              </label>
              <input
                type="text"
                placeholder="e.g. Logged from sub-station digital display at shift changeover"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualIsSimulated}
                  onChange={(e) => setManualIsSimulated(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900 w-4 h-4"
                />
                <span className={manualIsSimulated ? "text-amber-300 font-bold" : "text-slate-400"}>
                  {manualIsSimulated ? "Tag as Simulated Demonstration Entry" : "Real Facility Certified Log"}
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmittingManual || !canEdit}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmittingManual ? "Recording..." : "Record Manual Telemetry"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: API ADAPTERS */}
      {activeTab === "adapters" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Configurable Existing-System API Adapters</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect to inverter cloud endpoints, local Modbus TCP gateways, and fuel sensors. No new hardware required.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adapters.map((adapter) => {
              const isSyncing = syncingAdapterId === adapter.id;
              return (
                <div
                  key={adapter.id}
                  className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white">{adapter.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        adapter.status === "MOCK_SYNC_OK"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {adapter.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-slate-400 font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800/80 truncate">
                      {adapter.baseUrl}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Auth: {adapter.authType} {adapter.authKeyMasked ? `(${adapter.authKeyMasked})` : ""}</span>
                      <span>Interval: {adapter.pollingIntervalMins}m</span>
                    </div>
                  </div>

                  {adapter.lastSyncMessage && (
                    <div className="text-[11px] text-slate-300 bg-emerald-950/20 p-2 rounded border border-emerald-500/20">
                      {adapter.lastSyncMessage}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">
                      Last Polled: {adapter.lastSyncAt ? new Date(adapter.lastSyncAt).toLocaleTimeString() : "Pending sync"}
                    </span>

                    {canEdit && (
                      <button
                        onClick={() => handleTestAdapter(adapter.id)}
                        disabled={isSyncing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                        <span>{isSyncing ? "Polling..." : "Test Sync"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT READING RECORDS */}
      {activeTab === "readings" && (
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Telemetry & Ingestion Records</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every reading is tagged with verified provenance, non-financial technical metrics, and calculated carbon.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="">All Energy Sources</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="">All Buildings</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code}
                  </option>
                ))}
              </select>

              <select
                value={filterSimulated}
                onChange={(e) => setFilterSimulated(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="">All Provenance</option>
                <option value="false">Verified Live / Manual Only</option>
                <option value="true">Simulated Demo Only</option>
              </select>

              <button
                onClick={refreshReadings}
                disabled={isLoadingReadings}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Refresh Readings"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingReadings ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-2.5 px-3 font-medium">Timestamp</th>
                  <th className="py-2.5 px-3 font-medium">Facility</th>
                  <th className="py-2.5 px-3 font-medium">Provenance</th>
                  <th className="py-2.5 px-3 font-medium text-right">Grid (kWh)</th>
                  <th className="py-2.5 px-3 font-medium text-right">Solar (kWh)</th>
                  <th className="py-2.5 px-3 font-medium text-right text-orange-400">Diesel (L)</th>
                  <th className="py-2.5 px-3 font-medium text-right text-orange-400">Gen (kWh)</th>
                  <th className="py-2.5 px-3 font-medium text-right text-lime-400">Biogas (kWh)</th>
                  <th className="py-2.5 px-3 font-medium text-right text-emerald-400">CO₂ Avoided</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {readings.slice(0, 50).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(r.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 px-3 font-bold text-white">
                      {r.building ? r.building.code : "Substation"}
                    </td>
                    <td className="py-2 px-3">
                      {r.isSimulated ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans font-bold">
                          SIMULATED
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans font-bold">
                          VERIFIED
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200">{r.kwhConsumed.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right text-amber-300 font-bold">{r.solarKwhGenerated.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right text-orange-400">{r.dieselLitres.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right text-orange-300">{r.generatorKwhGenerated.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right text-lime-400">{r.biogasKwhGenerated.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">
                      {r.carbonKgAvoided.toFixed(1)} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: IMPORT HISTORY */}
      {activeTab === "history" && (
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Ingestion History & Batch Audits</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable records of all CSV/Excel imports, rejected row counts, and duplicate mitigations.
            </p>
          </div>

          <div className="space-y-3">
            {batches.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-200">{b.filename}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-mono">
                      {b.fileType}
                    </span>
                    {b.isSimulated && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        SIMULATED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Imported by: <span className="text-slate-200">{b.importedBy}</span> •{" "}
                    {new Date(b.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                  <div>Total Rows: <span className="font-bold text-white">{b.totalRows}</span></div>
                  <div>Accepted: <span className="font-bold text-emerald-400">{b.successfulRows}</span></div>
                  <div>Duplicates Skipped: <span className="font-bold text-amber-400">{b.duplicateRows}</span></div>
                  <div>Rejected: <span className="font-bold text-rose-400">{b.rejectedRows}</span></div>
                </div>

                {b.summaryNotes && (
                  <p className="text-[11px] text-slate-400 pt-1">{b.summaryNotes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CONFIGURED SOURCES */}
      {activeTab === "sources" && (
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Configured Energy Sources</h3>
            <span className="text-xs text-slate-400">All sources parameterizable with transparent operational status</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sources.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{s.name}</span>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">{s.sourceType}</span>
                </div>
                <div className="text-slate-300">
                  Capacity: <strong className="text-white font-mono">{s.ratedCapacityKw} kW</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  Provider: {s.configuredProvider}
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{s.monitoringMethod}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                      s.operationalStatus === "UNVERIFIED_PILOT"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {s.operationalStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
