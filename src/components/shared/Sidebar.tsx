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
    <aside className="w-64 bg-[#0a0b0f] border-r border-white/5 flex flex-col justify-between shrink-0 h-[calc(100vh-45px)] sticky top-[45px] select-none">
      {/* Top Section */}
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#ff5500] flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,85,0,0.5)]">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">GreenGrid</span>
          </div>
          <button className="text-neutral-500 hover:text-neutral-300 transition-colors">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Navigation List */}
        <nav className="space-y-1">
          {/* 1. Overview */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/"
                ? "bg-white text-black shadow-lg"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${pathname === "/" ? "text-black" : "text-neutral-400"}`} />
            <span>Overview</span>
          </Link>

          {/* 2. Sites / Buildings */}
          <Link
            href="/buildings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/buildings"
                ? "bg-white text-black shadow-lg"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Building2 className={`w-4 h-4 ${pathname === "/buildings" ? "text-black" : "text-neutral-400"}`} />
            <span>Sites</span>
          </Link>

          {/* 3. Alerts (Collapsible with badge) */}
          <div>
            <div
              onClick={() => setAlertsOpen(!alertsOpen)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                pathname === "/ai-intelligence"
                  ? "bg-[#181a24] text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-neutral-400" />
                <span>Alerts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#ff5500] text-white font-mono">
                  16
                </span>
                {alertsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                )}
              </div>
            </div>

            {/* Sub-items under Alerts */}
            {alertsOpen && (
              <div className="ml-7 pl-3 border-l border-white/5 space-y-1 mt-1 text-[11px]">
                <Link
                  href="/ai-intelligence"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5"
                >
                  <span>Active Anomalies</span>
                  <span className="text-[10px] text-neutral-500 font-mono">6</span>
                </Link>
                <Link
                  href="/ai-intelligence"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5"
                >
                  <span>Investigating</span>
                  <span className="text-[10px] text-neutral-500 font-mono">4</span>
                </Link>
                <Link
                  href="/ai-intelligence"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5"
                >
                  <span>Resolved</span>
                  <span className="text-[10px] text-neutral-500 font-mono">2</span>
                </Link>
              </div>
            )}
          </div>

          {/* 4. Analytics */}
          <Link
            href="/buildings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/analytics"
                ? "bg-white text-black shadow-lg"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LineChart className="w-4 h-4 text-neutral-400" />
            <span>Analytics</span>
          </Link>

          {/* 5. Assignments / Actions */}
          <Link
            href="/actions"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/actions"
                ? "bg-white text-black shadow-lg"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <CheckSquare className={`w-4 h-4 ${pathname === "/actions" ? "text-black" : "text-neutral-400"}`} />
            <span>Assignments</span>
          </Link>

          {/* 6. Reports / Sustainability */}
          <Link
            href="/sustainability"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/sustainability"
                ? "bg-white text-black shadow-lg"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileText className={`w-4 h-4 ${pathname === "/sustainability" ? "text-black" : "text-neutral-400"}`} />
            <span>Reports</span>
          </Link>
        </nav>

        {/* Secondary Navigation Section */}
        <div className="pt-4 border-t border-white/5 space-y-1">
          <Link
            href="/ai-intelligence"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Workflow className="w-4 h-4 text-neutral-400" />
            <span>Automation</span>
          </Link>

          <Link
            href="/actions"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Users className="w-4 h-4 text-neutral-400" />
            <span>Team</span>
          </Link>

          <Link
            href="/data-sources"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/data-sources"
                ? "bg-white text-black shadow-lg"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Wrench className={`w-4 h-4 ${pathname === "/data-sources" ? "text-black" : "text-neutral-400"}`} />
            <span>Maintenance</span>
          </Link>
        </div>
      </div>

      {/* Bottom Pinned Section */}
      <div className="p-4 border-t border-white/5 space-y-3">
        <div className="space-y-1">
          <Link
            href="/sustainability"
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </Link>

          <Link
            href="/data-sources"
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#141620] border border-white/5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff5500] to-amber-400 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
              EA
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">Kate Russell</div>
              <div className="text-[10px] text-neutral-500 truncate">Operations Manager</div>
            </div>
          </div>
          <button className="text-neutral-500 hover:text-white p-1">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
