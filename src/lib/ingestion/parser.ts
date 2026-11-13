import Papa from "papaparse";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import {
  parseNormalizedTimestamp,
  normalizeToKwh,
  normalizeToKw,
  normalizeToLitres,
  normalizeToM3,
} from "./normalizer";
import { calculateCarbonMetrics } from "@/lib/carbon";
import {
  IngestionValidationError,
  ValidatedIngestionResult,
} from "@/types";

interface ParseOptions {
  provenanceId?: string;
  defaultBuildingId?: string;
  defaultEnergySourceId?: string;
  isSimulated?: boolean;
}

/**
 * Universal Ingestion Parser for CSV and Excel files.
 */
export async function parseIngestionBuffer(
  buffer: Buffer,
  fileType: "CSV" | "EXCEL",
  options: ParseOptions = {}
): Promise<ValidatedIngestionResult> {
  let rawRows: any[] = [];

  if (fileType === "CSV") {
    const csvString = buffer.toString("utf-8");
    const parsed = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });
    rawRows = parsed.data;
  } else {
    // Excel workbook
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }

  // Pre-load reference maps for fast validation
  const buildings = await db.building.findMany({ select: { id: true, code: true } });
  const buildingMap = new Map(buildings.map((b) => [b.code.toUpperCase(), b.id]));

  const energySources = await db.energySource.findMany({ select: { id: true, code: true } });
  const sourceMap = new Map(energySources.map((s) => [s.code.toUpperCase(), s.id]));

  // Active emission factors
  const factors = await db.emissionFactorConfig.findMany();
  const gridFactorObj = factors.find((f) => f.factorKey === "GRID_ELECTRICITY_CO2");
  const dieselFactorObj = factors.find((f) => f.factorKey === "DIESEL_FUEL_CO2");
  const gridFactor = gridFactorObj ? gridFactorObj.value : 0.637;
  const dieselFactor = dieselFactorObj ? dieselFactorObj.value : 2.68;

  const totalRows = rawRows.length;
  const acceptedRows: ValidatedIngestionResult["acceptedRows"] = [];
  const errors: IngestionValidationError[] = [];
  let duplicateRows = 0;
  let rejectedRows = 0;

  const now = new Date();
  const maxAllowedFutureTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h tolerance

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 1;
    const raw = rawRows[i];

    // Helper to find column by aliases (case & separator insensitive)
    const getVal = (...aliases: string[]) => {
      for (const key of Object.keys(raw)) {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
        for (const alias of aliases) {
          const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (cleanKey === cleanAlias && raw[key] !== undefined && raw[key] !== "") {
            return raw[key];
          }
        }
      }
      return undefined;
    };

    // 1. Timestamp validation
    const rawTime = getVal("timestamp", "time", "date", "datetime", "reading_time", "period");
    const parsedDate = parseNormalizedTimestamp(rawTime);

    if (!parsedDate) {
      errors.push({
        row: rowNum,
        field: "timestamp",
        value: rawTime,
        message: "Missing or unparseable timestamp format. Expected ISO, YYYY-MM-DD HH:mm, or Excel serial.",
      });
      rejectedRows++;
      continue;
    }

    if (parsedDate > maxAllowedFutureTime) {
      errors.push({
        row: rowNum,
        field: "timestamp",
        value: parsedDate.toISOString(),
        message: "Timestamp is in the future beyond acceptable synchronization tolerance (+24h).",
      });
      rejectedRows++;
      continue;
    }

    // 2. Building resolution
    const rawBuilding = getVal("building_code", "building", "bldg", "facility", "facility_code");
    let buildingId: string | null = options.defaultBuildingId || null;
    if (rawBuilding) {
      const matched = buildingMap.get(String(rawBuilding).trim().toUpperCase());
      if (matched) {
        buildingId = matched;
      } else {
        errors.push({
          row: rowNum,
          field: "building_code",
          value: rawBuilding,
          message: `Unknown campus building code '${rawBuilding}'. Valid codes: ${Array.from(buildingMap.keys()).join(", ")}`,
        });
      }
    }

    // 3. Source resolution
    const rawSource = getVal("source_code", "energy_source", "source", "source_type");
    let energySourceId: string | null = options.defaultEnergySourceId || null;
    if (rawSource) {
      const matched = sourceMap.get(String(rawSource).trim().toUpperCase());
      if (matched) {
        energySourceId = matched;
      }
    }

    // Default to grid supply if not explicitly set
    if (!energySourceId && sourceMap.has("GRID_SUPPLY")) {
      energySourceId = sourceMap.get("GRID_SUPPLY") || null;
    }

    // 4. Metric extractions & unit normalizations
    const rawKwh = getVal("kwh_consumed", "kwh", "energy_kwh", "consumption_kwh", "energy");
    const rawSolar = getVal("solar_kwh_generated", "solar_kwh", "solar_yield", "solar_generation");
    const rawDieselLitres = getVal("diesel_litres", "diesel_l", "fuel_litres", "fuel_l", "diesel_consumed");
    const rawGenHours = getVal("generator_runtime_hours", "runtime_hours", "gen_hours", "operating_hours");
    const rawGenKwh = getVal("generator_kwh_generated", "generator_kwh", "gen_kwh");
    const rawBiogasM3 = getVal("biogas_m3_consumed", "biogas_m3", "biogas_volume", "biogas_consumed_m3");
    const rawBiogasKwh = getVal("biogas_kwh_generated", "biogas_kwh", "biogas_generation_kwh");
    const rawPeakKw = getVal("peak_demand_kw", "peak_kw", "max_demand_kw", "demand_kw");
    const rawPf = getVal("power_factor", "pf");
    const rawNotes = getVal("notes", "remarks", "comment", "description");

    const kwhConsumed = normalizeToKwh(rawKwh);
    const solarKwhGenerated = normalizeToKwh(rawSolar);
    const dieselLitres = normalizeToLitres(rawDieselLitres);
    const generatorRuntimeHours = rawGenHours ? Math.max(0, parseFloat(rawGenHours) || 0) : 0.0;
    const generatorKwhGenerated = normalizeToKwh(rawGenKwh);
    const biogasM3Consumed = normalizeToM3(rawBiogasM3);
    const biogasKwhGenerated = normalizeToKwh(rawBiogasKwh);
    const peakDemandKw = normalizeToKw(rawPeakKw);

    let powerFactor: number | null = null;
    if (rawPf !== undefined && rawPf !== null && rawPf !== "") {
      const pfNum = parseFloat(rawPf);
      if (!isNaN(pfNum) && pfNum >= 0 && pfNum <= 1.0) {
        powerFactor = Number(pfNum.toFixed(2));
      } else {
        errors.push({
          row: rowNum,
          field: "power_factor",
          value: rawPf,
          message: "Power factor must be a numerical ratio between 0.00 and 1.00.",
        });
      }
    }

    // 5. Negative value check
    if (kwhConsumed < 0 || solarKwhGenerated < 0 || dieselLitres < 0 || biogasM3Consumed < 0) {
      errors.push({
        row: rowNum,
        message: "Energy and fuel quantities cannot be negative.",
      });
      rejectedRows++;
      continue;
    }

    // 6. Duplicate detection check against DB
    // Window: +/- 10 minutes around the timestamp for the exact same building & source
    const windowStart = new Date(parsedDate.getTime() - 10 * 60 * 1000);
    const windowEnd = new Date(parsedDate.getTime() + 10 * 60 * 1000);

    const existingMatch = await db.energyMetric.findFirst({
      where: {
        timestamp: { gte: windowStart, lte: windowEnd },
        buildingId: buildingId || undefined,
        energySourceId: energySourceId || undefined,
      },
    });

    if (existingMatch) {
      duplicateRows++;
      continue; // Skip duplicate to protect database integrity
    }

    // 7. Calculate carbon emissions (technical only)
    const carbonResult = calculateCarbonMetrics({
      gridKwhConsumed: kwhConsumed,
      solarKwhGenerated: solarKwhGenerated + biogasKwhGenerated,
      dieselLitresConsumed: dieselLitres,
      gridFactorOverride: gridFactor,
      dieselFactorOverride: dieselFactor,
    });

    acceptedRows.push({
      timestamp: parsedDate,
      buildingId,
      energySourceId,
      kwhConsumed,
      solarKwhGenerated,
      dieselLitres,
      generatorRuntimeHours,
      generatorKwhGenerated,
      biogasM3Consumed,
      biogasKwhGenerated,
      peakDemandKw,
      powerFactor,
      carbonKgEmitted: carbonResult.totalCarbonKgEmitted,
      carbonKgAvoided: carbonResult.carbonKgAvoidedBySolar,
      notes: rawNotes ? String(rawNotes).trim() : null,
      rawPayload: JSON.stringify(raw),
    });
  }

  return {
    totalRows,
    acceptedRows,
    duplicateRows,
    rejectedRows,
    errors,
  };
}
