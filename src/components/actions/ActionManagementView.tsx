"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  Plus,
  ShieldCheck,
  Building as BuildingIcon,
  User,
  Calendar,
  FileText,
  RefreshCw,
  Search,
  Sparkles,
  Award,
} from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  detectedIssue: string;
  recommendedAction: string;
  assignedTeam: string;
  assignedPersonnel: string | null;
  deadline: string | null;
  completionStatus: string;
  priority: string;
  targetBuildingId: string | null;
  targetBuilding?: { id: string; name: string; code: string } | null;
  beforeKwh: number | null;
  afterKwh: number | null;
  verifiedKwhSavings: number | null;
  measurementPeriodDays: number | null;
  verificationMethod: string | null;
  verifiedCarbonSavingsKg: number | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  supportingEvidence: string | null;
  completionNotes: string | null;
  sdgAlignment: string | null;
  reportedAt: string;
  notes: string | null;
}

export function ActionManagementView() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sdgFilter, setSdgFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [verifyingAction, setVerifyingAction] = useState<ActionItem | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    title: "",
    detectedIssue: "",
    recommendedAction: "",
    assignedTeam: "Electrical Maintenance Unit",
    assignedPersonnel: "",
    priority: "MEDIUM",
    sdgAlignment: "SDG_7",
    deadline: "",
    beforeKwh: "",
    afterKwh: "",
    notes: "",
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Verification Form State
  const [verifyForm, setVerifyForm] = useState({
    beforeKwh: "",
    afterKwh: "",
    measurementPeriodDays: "30",
    verificationMethod: "30-day comparative sub-meter logging",
    supportingEvidence: "Sub-meter log data audit before and after operational schedule adjustments.",
    completionNotes: "Confirmed permanent load drop via building feeder meter telemetry.",
  });
  const [submittingVerify, setSubmittingVerify] = useState(false);

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/actions");
      if (!res.ok) throw new Error("Failed to fetch actions");
      const data = await res.json();
      setActions(data.actions || []);
    } catch (err: any) {
      setError(err.message || "Failed to load actions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingCreate(true);
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          beforeKwh: createForm.beforeKwh ? parseFloat(createForm.beforeKwh) : null,
          afterKwh: createForm.afterKwh ? parseFloat(createForm.afterKwh) : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create action");
      }

      setShowCreateModal(false);
      setCreateForm({
        title: "",
        detectedIssue: "",
        recommendedAction: "",
        assignedTeam: "Electrical Maintenance Unit",
        assignedPersonnel: "",
        priority: "MEDIUM",
        sdgAlignment: "SDG_7",
        deadline: "",
        beforeKwh: "",
        afterKwh: "",
        notes: "",
      });
      fetchActions();
    } catch (err: any) {
      alert("Error creating action: " + err.message);
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleUpdateStatus = async (actionId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionStatus: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update action status");
      fetchActions();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingAction) return;

    try {
      setSubmittingVerify(true);
      const before = parseFloat(verifyForm.beforeKwh);
      const after = parseFloat(verifyForm.afterKwh);
      const days = parseInt(verifyForm.measurementPeriodDays, 10);

      const res = await fetch(`/api/actions/${verifyingAction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completionStatus: "VERIFIED",
          beforeKwh: before,
          afterKwh: after,
          measurementPeriodDays: days,
          verificationMethod: verifyForm.verificationMethod,
          supportingEvidence: verifyForm.supportingEvidence,
          completionNotes: verifyForm.completionNotes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit verification");
      }

      setVerifyingAction(null);
      fetchActions();
    } catch (err: any) {
      alert("Verification failed: " + err.message);
    } finally {
      setSubmittingVerify(false);
    }
  };

  const openVerifyModal = (item: ActionItem) => {
    setVerifyingAction(item);
    setVerifyForm({
      beforeKwh: item.beforeKwh !== null ? String(item.beforeKwh) : "",
      afterKwh: item.afterKwh !== null ? String(item.afterKwh) : "",
      measurementPeriodDays: String(item.measurementPeriodDays || 30),
      verificationMethod: item.verificationMethod || "30-day comparative sub-meter logging",
      supportingEvidence: item.supportingEvidence || "Empirical sub-meter interval logs before and after intervention.",
      completionNotes: item.completionNotes || "Audited and verified energy reduction.",
    });
  };

  // Filter actions
  const filteredActions = actions.filter((item) => {
    if (statusFilter !== "ALL") {
      if (statusFilter === "VERIFIED" && item.completionStatus !== "VERIFIED" && item.completionStatus !== "COMPLETED_VERIFIED") {
        return false;
      }
      if (statusFilter !== "VERIFIED" && item.completionStatus !== statusFilter) {
        return false;
      }
    }
    if (priorityFilter !== "ALL" && item.priority !== priorityFilter) return false;
    if (sdgFilter !== "ALL" && item.sdgAlignment !== sdgFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchIssue = item.detectedIssue.toLowerCase().includes(q);
      const matchTeam = item.assignedTeam.toLowerCase().includes(q);
      const matchBuilding = item.targetBuilding?.name?.toLowerCase().includes(q) || item.targetBuilding?.code?.toLowerCase().includes(q);
      if (!matchTitle && !matchIssue && !matchTeam && !matchBuilding) return false;
    }
    return true;
  });

  const totalVerifiedSavings = actions.reduce((sum, a) => sum + (a.verifiedKwhSavings || 0), 0);
  const totalVerifiedCarbon = Number((totalVerifiedSavings * 0.637).toFixed(1));
  const verifiedCount = actions.filter((a) => a.completionStatus === "VERIFIED" || a.completionStatus === "COMPLETED_VERIFIED").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            Green Campus Action & Improvement Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end lifecycle tracking: problem detection, team assignment, empirical before-and-after baseline measurement, and verified kWh savings audit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Action Initiative</span>
          </button>
          <button
            onClick={fetchActions}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Campus Actions</span>
          <div className="text-2xl font-bold font-mono text-white">{actions.length}</div>
          <div className="text-[11px] text-slate-500">Active and completed interventions</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase font-semibold">Verified Permanent Savings</span>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {totalVerifiedSavings.toLocaleString()} <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 font-medium">Audited before-and-after measurements</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-1">
          <span className="text-[10px] text-purple-400 uppercase font-semibold">Verified Carbon Avoidance</span>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {totalVerifiedCarbon.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">0.637 kg CO₂e / kWh factor</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase font-semibold">Audit Verification Rate</span>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {actions.length > 0 ? Math.round((verifiedCount / actions.length) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-400">{verifiedCount} of {actions.length} projects fully audited</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action title, issue, building, or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="IDENTIFIED">Identified</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">SDG:</span>
            <select
              value={sdgFilter}
              onChange={(e) => setSdgFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="ALL">All SDGs</option>
              <option value="SDG_7">SDG 7 (Energy)</option>
              <option value="SDG_9">SDG 9 (Infra)</option>
              <option value="SDG_12">SDG 12 (Consumption)</option>
              <option value="SDG_13">SDG 13 (Climate)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading action initiatives...</div>
        ) : filteredActions.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
            No action initiatives found matching the current filters.
          </div>
        ) : (
          filteredActions.map((item) => {
            const isVerified = item.completionStatus === "VERIFIED" || item.completionStatus === "COMPLETED_VERIFIED";
            return (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm hover:border-slate-700 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isVerified
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : item.completionStatus === "COMPLETED"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : item.completionStatus === "IN_PROGRESS"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {item.completionStatus.replace(/_/g, " ")}
                    </span>

                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                        item.priority === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : item.priority === "HIGH"
                          ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.priority}
                    </span>

                    <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>

                    {item.targetBuilding && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                        {item.targetBuilding.code}
                      </span>
                    )}

                    {item.sdgAlignment && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        {item.sdgAlignment.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  {/* Actions / Lifecycle progression */}
                  <div className="flex items-center gap-2">
                    {!isVerified && (
                      <button
                        onClick={() => openVerifyModal(item)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Audit & Verify Savings</span>
                      </button>
                    )}

                    <select
                      value={item.completionStatus}
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                      className="text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="IDENTIFIED">Identified</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Detected Issue & Recommended Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block">
                      Detected Issue / Empirical Observation:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{item.detectedIssue}</p>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      Recommended Engineering Intervention:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{item.recommendedAction}</p>
                  </div>
                </div>

                {/* Team, Personnel, Deadline & Supporting Evidence */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Assigned Team</span>
                    <span className="font-semibold text-slate-200">{item.assignedTeam}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Lead Personnel</span>
                    <span className="text-slate-300">{item.assignedPersonnel || "Facilities Unit"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Target Deadline</span>
                    <span className="text-slate-300 font-mono">
                      {item.deadline ? new Date(item.deadline).toISOString().slice(0, 10) : "Open"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Measurement Period</span>
                    <span className="text-slate-300 font-mono">{item.measurementPeriodDays || 30} Days</span>
                  </div>
                </div>

                {/* Before-and-After Verification Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Baseline Before</span>
                      <span className="font-mono text-slate-200 font-bold">
                        {item.beforeKwh !== null ? `${item.beforeKwh} kWh` : "Pending baseline"}
                      </span>
                    </div>

                    {item.afterKwh !== null && (
                      <>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">Post-Intervention</span>
                          <span className="font-mono text-emerald-300 font-bold">{item.afterKwh} kWh</span>
                        </div>
                      </>
                    )}

                    {item.verificationMethod && (
                      <div className="hidden lg:block border-l border-slate-800 pl-4">
                        <span className="text-[10px] text-slate-500 block uppercase">Audit Protocol</span>
                        <span className="text-slate-400 text-[11px]">{item.verificationMethod}</span>
                      </div>
                    )}
                  </div>

                  {item.verifiedKwhSavings !== null ? (
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Verified Savings: {item.verifiedKwhSavings} kWh</span>
                      </div>
                      <div className="bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-lg text-xs font-bold">
                        {item.verifiedCarbonSavingsKg || Number(((item.verifiedKwhSavings || 0) * 0.637).toFixed(1))} kg CO₂e
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-400/80 italic flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Comparative measurement in cycle</span>
                    </div>
                  )}
                </div>

                {/* Verifier identity if verified */}
                {isVerified && item.verifiedBy && (
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 font-mono">
                    <span>Verified by: {item.verifiedBy}</span>
                    {item.verifiedAt && <span>• Audit Timestamp: {new Date(item.verifiedAt).toISOString().slice(0, 16)}</span>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE ACTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Create Energy Action Initiative
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initiative Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Building HVAC Thermostat Deadband Optimization"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detected Issue / Energy Leak *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe the detected inefficiency or AI-flagged anomaly..."
                  value={createForm.detectedIssue}
                  onChange={(e) => setCreateForm({ ...createForm, detectedIssue: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recommended Engineering Action *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Specific maintenance or schedule changes to execute..."
                  value={createForm.recommendedAction}
                  onChange={(e) => setCreateForm({ ...createForm, recommendedAction: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Team *</label>
                  <input
                    type="text"
                    required
                    value={createForm.assignedTeam}
                    onChange={(e) => setCreateForm({ ...createForm, assignedTeam: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lead Personnel / Engineer</label>
                  <input
                    type="text"
                    placeholder="e.g. Engr. Tanvir Ahmed"
                    value={createForm.assignedPersonnel}
                    onChange={(e) => setCreateForm({ ...createForm, assignedPersonnel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SDG Alignment</label>
                  <select
                    value={createForm.sdgAlignment}
                    onChange={(e) => setCreateForm({ ...createForm, sdgAlignment: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SDG_7">SDG 7 (Energy)</option>
                    <option value="SDG_9">SDG 9 (Infra)</option>
                    <option value="SDG_12">SDG 12 (Consumption)</option>
                    <option value="SDG_13">SDG 13 (Climate)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deadline</label>
                  <input
                    type="date"
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Baseline Before (kWh)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 5200"
                    value={createForm.beforeKwh}
                    onChange={(e) => setCreateForm({ ...createForm, beforeKwh: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Post-Intervention (kWh)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 4370"
                    value={createForm.afterKwh}
                    onChange={(e) => setCreateForm({ ...createForm, afterKwh: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingCreate ? "Saving..." : "Create Initiative"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY SAVINGS MODAL */}
      {verifyingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Audit & Verify Energy Savings</h3>
                  <p className="text-[11px] text-slate-400">Action: {verifyingAction.title}</p>
                </div>
              </div>
              <button
                onClick={() => setVerifyingAction(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Baseline Consumption (kWh) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 5200"
                    value={verifyForm.beforeKwh}
                    onChange={(e) => setVerifyForm({ ...verifyForm, beforeKwh: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Post-Intervention (kWh) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 4370"
                    value={verifyForm.afterKwh}
                    onChange={(e) => setVerifyForm({ ...verifyForm, afterKwh: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Live Savings Calculation Preview */}
              {verifyForm.beforeKwh && verifyForm.afterKwh && (
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-emerald-400 block uppercase font-sans">Verified Net Savings</span>
                    <span className="text-base font-bold text-emerald-300">
                      {Math.max(0, Number((parseFloat(verifyForm.beforeKwh) - parseFloat(verifyForm.afterKwh)).toFixed(1)))} kWh
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-purple-400 block uppercase font-sans">Avoided GHG Emissions</span>
                    <span className="text-base font-bold text-purple-300">
                      {Number((Math.max(0, parseFloat(verifyForm.beforeKwh) - parseFloat(verifyForm.afterKwh)) * 0.637).toFixed(1))} kg CO₂e
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Measurement Period (Days) *</label>
                  <input
                    type="number"
                    required
                    value={verifyForm.measurementPeriodDays}
                    onChange={(e) => setVerifyForm({ ...verifyForm, measurementPeriodDays: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Verification Method *</label>
                  <input
                    type="text"
                    required
                    value={verifyForm.verificationMethod}
                    onChange={(e) => setVerifyForm({ ...verifyForm, verificationMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supporting Telemetry Evidence</label>
                <textarea
                  rows={2}
                  value={verifyForm.supportingEvidence}
                  onChange={(e) => setVerifyForm({ ...verifyForm, supportingEvidence: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setVerifyingAction(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerify}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingVerify ? "Verifying..." : "Sign Off & Verify Savings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
