"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Sun,
  Flame,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  MessageSquare,
  Users,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Building2,
  Check,
  X,
  Gauge,
  Activity,
  Cpu,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface VolteraOverviewDashboardProps {
  summary: any;
  buildings: any[];
  energySources: any[];
  user: any;
}

export function VolteraOverviewDashboard({
  summary,
  buildings,
  energySources,
  user,
}: VolteraOverviewDashboardProps) {
  const [selectedSite, setSelectedSite] = useState<string>("All sites");
  const [showSiteDropdown, setShowSiteDropdown] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>("Last 30 days");
  const [activeAlertFilter, setActiveAlertFilter] = useState<string>("All alerts");
  const [severityFilter, setSeverityFilter] = useState<string>("All severity");
  const [highlightedRow, setHighlightedRow] = useState<number>(0);
  const [chartViewMode, setChartViewMode] = useState<"7D" | "24H" | "SOLAR">("7D");

  const siteOptions = [
    "All sites",
    "AB-1 (Engineering & Tech)",
    "AB-2 (Computing & IT Labs)",
    "AB-3 (Business & Entrepreneurship)",
    "AB-4 (Science & Allied Health)",
    "YKSG-1 (Scholars Garden Male 1)",
    "YKSG-2 (Scholars Garden Male 2)",
    "RASG-1 (Rowshan Ara Female 1)",
    "RASG-2 (Rowshan Ara Female 2)",
    "FabLab (Maker & Prototyping Center)",
  ];

  const [recommendations, setRecommendations] = useState([
    {
      id: "rec-1",
      tag: "FabLab Solar Window Sync",
      badge: "FabLab DIU",
      text: "FabLab: 18x 3D printers and CNC router operate during evening peak. Scheduling multi-hour 3D print batches and laser cutting between 10:30am-2:00pm will absorb 950 kWh/week of excess rooftop solar energy.",
      status: "OPEN",
      estimatedKwh: "950 kWh/wk",
    },
    {
      id: "rec-2",
      tag: "Computer Lab Night Setback",
      badge: "AB-2",
      text: "AC chillers and lab workstation clusters at Academic Building 2 show 23% higher consumption after 7pm. Adjusting setback schedule could save approximately 1,400 kWh/week.",
      status: "OPEN",
      estimatedKwh: "1,400 kWh/wk",
    },
    {
      id: "rec-3",
      tag: "Pump Schedule Optimization",
      badge: "YKSG-1",
      text: "Shift dual water reservoir pump cycle at Yunus Khan Scholars Garden 1 to peak solar generation hours (10am-1pm). Estimated savings: 850 kWh/week grid import avoided.",
      status: "OPEN",
      estimatedKwh: "850 kWh/wk",
    },
  ]);

  const handleAcceptRec = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "ACCEPTED" } : r))
    );
  };

  const handleDismissRec = (id: string) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  };

  // 7-day consumption data for clean enterprise data visualization
  const weeklyConsumptionData = [
    { day: "Mon", ab1: 420, ab2: 310, fablab: 280, dorms: 390, solar: 580, isAnomaly: false },
    { day: "Tue", ab1: 450, ab2: 330, fablab: 290, dorms: 410, solar: 620, isAnomaly: false },
    { day: "Wed", ab1: 736, ab2: 387, fablab: 342, dorms: 471, solar: 610, isAnomaly: true }, // Anomaly spike
    { day: "Thur", ab1: 460, ab2: 340, fablab: 300, dorms: 405, solar: 590, isAnomaly: false },
    { day: "Fri", ab1: 390, ab2: 280, fablab: 240, dorms: 360, solar: 640, isAnomaly: false },
    { day: "Sat", ab1: 280, ab2: 190, fablab: 220, dorms: 480, solar: 630, isAnomaly: false },
    { day: "Sun", ab1: 270, ab2: 180, fablab: 210, dorms: 470, solar: 615, isAnomaly: false },
  ];

  // Alerts data matching official DIU campus facilities (AB-1..4, YKSG-1..2, RASG-1..2, FabLab)
  const alertsData = [
    {
      id: 0,
      title: "FabLab: 18x 3D Printer Farm thermal bed surge after 8pm",
      time: "14:23 BST",
      site: "FabLab (Maker Lab)",
      facilityCode: "FabLab",
      severity: "High",
      severityBadge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      status: "Open",
      statusBadge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    {
      id: 1,
      title: "Machine 48 / Server Cluster B spikes after 7pm",
      time: "13:45 BST",
      site: "Academic Building 2 (AB-2)",
      facilityCode: "AB-2",
      severity: "High",
      severityBadge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      status: "Open",
      statusBadge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    {
      id: 2,
      title: "HVAC running during off-hours (3rd Floor Lecture Hall)",
      time: "12:50 BST",
      site: "Academic Building 1 (AB-1)",
      facilityCode: "AB-1",
      severity: "Medium",
      severityBadge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      status: "Open",
      statusBadge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    {
      id: 3,
      title: "Rooftop Solar String 4 DC current efficiency drop (-22%)",
      time: "12:10 BST",
      site: "Campus Solar PV Rooftop",
      facilityCode: "SOLAR_ROOFTOP",
      severity: "High",
      severityBadge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      status: "Investigating",
      statusBadge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    {
      id: 4,
      title: "Overhead water transfer pump running during peak grid tariff window",
      time: "11:20 BST",
      site: "Yunus Khan Scholars Garden 1 (YKSG-1)",
      facilityCode: "YKSG-1",
      severity: "Medium",
      severityBadge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      status: "Open",
      statusBadge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    {
      id: 5,
      title: "Dormitory wing off-peak power factor drop (0.83 pf)",
      time: "08:15 BST",
      site: "Rowshan Ara Scholars Garden 1 (RASG-1)",
      facilityCode: "RASG-1",
      severity: "Low",
      severityBadge: "bg-slate-800 text-slate-300 border-slate-700",
      status: "Snoozed",
      statusBadge: "bg-slate-800 text-slate-400 border-slate-700",
    },
  ];

  // Buildings ranking data with FabLab featured
  const buildingRankingsData = [
    {
      name: "Academic Building 1",
      code: "AB-1",
      badge: "Engineering & Tech",
      delta: "+8.2%",
      isPositive: false,
      kwh: "12,450 kWh",
      sharePercent: 24.5,
      barColor: "bg-gradient-to-r from-emerald-500 to-teal-400",
    },
    {
      name: "Academic Building 2",
      code: "AB-2",
      badge: "Computing & IT",
      delta: "+3.2%",
      isPositive: false,
      kwh: "9,820 kWh",
      sharePercent: 19.3,
      barColor: "bg-gradient-to-r from-teal-500 to-emerald-400",
    },
    {
      name: "YKSG-1 (Male Residence)",
      code: "YKSG-1",
      badge: "Scholars Garden",
      delta: "-2.5%",
      isPositive: true,
      kwh: "8,750 kWh",
      sharePercent: 17.2,
      barColor: "bg-gradient-to-r from-emerald-600 to-teal-500",
    },
    {
      name: "FabLab (Maker & Prototyping)",
      code: "FabLab",
      badge: "3D Print • Laser • CNC",
      delta: "+14.6%",
      isPositive: false,
      kwh: "6,420 kWh",
      sharePercent: 12.6,
      barColor: "bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#6ee7b7]",
      isFabLab: true,
    },
    {
      name: "RASG-1 (Female Residence)",
      code: "RASG-1",
      badge: "Rowshan Ara Garden",
      delta: "-3.1%",
      isPositive: true,
      kwh: "5,910 kWh",
      sharePercent: 11.6,
      barColor: "bg-gradient-to-r from-teal-600 to-emerald-500",
    },
    {
      name: "Academic Building 4",
      code: "AB-4",
      badge: "Science & Health",
      delta: "-1.8%",
      isPositive: true,
      kwh: "5,320 kWh",
      sharePercent: 10.4,
      barColor: "bg-gradient-to-r from-emerald-700 to-teal-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#06100b] text-emerald-50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1680px] mx-auto font-sans antialiased">
      {/* 1. Header Control Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-emerald-500/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight font-display">
              Eco-Tech Energy Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 clay-badge flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Bento Grid v2.4
            </span>
          </div>
          <p className="text-xs text-emerald-200/60 mt-1">
            Real-time telemetry, predictive analytics, and sustainability accounting across 9 DIU Ashulia facilities (103,000 m²)
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-emerald-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search buildings, meters..."
              className="clay-pill pl-9 pr-10 py-1.5 text-xs text-emerald-100 placeholder-emerald-400/40 focus:outline-none focus:border-emerald-400/50 w-56 shadow-inner"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-emerald-300/60 bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono border border-emerald-500/20">
              ⌘K
            </span>
          </div>

          {/* Site Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowSiteDropdown(!showSiteDropdown)}
              className="clay-pill px-3 py-1.5 text-xs text-emerald-200 flex items-center gap-1.5 hover:text-white"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[140px]">{selectedSite}</span>
              <ChevronDown className="w-3 h-3 text-emerald-400/60 ml-0.5" />
            </button>

            {showSiteDropdown && (
              <div className="absolute right-0 top-10 bg-[#0a1812]/95 border border-emerald-500/20 rounded-2xl p-1.5 shadow-2xl z-50 w-72 backdrop-blur-xl space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-emerald-400/70 border-b border-emerald-500/10 tracking-wider">
                  Select DIU Campus Facility
                </div>
                {siteOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedSite(opt);
                      setShowSiteDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedSite === opt
                        ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30"
                        : "text-emerald-100/70 hover:bg-emerald-950/40 hover:text-white"
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedSite === opt && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Range Selector */}
          <div className="clay-pill px-3 py-1.5 text-xs text-emerald-200 flex items-center gap-1.5 cursor-pointer">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{timeRange}</span>
            <ChevronDown className="w-3 h-3 text-emerald-400/60 ml-0.5" />
          </div>

          {/* Export CTA Button */}
          <Link
            href="/sustainability"
            className="clay-button-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ESG</span>
          </Link>
        </div>
      </div>

      {/* 2. MAIN BENTO GRID */}
      <div className="grid grid-cols-12 gap-5">
        {/* ========================================================== */}
        {/* BENTO TILE 1: HERO ENTERPRISE DATA VISUALIZATION (8 Cols)   */}
        {/* ========================================================== */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between space-y-5">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar of Chart */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight font-display">
                  Campus Electricity Demand & Solar Generation
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono clay-badge">
                  Clean Telemetry
                </span>
              </div>
              <p className="text-xs text-emerald-200/60 mt-0.5">
                Stacked multi-facility hourly load profiles vs. 850 kWp rooftop solar PV yield curve
              </p>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-1.5 clay-pill p-1">
              <button
                onClick={() => setChartViewMode("7D")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  chartViewMode === "7D"
                    ? "clay-button-primary text-white"
                    : "text-emerald-300/60 hover:text-white"
                }`}
              >
                7-Day Weekly
              </button>
              <button
                onClick={() => setChartViewMode("24H")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  chartViewMode === "24H"
                    ? "clay-button-primary text-white"
                    : "text-emerald-300/60 hover:text-white"
                }`}
              >
                24H Diurnal
              </button>
              <button
                onClick={() => setChartViewMode("SOLAR")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  chartViewMode === "SOLAR"
                    ? "clay-button-primary text-white"
                    : "text-emerald-300/60 hover:text-white"
                }`}
              >
                Solar Balance
              </button>
            </div>
          </div>

          {/* Custom 3D Cylindrical + Enterprise Area Chart Visualization */}
          <div className="relative pt-6 pb-2 z-10">
            <div className="relative h-64 flex items-end justify-between px-4 sm:px-8 border-b border-emerald-500/10">
              {/* Horizontal Reference Grid Lines */}
              <div className="absolute inset-x-0 top-0 border-b border-emerald-500/10 flex items-center justify-between text-[10px] text-emerald-400/40 px-2 font-mono">
                <span>1,800 kWh</span>
                <span className="text-emerald-500/30">Sub-station Capacity Threshold</span>
              </div>
              <div className="absolute inset-x-0 top-1/4 border-b border-emerald-500/5 flex items-center justify-between text-[10px] text-emerald-400/40 px-2 font-mono">
                <span>1,350 kWh</span>
              </div>
              <div className="absolute inset-x-0 top-2/4 border-b border-emerald-500/5 flex items-center justify-between text-[10px] text-emerald-400/40 px-2 font-mono">
                <span>900 kWh</span>
              </div>
              <div className="absolute inset-x-0 top-3/4 border-b border-emerald-500/5 flex items-center justify-between text-[10px] text-emerald-400/40 px-2 font-mono">
                <span>450 kWh</span>
              </div>

              {/* 7 Cylindrical Pillars with Multi-Facility Stacks */}
              {weeklyConsumptionData.map((item) => {
                const total = item.ab1 + item.ab2 + item.fablab + item.dorms;
                const heightPercent = Math.min(100, (total / 1850) * 100);

                return (
                  <div key={item.day} className="flex flex-col items-center gap-2 relative z-10 w-10 sm:w-14 group">
                    {/* Floating Glass Tooltip on Anomaly Day (Wednesday) or on Group Hover */}
                    {item.isAnomaly && (
                      <div className="absolute -top-32 left-1/2 -translate-x-1/2 glass-panel-glow rounded-2xl p-3 shadow-2xl z-30 min-w-[200px] pointer-events-none transition-all">
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-500/20 text-[10px]">
                          <span className="font-bold text-white uppercase tracking-wider">Wednesday Surge</span>
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                            Anomaly +38%
                          </span>
                        </div>
                        <div className="text-[10px] space-y-1 font-mono">
                          <div className="flex justify-between items-center text-emerald-300 font-semibold">
                            <span>| AB-1 (Engineering)</span>
                            <span>736 kWh</span>
                          </div>
                          <div className="flex justify-between items-center text-teal-300">
                            <span>| AB-2 (Computing)</span>
                            <span>387 kWh</span>
                          </div>
                          <div className="flex justify-between items-center text-mint font-bold text-[#6ee7b7]">
                            <span>| FabLab (Maker CNC/3D)</span>
                            <span>342 kWh</span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-100/60">
                            <span>| YKSG & RASG (Dorms)</span>
                            <span>471 kWh</span>
                          </div>
                        </div>
                        {/* Downward triangle arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0d1f18] border-b border-r border-emerald-500/30 rotate-45" />
                      </div>
                    )}

                    {/* Tactile Stacked Cylinder Column */}
                    <div
                      className={`w-8 sm:w-11 rounded-t-full rounded-b-lg flex flex-col justify-end overflow-hidden transition-all duration-300 ${
                        item.isAnomaly
                          ? "bg-gradient-to-t from-emerald-950 via-emerald-700 to-mint shadow-[0_0_28px_rgba(52,211,153,0.45)] ring-2 ring-emerald-400"
                          : "bg-emerald-950/40 hover:bg-emerald-900/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      }`}
                      style={{ height: `${heightPercent * 2.2}px` }}
                    >
                      {/* Stack layer 1: FabLab (Mint top cap) */}
                      <div className="w-full h-1/4 bg-[#6ee7b7]/60 border-b border-emerald-400/30 rounded-t-full shadow-inner" />
                      {/* Stack layer 2: Academic Labs */}
                      <div className="w-full h-1/4 bg-emerald-500/40 border-b border-emerald-500/20" />
                      {/* Stack layer 3: Dormitories */}
                      <div className="w-full h-1/4 bg-teal-700/40 border-b border-emerald-900/40" />
                      {/* Stack layer 4: Base Classrooms */}
                      <div className="w-full h-1/4 bg-emerald-950/80" />
                    </div>

                    {/* Day Axis Label */}
                    <span
                      className={`text-[11px] font-semibold font-mono ${
                        item.isAnomaly ? "text-emerald-300 font-bold underline decoration-emerald-400" : "text-emerald-400/60"
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clean Enterprise Legend Strip */}
          <div className="flex items-center justify-between pt-2 border-t border-emerald-500/10 flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span className="text-emerald-100/80 font-medium">AB-1 & AB-2 (Academic)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6ee7b7] shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
                <span className="text-white font-semibold flex items-center gap-1">
                  <span>FabLab</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Maker Lab
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shadow-sm" />
                <span className="text-emerald-100/80 font-medium">YKSG & RASG (Dormitories)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <span className="text-emerald-100/80 font-medium">Rooftop Solar PV (850 kWp)</span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-300/70 font-mono">
              Unmasked Residual: <span className="font-bold text-emerald-300">+7.0%</span> (Line Losses + Surplus)
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* BENTO TILE 2: 4 KEY PERFORMANCE METRICS TILES (4 Cols)      */}
        {/* ========================================================== */}
        <div className="col-span-12 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 2A: Total Consumption */}
          <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200/70 uppercase tracking-wider font-display">
                Total Consumption
              </span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 clay-badge">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">3,842</span>
                <span className="text-xs font-medium text-emerald-400">MWh</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 mt-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="font-semibold">-4.2%</span>
                <span className="text-emerald-400/50">vs last month</span>
              </div>
            </div>
            <div className="pt-2 border-t border-emerald-500/10 text-[10px] text-emerald-300/60 font-mono">
              103,000 m² Monitored Floor Area
            </div>
          </div>

          {/* Tile 2B: Clean Renewable Share */}
          <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200/70 uppercase tracking-wider font-display">
                Clean Energy Share
              </span>
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 clay-badge">
                <Sun className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-[#6ee7b7] tracking-tight">49.8%</span>
                <span className="text-xs font-medium text-emerald-400/70">Self-Consumed</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="font-semibold">+11.8%</span>
                <span className="text-emerald-400/50">vs baseline</span>
              </div>
            </div>
            {/* Progress to 50% target */}
            <div className="space-y-1 pt-2 border-t border-emerald-500/10">
              <div className="w-full bg-emerald-950/60 h-1.5 rounded-full overflow-hidden border border-emerald-500/20">
                <div className="bg-gradient-to-r from-emerald-500 to-[#6ee7b7] h-full rounded-full" style={{ width: "99.6%" }} />
              </div>
              <div className="flex justify-between text-[9px] text-emerald-300/70 font-mono">
                <span>Current: 49.8%</span>
                <span className="text-[#6ee7b7]">SDG 7 Target: 50.0%</span>
              </div>
            </div>
          </div>

          {/* Tile 2C: Active Anomalies */}
          <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200/70 uppercase tracking-wider font-display">
                Active Anomalies
              </span>
              <div className="w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 clay-badge">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">6</span>
                <span className="text-xs font-medium text-emerald-400/70">Events Across 9 Sites</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-rose-300 mt-1">
                <Activity className="w-3.5 h-3.5" />
                <span>2 High Severity</span>
                <span className="text-emerald-400/50">• 4 Med/Low</span>
              </div>
            </div>
            <div className="pt-2 border-t border-emerald-500/10 text-[10px] text-emerald-300/60 flex items-center justify-between">
              <span>Z-Score Outlier Engine</span>
              <span className="text-emerald-400 font-mono">Active</span>
            </div>
          </div>

          {/* Tile 2D: Efficiency Score (EUI) */}
          <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200/70 uppercase tracking-wider font-display">
                Efficiency Index
              </span>
              <div className="w-7 h-7 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 clay-badge">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">92.4%</span>
                <span className="text-xs font-medium text-emerald-400/70">EUI Rating</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="font-semibold">+1.5%</span>
                <span className="text-emerald-400/50">vs benchmark</span>
              </div>
            </div>
            <div className="pt-2 border-t border-emerald-500/10 text-[10px] text-emerald-300/60 font-mono flex items-center justify-between">
              <span>0.074 kWh/m²</span>
              <span className="text-emerald-400">ASHRAE 55</span>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* BENTO TILE 3: LIVE OPERATIONAL ALERTS MATRIX (5 Cols)       */}
        {/* ========================================================== */}
        <div className="col-span-12 lg:col-span-5 glass-panel rounded-3xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight font-display">
                Operational Anomaly Matrix
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 clay-badge flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed
              </span>
            </div>

            <Link
              href="/ai-intelligence"
              className="text-xs font-medium text-emerald-300/70 hover:text-white flex items-center gap-1"
            >
              <span>View all 12</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Alerts Table with Soft Clay Rows */}
          <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
            {alertsData.map((alert) => {
              const isSelected = highlightedRow === alert.id;
              const isFabLab = alert.facilityCode === "FabLab";

              return (
                <div
                  key={alert.id}
                  onClick={() => setHighlightedRow(alert.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? "glass-panel-glow border-emerald-400/50 shadow-[0_4px_20px_rgba(16,185,129,0.25)]"
                      : "bg-[#0b1c15]/50 border-emerald-500/10 hover:border-emerald-500/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {alert.title}
                        </span>
                        {isFabLab && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#6ee7b7] font-mono font-bold border border-emerald-500/30">
                            Maker Lab
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-300/60 font-mono">
                        <span>{alert.site}</span>
                        <span>•</span>
                        <span>{alert.time}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border clay-badge ${alert.severityBadge}`}>
                        {alert.severity}
                      </span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border clay-badge ${alert.statusBadge}`}>
                        ● {alert.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-emerald-500/10 flex items-center justify-between text-[11px] text-emerald-300/60">
            <span>Click any anomaly to inspect root cause & evidence</span>
            <span className="font-mono text-emerald-400">Auto-Refreshed</span>
          </div>
        </div>

        {/* ========================================================== */}
        {/* BENTO TILE 4: FACILITY CONSUMPTION & RANKINGS (4 Cols)     */}
        {/* ========================================================== */}
        <div className="col-span-12 lg:col-span-4 glass-panel rounded-3xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight font-display">
                Facility Demand Rankings
              </h3>
              <p className="text-[11px] text-emerald-300/60 mt-0.5">
                Top consumers across 9 DIU campus facilities
              </p>
            </div>

            <Link
              href="/buildings"
              className="text-xs font-medium text-emerald-300/70 hover:text-white flex items-center gap-1"
            >
              <span>9 Buildings</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Rankings List with Proportional Progress Bars */}
          <div className="space-y-3.5">
            {buildingRankingsData.map((b) => (
              <div key={b.code} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{b.name}</span>
                    {b.isFabLab ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#6ee7b7] font-mono font-bold border border-emerald-500/30 clay-badge">
                        Maker Lab
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400/50 font-sans">
                        {b.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-white">{b.kwh}</span>
                    <span
                      className={`text-[10px] ${
                        b.isPositive ? "text-[#6ee7b7]" : "text-rose-300"
                      }`}
                    >
                      {b.delta}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-emerald-950/70 h-2 rounded-full overflow-hidden border border-emerald-500/15">
                  <div
                    className={`${b.barColor} h-full rounded-full transition-all duration-500 ${
                      b.isFabLab ? "shadow-[0_0_10px_rgba(110,231,183,0.6)]" : ""
                    }`}
                    style={{ width: `${b.sharePercent * 3.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/15 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-300/70">Total Campus Monitored:</span>
            <span className="font-bold text-white">48,670 kWh / Week</span>
          </div>
        </div>

        {/* ========================================================== */}
        {/* BENTO TILE 5: AI PREDICTIVE RECOMMENDATIONS (3 Cols)       */}
        {/* ========================================================== */}
        <div className="col-span-12 lg:col-span-3 glass-panel rounded-3xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6ee7b7]" />
              <h3 className="text-sm font-bold text-white tracking-tight font-display">
                AI Optimization
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono clay-badge">
              {recommendations.length} Recs
            </span>
          </div>

          {/* Recommendations Cards */}
          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl bg-[#0c1e17]/80 border border-emerald-500/20 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white font-display">
                      {rec.tag}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#6ee7b7]/20 text-[#6ee7b7] border border-emerald-400/30 font-bold">
                    {rec.badge}
                  </span>
                </div>

                <p className="text-[11px] text-emerald-100/70 leading-relaxed">
                  {rec.text}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-emerald-500/10 text-[10px] font-mono">
                  <span className="text-emerald-300/60">Estimated:</span>
                  <span className="font-bold text-[#6ee7b7]">{rec.estimatedKwh}</span>
                </div>

                {rec.status === "OPEN" ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAcceptRec(rec.id)}
                      className="clay-button-primary flex-1 py-1.5 text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleDismissRec(rec.id)}
                      className="px-2.5 py-1.5 rounded-full text-xs font-medium text-emerald-300/60 hover:text-white hover:bg-emerald-950/40 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1 pt-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dispatched to Action Management</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Link
            href="/actions"
            className="w-full text-center py-2 rounded-2xl bg-emerald-950/50 hover:bg-emerald-900/50 text-xs text-emerald-300 font-semibold border border-emerald-500/20 transition-all block"
          >
            Review Verified Savings →
          </Link>
        </div>
      </div>
    </div>
  );
}
