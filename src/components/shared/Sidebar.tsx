"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Bell,
  LineChart,
  CheckSquare,
  FileText,
  Workflow,
  Users,
  Wrench,
  HelpCircle,
  Settings,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Flame,
  PanelLeftClose,
  Zap,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [alertsOpen, setAlertsOpen] = useState(true);

  return (
    <aside className="w-64 bg-[#08140e]/90 border-r border-emerald-500/10 flex flex-col justify-between shrink-0 h-[calc(100vh-45px)] sticky top-[45px] select-none backdrop-blur-xl">
      {/* Top Section */}
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-[0_0_14px_rgba(16,185,129,0.5)]">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight font-display">GreenGrid</span>
          </div>
          <button className="text-emerald-400/50 hover:text-emerald-300 transition-colors">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Navigation List */}
        <nav className="space-y-1.5">
          {/* 1. Overview */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/"
                ? "clay-button-primary text-white shadow-lg"
                : "text-emerald-100/60 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${pathname === "/" ? "text-white" : "text-emerald-400/70"}`} />
            <span>Overview</span>
          </Link>

          {/* 2. Sites / Buildings */}
          <Link
            href="/buildings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/buildings"
                ? "clay-button-primary text-white shadow-lg"
                : "text-emerald-100/60 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            <Building2 className={`w-4 h-4 ${pathname === "/buildings" ? "text-white" : "text-emerald-400/70"}`} />
            <span>Sites (9 Buildings)</span>
          </Link>

          {/* 3. Alerts (Collapsible with badge) */}
          <div>
            <div
              onClick={() => setAlertsOpen(!alertsOpen)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                pathname === "/ai-intelligence"
                  ? "bg-emerald-950/60 border border-emerald-500/30 text-white"
                  : "text-emerald-100/60 hover:text-white hover:bg-emerald-950/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-emerald-400/70" />
                <span>Alerts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono clay-badge">
                  16
                </span>
                {alertsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-500/70" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500/70" />
                )}
              </div>
            </div>

            {/* Sub-items under Alerts */}
            {alertsOpen && (
              <div className="ml-7 pl-3 border-l border-emerald-500/15 space-y-1 mt-1 text-[11px]">
                <Link
                  href="/ai-intelligence"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-emerald-200/60 hover:text-white hover:bg-emerald-950/40"
                >
                  <span>Active Anomalies</span>
                  <span className="text-[10px] text-emerald-400 font-mono">6</span>
                </Link>
                <Link
                  href="/ai-intelligence"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-emerald-200/60 hover:text-white hover:bg-emerald-950/40"
                >
                  <span>Investigating</span>
                  <span className="text-[10px] text-amber-400 font-mono">4</span>
                </Link>
                <Link
                  href="/ai-intelligence"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-emerald-200/60 hover:text-white hover:bg-emerald-950/40"
                >
                  <span>Resolved</span>
                  <span className="text-[10px] text-emerald-400 font-mono">2</span>
                </Link>
              </div>
            )}
          </div>

          {/* 4. Analytics */}
          <Link
            href="/buildings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/analytics"
                ? "clay-button-primary text-white shadow-lg"
                : "text-emerald-100/60 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            <LineChart className="w-4 h-4 text-emerald-400/70" />
            <span>Analytics</span>
          </Link>

          {/* 5. Assignments / Actions */}
          <Link
            href="/actions"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/actions"
                ? "clay-button-primary text-white shadow-lg"
                : "text-emerald-100/60 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            <CheckSquare className={`w-4 h-4 ${pathname === "/actions" ? "text-white" : "text-emerald-400/70"}`} />
            <span>Actions</span>
          </Link>

          {/* 6. Reports / Sustainability */}
          <Link
            href="/sustainability"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/sustainability"
                ? "clay-button-primary text-white shadow-lg"
                : "text-emerald-100/60 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            <FileText className={`w-4 h-4 ${pathname === "/sustainability" ? "text-white" : "text-emerald-400/70"}`} />
            <span>Sustainability</span>
          </Link>
        </nav>

        {/* Secondary Navigation Section */}
        <div className="pt-4 border-t border-emerald-500/10 space-y-1">
          <Link
            href="/ai-intelligence"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-100/60 hover:text-white hover:bg-emerald-950/40 transition-all"
          >
            <Workflow className="w-4 h-4 text-emerald-400/70" />
            <span>AI Automation</span>
          </Link>

          <Link
            href="/data-sources"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/data-sources"
                ? "clay-button-primary text-white shadow-lg"
                : "text-emerald-100/60 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            <Wrench className={`w-4 h-4 ${pathname === "/data-sources" ? "text-white" : "text-emerald-400/70"}`} />
            <span>Data Sources</span>
          </Link>
        </div>
      </div>

      {/* Bottom Pinned Section */}
      <div className="p-4 border-t border-emerald-500/10 space-y-3">
        {/* User Profile Card */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl glass-panel">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
              DG
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate font-display">DIU GreenGrid</div>
              <div className="text-[10px] text-emerald-400/80 truncate">Ashulia Smart Campus</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        </div>
      </div>
    </aside>
  );
}
