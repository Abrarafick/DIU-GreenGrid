// Unit Normalization & Timestamp Parser for DIU GreenGrid Ingestion Engine

/**
 * Parses diverse timestamp formats into a valid JS Date.
 * Handles ISO strings, YYYY-MM-DD HH:mm, DD/MM/YYYY HH:mm, Excel serial numbers, and Unix timestamps.
 */
export function parseNormalizedTimestamp(input: any): Date | null {
  if (!input) return null;

  // Case 1: Already Date
  if (input instanceof Date && !isNaN(input.getTime())) {
    return input;
  }

  // Case 2: Excel numerical serial date (e.g. 45200.5)
  if (typeof input === "number") {
    // Excel epoch starts at 1899-12-30
    if (input > 30000 && input < 60000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const ms = Math.round(input * 86400 * 1000);
      const parsed = new Date(excelEpoch.getTime() + ms);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    // Unix timestamp (ms or s)
    if (input > 1000000000000) return new Date(input);
    if (input > 1000000000) return new Date(input * 1000);
  }

  if (typeof input !== "string") return null;
  const str = input.trim();
  if (!str) return null;

  // Case 3: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const minute = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const second = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    const parsed = new Date(year, month, day, hour, minute, second);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // Case 4: Standard ISO / Date constructor
  const std = new Date(str);
  if (!isNaN(std.getTime())) {
    return std;
  }

  return null;
}

/**
 * Normalizes energy values to kilowatt-hours (kWh).
 */
export function normalizeToKwh(value: any, declaredUnit?: string): number {
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num) || num < 0) return 0.0;

  const unit = (declaredUnit || "").trim().toLowerCase();
  if (unit === "mwh") return num * 1000.0;
  if (unit === "wh" || unit === "w-h") return num / 1000.0;
  if (unit === "gwh") return num * 1000000.0;
  return num; // Default is kWh
}

/**
 * Normalizes power demand values to kilowatts (kW).
 */
export function normalizeToKw(value: any, declaredUnit?: string): number | null {
  if (value === undefined || value === null || value === "") return null;
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num) || num < 0) return null;

  const unit = (declaredUnit || "").trim().toLowerCase();
  if (unit === "mw") return num * 1000.0;
  if (unit === "w") return num / 1000.0;
  return num; // Default is kW
}

/**
 * Normalizes liquid fuel volume to Litres.
 */
export function normalizeToLitres(value: any, declaredUnit?: string): number {
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num) || num < 0) return 0.0;

  const unit = (declaredUnit || "").trim().toLowerCase();
  if (unit === "gal" || unit === "gallons" || unit === "us_gal") return num * 3.78541;
  if (unit === "ml") return num / 1000.0;
  return num; // Default is Litres
}

/**
 * Normalizes gas volume to cubic meters (m³).
 */
export function normalizeToM3(value: any, declaredUnit?: string): number {
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num) || num < 0) return 0.0;

  const unit = (declaredUnit || "").trim().toLowerCase();
  if (unit === "litres" || unit === "l") return num / 1000.0;
  if (unit === "cuft" || unit === "ft3") return num * 0.0283168;
  return num; // Default is m³
}
