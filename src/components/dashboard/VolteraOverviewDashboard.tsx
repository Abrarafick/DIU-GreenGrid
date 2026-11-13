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
      tag: "FabLab AI Recommendation",
      badge: "FabLab",
      text: "FabLab: 18x 3D printers and CNC spindle operate during evening peak. Scheduling multi-hour 3D print batches and laser cutting between 10am-2pm will absorb 950 kWh/week of excess rooftop solar energy.",
      status: "OPEN",
    },
    {
      id: "rec-2",
      tag: "AI recommendation",
      badge: "AB-2",
      text: "AC chillers and lab workstation clusters at Academic Building 2 show 23% higher consumption after 7pm. Adjusting setback schedule could save approximately 1,400 kWh/week.",
      status: "OPEN",
    },
    {
      id: "rec-3",
      tag: "Schedule Optimization",
      badge: "YKSG-1",
      text: "Shift dual water reservoir pump cycle at Yunus Khan Scholars Garden 1 to peak solar generation hours (10am-1pm). Estimated savings: 850 kWh/week grid import avoided.",
      status: "OPEN",
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

  // 7-day consumption data for the cylindrical stacked chart
  const weeklyConsumptionData = [
    { day: "Mon", ab1: 420, ab2: 310, fablab: 280, dorms: 390, isAnomaly: false },
    { day: "Tue", ab1: 450, ab2: 330, fablab: 290, dorms: 410, isAnomaly: false },
    { day: "Wed", ab1: 736, ab2: 387, fablab: 342, dorms: 471, isAnomaly: true }, // Anomaly spike
    { day: "Thur", ab1: 460, ab2: 340, fablab: 300, dorms: 405, isAnomaly: false },
    { day: "Fri", ab1: 390, ab2: 280, fablab: 240, dorms: 360, isAnomaly: false },
    { day: "Sat", ab1: 280, ab2: 190, fablab: 220, dorms: 480, isAnomaly: false },
    { day: "Sun", ab1: 270, ab2: 180, fablab: 210, dorms: 470, isAnomaly: false },
  ];

  // Alerts data matching official DIU campus facilities (AB-1..4, YKSG-1..2, RASG-1..2, FabLab)
  const alertsData = [
    {
      id: 0,
      title: "FabLab: 18x 3D Printer Farm high thermal bed baseload after 8pm",
      time: "14:23",
      site: "FabLab (Maker Lab)",
      facilityCode: "FabLab",
      severity: "High",
      severityColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      status: "Open",
      statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      id: 1,
      title: "Machine 48 / Server Cluster B spikes after 7pm",
      time: "13:45",
      site: "Academic Building 2 (AB-2)",
      facilityCode: "AB-2",
      severity: "High",
      severityColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      status: "Open",
      statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      id: 2,
      title: "HVAC running during off-hours (3rd Floor Lecture Hall)",
      time: "12:50",
      site: "Academic Building 1 (AB-1)",
      facilityCode: "AB-1",
      severity: "Medium",
      severityColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      status: "Open",
      statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      id: 3,
      title: "Rooftop Solar String 4 DC current efficiency drop (-22%)",
      time: "12:10",
      site: "Campus Solar PV Rooftop",
      facilityCode: "SOLAR_ROOFTOP",
      severity: "High",
      severityColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      status: "Investigating",
      statusColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      id: 4,
      title: "Overhead water transfer pump running during peak grid tariff window",
      time: "11:20",
      site: "Yunus Khan Scholars Garden 1 (YKSG-1)",
      facilityCode: "YKSG-1",
      severity: "Medium",
      severityColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      status: "Open",
      statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      id: 5,
      title: "Dormitory wing off-peak power factor below 0.85 pf",
      time: "08:15",
      site: "Rowshan Ara Scholars Garden 1 (RASG-1)",
      facilityCode: "RASG-1",
      severity: "Low",
      severityColor: "bg-slate-800 text-slate-300 border-slate-700",
      status: "Snoozed",
      statusColor: "bg-slate-800 text-slate-400 border-slate-700",
    },
  ];

  // Buildings ranking data with FabLab featured
  const buildingRankingsData = [
    {
      name: "Academic Building 1 (AB-1)",
      code: "AB-1",
      badge: "Engineering & Tech",
      delta: "+8.2%",
      isPositive: false,
      kwh: "12,450 kWh",
      mwh: "12.5 MWh",
      barColor: "bg-rose-500",
    },
    {
      name: "Academic Building 2 (AB-2)",
      code: "AB-2",
      badge: "Computing & IT",
      delta: "+3.2%",
      isPositive: false,
      kwh: "9,820 kWh",
      mwh: "9.8 MWh",
      barColor: "bg-amber-500",
    },
    {
      name: "YKSG-1 (Male Dormitory)",
      code: "YKSG-1",
      badge: "Scholars Garden",
      delta: "-2.5%",
      isPositive: true,
      kwh: "8,750 kWh",
      mwh: "8.8 MWh",
      barColor: "bg-purple-500",
    },
    {
      name: "FabLab (Maker & Prototyping)",
      code: "FabLab",
      badge: "3D Print • Laser • CNC",
      delta: "+14.6%",
      isPositive: false,
      kwh: "6,420 kWh",
      mwh: "6.4 MWh",
      barColor: "bg-[#ff5500]",
    },
    {
      name: "RASG-1 (Female Dormitory)",
      code: "RASG-1",
      badge: "Rowshan Ara Garden",
      delta: "-3.1%",
      isPositive: true,
      kwh: "5,910 kWh",
      mwh: "5.9 MWh",
      barColor: "bg-cyan-500",
    },
    {
      name: "Academic Building 4 (AB-4)",
      code: "AB-4",
      badge: "Science & Health",
      delta: "-1.8%",
      isPositive: true,
      kwh: "5,320 kWh",
      mwh: "5.3 MWh",
      barColor: "bg-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-slate-100 p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans antialiased">
      {/* Top Bar with Title, Subtitle & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Energy Overview
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Monitor consumption, emissions, and anomalies across all campus sites
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search for sites, machines..."
              className="bg-[#141620] border border-white/5 rounded-full pl-9 pr-12 py-2 text-xs text-slate-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 w-64 shadow-inner"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded font-mono border border-white/5">
              ⌘F
            </span>
          </div>

          {/* Export Button */}
          <Link
            href="/sustainability"
            className="px-4 py-2 rounded-full bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,85,0,0.35)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Link>

          {/* Notification Bell */}
          <div className="relative p-2.5 rounded-full bg-[#141620] border border-white/5 text-neutral-300 hover:text-white cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ff5500]" />
          </div>

          {/* Site Filter Pill with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSiteDropdown(!showSiteDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#141620] border border-white/5 text-xs text-slate-300 hover:border-white/10 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>{selectedSite}</span>
              <ChevronDown className="w-3 h-3 text-neutral-500 ml-1" />
            </button>

            {showSiteDropdown && (
              <div className="absolute right-0 top-11 bg-[#141620] border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 w-72 backdrop-blur-md space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-neutral-400 border-b border-white/5 tracking-wider">
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
                        ? "bg-[#ff5500]/20 text-[#ff5500] font-semibold"
                        : "text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedSite === opt && <Check className="w-3 h-3 text-[#ff5500]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Filter Pill */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#141620] border border-white/5 text-xs text-slate-300 cursor-pointer hover:border-white/10">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{timeRange}</span>
            <ChevronDown className="w-3 h-3 text-neutral-500 ml-1" />
          </div>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Consumption */}
        <div className="bg-[#12141c] border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <span className="text-[#ff5500] font-bold text-sm">|</span>
            <span>Total Consumption</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">3,842</span>
            <span className="text-xs text-neutral-400">MWh</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-4.2%</span>
            <span className="text-neutral-500 ml-1">vs last month</span>
          </div>
        </div>

        {/* Card 2: Clean Energy Share (Replacing Cost, Strictly Non-Financial) */}
        <div className="bg-[#12141c] border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <span className="text-amber-400 font-bold text-sm">|</span>
            <span>Clean Energy Share</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-300">49.8%</span>
            <span className="text-xs text-neutral-400">Solar + Biogas</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+11.8%</span>
            <span className="text-neutral-500 ml-1">vs baseline</span>
          </div>
        </div>

        {/* Card 3: Active Anomalies */}
        <div className="bg-[#12141c] border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <span className="text-rose-400 font-bold text-sm">|</span>
            <span>Active Anomalies</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">6</span>
            <span className="text-xs text-neutral-400">across 4 sites</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-rose-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2</span>
            <span className="text-neutral-500 ml-1">vs last month</span>
          </div>
        </div>

        {/* Card 4: Efficiency Score */}
        <div className="bg-[#12141c] border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <span className="text-cyan-400 font-bold text-sm">|</span>
            <span>Efficiency Score</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">92.4%</span>
            <span className="text-xs text-neutral-400">Campus EUI Index</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+1.5%</span>
            <span className="text-neutral-500 ml-1">vs last month</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Alerts & Cylindrical Chart) + Right Column (Cost/Consumption by Sites & Recommendations) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Alerts Card */}
          <div className="bg-[#12141c] border border-white/5 rounded-2xl p-5 space-y-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-white tracking-tight">Alerts</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
                  Live (Simulated)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#181a24] border border-white/5 text-neutral-300 cursor-pointer">
                  <span>{activeAlertFilter}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-500" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#181a24] border border-white/5 text-neutral-300 cursor-pointer">
                  <span>{severityFilter}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-500" />
                </div>
                <Link href="/ai-intelligence" className="text-neutral-400 hover:text-white text-[11px] ml-1">
                  View all
                </Link>
              </div>
            </div>

            {/* Alerts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[10px] text-neutral-500 uppercase tracking-wider border-b border-white/5 pb-2">
                    <th className="pb-2.5 font-medium">Anomaly</th>
                    <th className="pb-2.5 font-medium">Site ⇅</th>
                    <th className="pb-2.5 font-medium">Severity ⓘ</th>
                    <th className="pb-2.5 font-medium text-right pr-2">Status ⓘ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {alertsData.map((alert) => {
                    const isHighlighted = highlightedRow === alert.id;
                    return (
                      <tr
                        key={alert.id}
                        onClick={() => setHighlightedRow(alert.id)}
                        className={`cursor-pointer transition-all ${
                          isHighlighted
                            ? "bg-[#181a24] ring-1 ring-[#ff5500] shadow-[0_0_15px_rgba(255,85,0,0.2)] rounded-xl"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        {/* Title & Time */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-200">{alert.title}</div>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{alert.time}</div>
                        </td>

                        {/* Site */}
                        <td className="py-3 px-3 text-neutral-300 font-medium">
                          {alert.site}
                        </td>

                        {/* Severity */}
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${alert.severityColor}`}>
                            {alert.severity}
                          </span>
                        </td>

                        {/* Status & Icons */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${alert.statusColor}`}>
                              ● {alert.status}
                            </span>
                            <div className="flex items-center gap-1.5 text-neutral-500 ml-1">
                              <Users className="w-3.5 h-3.5 hover:text-neutral-300" />
                              <MessageSquare className="w-3.5 h-3.5 hover:text-neutral-300" />
                              <Bell className="w-3.5 h-3.5 hover:text-neutral-300" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consumption Stacked Cylindrical Chart Card */}
          <div className="bg-[#12141c] border border-white/5 rounded-2xl p-5 space-y-4 shadow-sm relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Consumption</h3>
                <span className="text-[10px] font-semibold text-purple-400 flex items-center gap-1 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  Anomaly ⓘ
                </span>
              </div>

              <div className="p-1.5 rounded-lg bg-[#181a24] border border-white/5 text-neutral-400 hover:text-white cursor-pointer">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Custom 3D Stacked Cylindrical Columns */}
            <div className="pt-6 pb-2">
              <div className="relative h-64 flex items-end justify-between px-4 sm:px-8 border-b border-white/5">
                {/* Horizontal grid lines */}
                <div className="absolute inset-x-0 top-0 border-b border-white/[0.04] flex items-center justify-between text-[10px] text-neutral-600 px-2">
                  <span>800 MWh</span>
                </div>
                <div className="absolute inset-x-0 top-1/4 border-b border-white/[0.04] flex items-center justify-between text-[10px] text-neutral-600 px-2">
                  <span>600 MWh</span>
                </div>
                <div className="absolute inset-x-0 top-2/4 border-b border-white/[0.04] flex items-center justify-between text-[10px] text-neutral-600 px-2">
                  <span>400 MWh</span>
                </div>
                <div className="absolute inset-x-0 top-3/4 border-b border-white/[0.04] flex items-center justify-between text-[10px] text-neutral-600 px-2">
                  <span>200 MWh</span>
                </div>

                {/* 7 Cylindrical Pillars */}
                {weeklyConsumptionData.map((item) => {
                  const total = item.ab1 + item.ab2 + item.fablab + item.dorms;
                  const heightPercent = Math.min(100, (total / 1800) * 100);

                  return (
                    <div key={item.day} className="flex flex-col items-center gap-2 relative z-10 w-10 sm:w-12 group">
                      {/* Floating Dark Tooltip on Anomaly Day (Wed) */}
                      {item.isAnomaly && (
                        <div className="absolute -top-28 left-1/2 -translate-x-1/2 bg-[#0d0f16]/95 border border-white/10 rounded-xl p-2.5 shadow-2xl z-30 min-w-[175px] backdrop-blur-md">
                          <div className="text-[10px] space-y-1 font-mono">
                            <div className="flex justify-between items-center text-rose-400 font-bold">
                              <span>| AB-1 (Engr)</span>
                              <span>736 kWh</span>
                            </div>
                            <div className="flex justify-between items-center text-amber-400 font-bold">
                              <span>| AB-2 (IT Labs)</span>
                              <span>387 kWh</span>
                            </div>
                            <div className="flex justify-between items-center text-[#ff5500] font-bold">
                              <span>| FabLab (CNC/3D)</span>
                              <span>342 kWh</span>
                            </div>
                            <div className="flex justify-between items-center text-purple-400">
                              <span>| YKSG-1 (Dorm)</span>
                              <span>253 kWh</span>
                            </div>
                            <div className="flex justify-between items-center text-cyan-400">
                              <span>| RASG-1 (Dorm)</span>
                              <span>218 kWh</span>
                            </div>
                          </div>
                          {/* Little triangle arrow pointing down */}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0d0f16] border-b border-r border-white/10 rotate-45" />
                        </div>
                      )}

                      {/* Stacked Cylinder Bar */}
                      <div
                        className={`w-8 sm:w-10 rounded-full flex flex-col justify-end overflow-hidden transition-all duration-300 ${
                          item.isAnomaly
                            ? "bg-gradient-to-t from-purple-900 via-purple-600 to-[#ff5500] shadow-[0_0_25px_rgba(255,85,0,0.45)] ring-2 ring-[#ff5500]/60"
                            : "bg-[#1e2230] hover:bg-[#252b3d]"
                        }`}
                        style={{ height: `${heightPercent * 2.2}px` }}
                      >
                        {/* Internal stacked cylinder bands */}
                        <div className="w-full h-1/4 bg-[#ff5500]/40 border-b border-white/10 rounded-t-full" />
                        <div className="w-full h-1/4 bg-purple-500/30 border-b border-white/10" />
                        <div className="w-full h-1/4 bg-white/10 border-b border-white/10" />
                        <div className="w-full h-1/4 bg-white/5" />
                      </div>

                      {/* Day Label */}
                      <span
                        className={`text-[11px] font-semibold ${
                          item.isAnomaly ? "text-[#ff5500] font-bold" : "text-neutral-500"
                        }`}
                      >
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center justify-center gap-6 pt-2 text-[11px] text-neutral-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span>AB-1 & AB-2 (Academic)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5500]" />
                <span className="font-semibold text-slate-200">FabLab (Maker & Prototyping)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>YKSG & RASG (Scholars Gardens)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Clean Rooftop Solar</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Consumption by Sites Card */}
          <div className="bg-[#12141c] border border-white/5 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">Consumption by Sites</h3>
              <Link href="/buildings" className="text-neutral-400 hover:text-white text-[11px]">
                View all 9 facilities →
              </Link>
            </div>

            <div className="space-y-4 pt-1">
              {buildingRankingsData.map((b) => (
                <div key={b.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-1 h-7 rounded-full ${b.barColor}`} />
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{b.name}</span>
                        {b.code === "FabLab" && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#ff5500]/20 text-[#ff5500] font-mono font-bold border border-[#ff5500]/30">
                            Maker Lab
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-mono ${
                            b.isPositive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {b.delta}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-sans">
                          {b.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-white font-mono">{b.kwh}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{b.mwh}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-[#12141c] border border-white/5 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">Recommendations</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                {recommendations.length}
              </span>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-[#181a24] border border-white/5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200">{rec.tag}</span>
                      {rec.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-neutral-300 font-mono font-semibold">
                          {rec.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ff5500]/20 text-[#ff5500] font-mono">
                      AI
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {rec.text}
                  </p>

                  {rec.status === "OPEN" ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleAcceptRec(rec.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleDismissRec(rec.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 text-xs font-medium transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Converted to Green Campus Action Item</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
