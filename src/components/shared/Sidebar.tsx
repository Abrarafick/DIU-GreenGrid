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
    <aside className="w-64 bg-white/95 border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-[calc(100vh-45px)] sticky top-[45px] select-none backdrop-blur-xl shadow-sm">
      {/* Top Section */}
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight font-display">GreenGrid</span>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
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
                ? "clay-button-primary text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${pathname === "/" ? "text-white" : "text-emerald-600"}`} />
            <span>Overview</span>
          </Link>

          {/* 2. Sites / Buildings */}
          <Link
            href="/buildings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/buildings"
                ? "clay-button-primary text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Building2 className={`w-4 h-4 ${pathname === "/buildings" ? "text-white" : "text-emerald-600"}`} />
            <span>Sites (9 Buildings)</span>
          </Link>

          {/* 3. Alerts (Collapsible with badge) */}
          <div>
            <div
              onClick={() => setAlertsOpen(!alertsOpen)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                pathname === "/ai-intelligence"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Alerts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono clay-badge">
                  16
                </span>
                {alertsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </div>

            {/* Sub-items under Alerts */}
            {alertsOpen && (
              <div className="ml-7 pl-3 border-l border-slate-200 space-y-1 mt-1 text-[11px]">
                <Link
                  href="/ai-intelligence"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <span>Active Anomalies</span>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">6</span>
                </Link>
                <Link
                  href="/ai-intelligence"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <span>Investigating</span>
                  <span className="text-[10px] text-amber-600 font-mono font-bold">4</span>
                </Link>
                <Link
                  href="/ai-intelligence"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <span>Resolved</span>
                  <span className="text-[10px] text-slate-500 font-mono">2</span>
                </Link>
              </div>
            )}
          </div>

          {/* 4. Analytics */}
          <Link
            href="/buildings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/analytics"
                ? "clay-button-primary text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LineChart className="w-4 h-4 text-emerald-600" />
            <span>Analytics</span>
          </Link>

          {/* 5. Assignments / Actions */}
          <Link
            href="/actions"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/actions"
                ? "clay-button-primary text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <CheckSquare className={`w-4 h-4 ${pathname === "/actions" ? "text-white" : "text-emerald-600"}`} />
            <span>Actions</span>
          </Link>

          {/* 6. Reports / Sustainability */}
          <Link
            href="/sustainability"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/sustainability"
                ? "clay-button-primary text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className={`w-4 h-4 ${pathname === "/sustainability" ? "text-white" : "text-emerald-600"}`} />
            <span>Sustainability</span>
          </Link>
        </nav>

        {/* Secondary Navigation Section */}
        <div className="pt-4 border-t border-slate-200 space-y-1">
          <Link
            href="/ai-intelligence"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <Workflow className="w-4 h-4 text-emerald-600" />
            <span>AI Automation</span>
          </Link>

          <Link
            href="/data-sources"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/data-sources"
                ? "clay-button-primary text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Wrench className={`w-4 h-4 ${pathname === "/data-sources" ? "text-white" : "text-emerald-600"}`} />
            <span>Data Sources</span>
          </Link>
        </div>
      </div>

      {/* Bottom Pinned Section */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        {/* User Profile Card */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
              DG
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-900 truncate font-display">DIU GreenGrid</div>
              <div className="text-[10px] text-emerald-600 truncate">Ashulia Smart Campus</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
      </div>
    </aside>
  );
}
