// Downloadable CSV & Excel Templates Generator for DIU GreenGrid

export interface IngestionTemplate {
  key: string;
  filename: string;
  title: string;
  description: string;
  headers: string[];
  sampleRows: string[][];
}

export const INGESTION_TEMPLATES: Record<string, IngestionTemplate> = {
  grid_meters: {
    key: "grid_meters",
    filename: "diu-greengrid-grid-meter-template.csv",
    title: "Government Grid & Campus Building Meter Readings",
    description: "For importing sub-station incomer readings and academic/dormitory building consumption logs.",
    headers: ["timestamp", "building_code", "kwh_consumed", "peak_demand_kw", "power_factor", "notes"],
    sampleRows: [
      ["2026-11-12 08:00:00", "AB-01", "345.5", "110.2", "0.95", "Morning lecture hall baseline"],
      ["2026-11-12 08:00:00", "AB-02", "410.0", "135.8", "0.93", "Computer labs startup load"],
      ["2026-11-12 08:00:00", "YK-SG", "180.2", "65.0", "0.96", "Dormitory morning cycle"],
      ["2026-11-12 12:00:00", "AB-01", "520.4", "148.0", "0.94", "Midday class peak"],
    ],
  },

  solar_inverters: {
    key: "solar_inverters",
    filename: "diu-greengrid-solar-inverter-template.csv",
    title: "Campus Rooftop Solar PV Inverter Export",
    description: "For importing automated or manual exports from campus on-grid solar string inverters.",
    headers: ["timestamp", "solar_kwh_generated", "peak_demand_kw", "notes"],
    sampleRows: [
      ["2026-11-12 08:00:00", "185.0", "65.5", "Morning solar irradiance ramp-up"],
      ["2026-11-12 10:00:00", "420.0", "142.0", "Clear sky high yield period"],
      ["2026-11-12 12:00:00", "640.5", "210.0", "Peak midday generation window"],
      ["2026-11-12 14:00:00", "480.0", "160.0", "Afternoon yield"],
    ],
  },

  diesel_generator: {
    key: "diesel_generator",
    filename: "diu-greengrid-diesel-genset-template.csv",
    title: "Standby Diesel Generator Technical Logbook",
    description: "Strictly technical logging of generator operating hours, fuel litres consumed, and kWh generated.",
    headers: ["timestamp", "diesel_litres", "generator_runtime_hours", "generator_kwh_generated", "notes"],
    sampleRows: [
      ["2026-11-10 12:00:00", "45.5", "1.5", "135.0", "Routine 1.5hr maintenance test run under partial load"],
      ["2026-11-03 14:00:00", "60.0", "2.0", "180.0", "Monthly sub-station changeover trial"],
    ],
  },

  biogas_pilot: {
    key: "biogas_pilot",
    filename: "diu-greengrid-biogas-pilot-template.csv",
    title: "Campus Organic Waste Biogas Pilot Plant Log",
    description: "For tracking pilot organic waste digestate production, biogas volume (m³), and generated electrical kWh.",
    headers: ["timestamp", "biogas_m3_consumed", "biogas_kwh_generated", "notes"],
    sampleRows: [
      ["2026-11-12 10:00:00", "8.5", "14.2", "Cafeteria food waste anaerobic digester pilot output"],
      ["2026-11-12 14:00:00", "7.0", "11.8", "Afternoon biogas generation run"],
    ],
  },

  unified_multi_source: {
    key: "unified_multi_source",
    filename: "diu-greengrid-unified-telemetry-template.csv",
    title: "Unified Multi-Source Comprehensive Template",
    description: "Master template supporting all 4 campus energy sources with automatic column detection.",
    headers: [
      "timestamp",
      "source_code",
      "building_code",
      "kwh_consumed",
      "solar_kwh_generated",
      "diesel_litres",
      "generator_runtime_hours",
      "generator_kwh_generated",
      "biogas_m3_consumed",
      "biogas_kwh_generated",
      "peak_demand_kw",
      "power_factor",
      "notes",
    ],
    sampleRows: [
      ["2026-11-12 08:00:00", "GRID_SUPPLY", "AB-01", "340.5", "0", "0", "0", "0", "0", "0", "105.0", "0.95", "Grid load"],
      ["2026-11-12 12:00:00", "SOLAR_ROOFTOP", "", "0", "620.0", "0", "0", "0", "0", "0", "205.0", "0.98", "Solar peak"],
      ["2026-11-12 12:00:00", "CAMPUS_GENSET", "AB-01", "0", "0", "45.5", "1.5", "135.0", "0", "0", "90.0", "0.92", "Generator run"],
      ["2026-11-12 12:00:00", "BIOGAS_PILOT", "", "0", "0", "0", "0", "0", "8.5", "14.2", "4.0", "0.90", "Biogas pilot"],
    ],
  },
};

/**
 * Returns CSV text content for a requested template key.
 */
export function generateCsvTemplate(templateKey: string): string {
  const template = INGESTION_TEMPLATES[templateKey] || INGESTION_TEMPLATES.unified_multi_source;
  const headerLine = template.headers.join(",");
  const rows = template.sampleRows.map((r) =>
    r.map((val) => (val.includes(",") ? `"${val}"` : val)).join(",")
  );
  return [headerLine, ...rows].join("\n");
}
