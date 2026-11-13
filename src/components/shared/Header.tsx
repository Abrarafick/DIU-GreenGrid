"use client";

import React, { useState } from "react";
import { UserSession } from "@/types";
import { Shield, User, LogOut, RefreshCw, Zap } from "lucide-react";

interface HeaderProps {
  user: UserSession | null;
  onRefresh?: () => void;
}

export function Header({ user, onRefresh }: HeaderProps) {
  const [switching, setSwitching] = useState(false);

  const handleQuickSwitch = async (roleEmail: string) => {
    setSwitching(true);
    try {
      let password = "Admin@GreenGrid2026!";
      if (roleEmail.includes("facility")) password = "Facility@2026!";
      if (roleEmail.includes("auditor")) password = "Auditor@2026!";

      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: roleEmail, password }),
      });
      window.location.reload();
    } catch (e) {
      console.error("Switch failed", e);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "FACILITY_MANAGER":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "AUDITOR_VIEWER":
      default:
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    }
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Zap className="w-5 h-5 fill-emerald-400/20" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-100 tracking-tight">DIU GreenGrid</h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              v1.0 • Software-First
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Daffodil International University • Ashulia Smart Campus Energy Intelligence
          </p>
        </div>
      </div>

      {/* Right: Quick Role Switcher & User Profile */}
      <div className="flex items-center gap-4">
        {/* Quick RBAC Switcher for Evaluation */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> Demo RBAC:
          </span>
          <button
            onClick={() => handleQuickSwitch("admin@diu.edu.bd")}
            disabled={switching || user?.role === "ADMIN"}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              user?.role === "ADMIN"
                ? "bg-rose-500/30 text-rose-200 font-medium"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => handleQuickSwitch("facility@diu.edu.bd")}
            disabled={switching || user?.role === "FACILITY_MANAGER"}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              user?.role === "FACILITY_MANAGER"
                ? "bg-emerald-500/30 text-emerald-200 font-medium"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Facility Mgr
          </button>
          <button
            onClick={() => handleQuickSwitch("auditor@diu.edu.bd")}
            disabled={switching || user?.role === "AUDITOR_VIEWER"}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              user?.role === "AUDITOR_VIEWER"
                ? "bg-cyan-500/30 text-cyan-200 font-medium"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Auditor
          </button>
        </div>

        {/* User Card */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${getRoleBadge(
                    user.role
                  )}`}
                >
                  {user.role.replace("_", " ")}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{user.email}</p>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Sign In
          </a>
        )}
      </div>
    </header>
  );
}
