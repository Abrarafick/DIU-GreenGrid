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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
            <Zap className="w-6 h-6 fill-emerald-400/20" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DIU GreenGrid</h1>
          <p className="text-xs text-slate-400">
            Daffodil International University • Smart Campus Energy Intelligence
          </p>
        </div>

        {/* Login Box */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-200">Role-Based System Access</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sign in with your university credentials or select a demonstration role below.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                University Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@diu.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to GreenGrid"}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
              Quick Demonstration Accounts (Phase 1 Evaluation)
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => fillCredentials("admin@diu.edu.bd", "Admin@GreenGrid2026!")}
                className="w-full p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-300 group-hover:text-emerald-400">
                    Administrator (Campus Directorate)
                  </div>
                  <div className="text-[10px] text-slate-400">admin@diu.edu.bd</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
                  ADMIN
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("facility@diu.edu.bd", "Facility@2026!")}
                className="w-full p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-300 group-hover:text-emerald-400">
                    Facility Manager (Electrical Div.)
                  </div>
                  <div className="text-[10px] text-slate-400">facility@diu.edu.bd</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                  FACILITY_MGR
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("auditor@diu.edu.bd", "Auditor@2026!")}
                className="w-full p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-300 group-hover:text-emerald-400">
                    Sustainability Auditor / Researcher
                  </div>
                  <div className="text-[10px] text-slate-400">auditor@diu.edu.bd</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                  AUDITOR
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="text-center text-[11px] text-slate-400 space-y-1">
          <p>Software-First Smart Campus Operations • 0 Additional Hardware</p>
          <p className="text-[10px] text-slate-400">
            Compliant with DoE Bangladesh & IPCC 2006 Sustainability Standards
          </p>
        </div>
      </div>
    </div>
  );
}
