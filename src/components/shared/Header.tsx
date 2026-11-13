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
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "AUDITOR_VIEWER":
      default:
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    }
  };

  return (
    <header className="bg-[#0a0b0f] border-b border-white/5 px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#ff5500] flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,85,0,0.4)]">
          <Zap className="w-4 h-4 fill-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight">DIU GreenGrid</h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#181a24] text-neutral-300 border border-white/5">
              Software-First
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Daffodil International University • Ashulia Smart Campus Energy Intelligence
          </p>
        </div>
      </div>

      {/* Right: Quick Role Switcher & User Profile */}
      <div className="flex items-center gap-4">
        {/* Quick RBAC Switcher for Evaluation */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#141620] p-1 rounded-full border border-white/5 text-xs">
          <span className="text-[11px] text-neutral-400 px-2 flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#ff5500]" /> Role:
          </span>
          <button
            onClick={() => handleQuickSwitch("admin@diu.edu.bd")}
            disabled={switching || user?.role === "ADMIN"}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
              user?.role === "ADMIN"
                ? "bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => handleQuickSwitch("facility@diu.edu.bd")}
            disabled={switching || user?.role === "FACILITY_MANAGER"}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
              user?.role === "FACILITY_MANAGER"
                ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Facility Mgr
          </button>
          <button
            onClick={() => handleQuickSwitch("auditor@diu.edu.bd")}
            disabled={switching || user?.role === "AUDITOR_VIEWER"}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
              user?.role === "AUDITOR_VIEWER"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getRoleBadge(user.role)}`}>
                  {user.role.replace("_", " ")}
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">{user.email}</div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-[#141620] hover:bg-rose-950/30 text-neutral-400 hover:text-rose-400 border border-white/5 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#ff5500] hover:bg-[#e04b00] text-white shadow-sm transition-colors"
            >
              Sign In
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
