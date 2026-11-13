// Data Provenance & Lineage Utilities
// Guarantees transparent distinction between live, manual, and simulated demo data.

import { IngestionMethod } from "@/types";

export interface ProvenanceBadgeConfig {
  label: string;
  badgeClass: string;
  indicatorColor: string;
  description: string;
}

export function getProvenanceBadgeConfig(
  method: IngestionMethod,
  isSimulated: boolean
): ProvenanceBadgeConfig {
  if (isSimulated || method === "DEMO_SIMULATION") {
    return {
      label: "SIMULATED (DEMO DATA)",
      badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
      indicatorColor: "bg-amber-400",
      description: "Synthetic test data generated for evaluation and prototype testing. Not real DIU physical readings.",
    };
  }

  switch (method) {
    case "API_CONNECTOR":
      return {
        label: "VERIFIED LIVE API",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
        indicatorColor: "bg-emerald-400",
        description: "Authenticated digital feed from existing inverter/monitoring interface.",
      };
    case "CSV_EXCEL_IMPORT":
      return {
        label: "CSV / EXCEL IMPORT",
        badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
        indicatorColor: "bg-blue-400",
        description: "Imported via authorized historical spreadsheet/digital log export.",
      };
    case "MANUAL_ENTRY":
      return {
        label: "VERIFIED MANUAL ENTRY",
        badgeClass: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
        indicatorColor: "bg-purple-400",
        description: "Authorized manual logbook entry recorded by campus facility staff.",
      };
    default:
      return {
        label: "UNKNOWN SOURCE",
        badgeClass: "bg-slate-500/10 text-slate-400 border border-slate-500/30",
        indicatorColor: "bg-slate-400",
        description: "Unverified data source.",
      };
  }
}
