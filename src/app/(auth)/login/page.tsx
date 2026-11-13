"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Shield, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-teal-100/50 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center text-emerald-600 shadow-sm">
            <Zap className="w-6 h-6 fill-emerald-500/20" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">DIU GreenGrid</h1>
          <p className="text-xs text-slate-500">
            Daffodil International University • Smart Campus Energy Intelligence
          </p>
        </div>

        {/* Login Box */}
        <div className="p-7 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xl backdrop-blur-xl space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-800">Role-Based System Access</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sign in with your university credentials or select a demonstration role below.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                University Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@diu.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to GreenGrid"}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              Quick Demonstration Accounts (Phase 1 Evaluation)
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => fillCredentials("admin@diu.edu.bd", "Admin@GreenGrid2026!")}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700">
                    Administrator (Campus Directorate)
                  </div>
                  <div className="text-[10px] text-slate-500">admin@diu.edu.bd</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono font-medium">
                  ADMIN
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("facility@diu.edu.bd", "Facility@2026!")}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700">
                    Facility Manager (Electrical Div.)
                  </div>
                  <div className="text-[10px] text-slate-500">facility@diu.edu.bd</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium">
                  FACILITY_MGR
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("auditor@diu.edu.bd", "Auditor@2026!")}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700">
                    Sustainability Auditor / Researcher
                  </div>
                  <div className="text-[10px] text-slate-500">auditor@diu.edu.bd</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-mono font-medium">
                  AUDITOR
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>Software-First Smart Campus Operations • 0 Additional Hardware</p>
          <p className="text-[10px] text-slate-400">
            Compliant with DoE Bangladesh & IPCC 2006 Sustainability Standards
          </p>
        </div>
      </div>
    </div>
  );
}
