"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Leaf,
  CheckSquare,
  Database,
  Cpu,
  Info,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Campus Overview",
      href: "/",
      icon: LayoutDashboard,
      description: "Grid balance, solar & diesel tracking",
    },
    {
      name: "Building Analytics",
      href: "/buildings",
      icon: Building2,
      description: "Floor area, baselines & EUI",
    },
    {
      name: "Sustainability & SDGs",
      href: "/sustainability",
      icon: Leaf,
      description: "SDG 7, 9, 12, 13 & Carbon accounting",
    },
    {
      name: "Action Management",
      href: "/actions",
      icon: CheckSquare,
      description: "Issues, teams & verified kWh savings",
    },
    {
      name: "Data & Provenance",
      href: "/data-sources",
      icon: Database,
      description: "Lineage, emission factors & APIs",
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-61px)] sticky top-[61px]">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Campus Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Software-First Architecture Card */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Architecture Notice</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            100% software integration. No new microcontrollers, smart meters, or electrical modifications required on campus.
          </p>
          <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Hardware added:</span>
            <span className="font-bold text-emerald-400">0 Devices</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px]">DIU GreenGrid • Phase 1 Foundation</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Configurable providers & transparent data lineage.
        </p>
      </div>
    </aside>
  );
}
