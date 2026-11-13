/**
 * Carbon Accounting & Greenhouse Gas (GHG) Inventory Module (Phase 5)
 * 
 * Complies with GHG Protocol Corporate Accounting Standard:
 * - Scope 1 Direct Emissions: Standby diesel generator fuel combustion
 * - Scope 2 Indirect Emissions: Grid utility electricity consumption
 * - Avoided Emissions: On-campus consumed clean renewable electricity
 * - Verified Reductions: Permanent savings from completed and audited action items
 * - NON-DOUBLE-COUNTING: Clean solar surplus not consumed on campus is strictly excluded from avoided emissions.
 */

export interface EmissionFactorMetadata {
  factorKey: string;
  name: string;
  unit: string;
  value: number;
  source: string;
  methodology: string;
  assumptions: string;
  isAuthoritative: boolean;
}

export interface CarbonAccountingSummary {
  scope1DieselEmissionsKg: number;
  scope2GridEmissionsKg: number;
  grossEmissionsKg: number;
  avoidedEmissionsKg: number;
  netEmissionsKg: number;
  verifiedReductionSavingsKg: number;
  dieselLitresBurned: number;
  gridImportKwh: number;
  cleanRenewableConsumedKwh: number;
  cleanRenewableSurplusKwh: number;
  factors: EmissionFactorMetadata[];
  accountingStandard: string;
  nonDoubleCountingProtocol: string;
}

export function computeCarbonAccounting(
  metrics: any[],
  actions: any[],
  customFactors?: any[]
): CarbonAccountingSummary {
  let totalDieselLitres = 0;
  let totalDemandKwh = 0;
  let totalSolarKwh = 0;
  let totalBiogasKwh = 0;
  let totalDieselKwh = 0;

  metrics.forEach((m) => {
    totalDieselLitres += m.dieselLitres || 0;
    totalDemandKwh += m.kwhConsumed || 0;
    totalSolarKwh += m.solarKwhGenerated || 0;
    totalBiogasKwh += m.biogasKwhGenerated || 0;
    totalDieselKwh += m.generatorKwhGenerated || 0;
  });

  // Calculate self-consumption vs surplus
  const intervalMap: Map<string, { demand: number; renewable: number; diesel: number }> = new Map();
  metrics.forEach((m) => {
    const d = new Date(m.timestamp);
    const key = `${d.toISOString().slice(0, 10)} ${String(Math.floor(d.getHours() / 4) * 4).padStart(2, "0")}:00`;
    let intv = intervalMap.get(key);
    if (!intv) {
      intv = { demand: 0, renewable: 0, diesel: 0 };
      intervalMap.set(key, intv);
    }
    intv.demand += m.kwhConsumed || 0;
    intv.renewable += (m.solarKwhGenerated || 0) + (m.biogasKwhGenerated || 0);
    intv.diesel += m.generatorKwhGenerated || 0;
  });

  let renewableConsumedKwh = 0;
  let renewableSurplusKwh = 0;
  let totalGridImportKwh = 0;

  intervalMap.forEach((intv) => {
    const renConsumed = Math.min(intv.renewable, intv.demand);
    const renSurplus = Math.max(0, intv.renewable - intv.demand);
    renewableConsumedKwh += renConsumed;
    renewableSurplusKwh += renSurplus;

    const netDeficit = Math.max(0, intv.demand - renConsumed - intv.diesel);
    totalGridImportKwh += netDeficit * 1.042;
  });

  const gridFactor = 0.637; // kg CO2e / kWh (DoE / ACM0002)
  const dieselFactor = 2.68; // kg CO2e / Litre (IPCC 2006)

  const scope1 = Number((totalDieselLitres * dieselFactor).toFixed(1));
  const scope2 = Number((totalGridImportKwh * gridFactor).toFixed(1));
  const gross = Number((scope1 + scope2).toFixed(1));
  const avoided = Number((renewableConsumedKwh * gridFactor).toFixed(1));
  const net = Number(Math.max(0, gross - avoided).toFixed(1));

  // Verified reductions from completed & audited actions
  const verifiedActions = actions.filter(
    (a) => a.completionStatus === "VERIFIED" || a.completionStatus === "COMPLETED_VERIFIED"
  );
  const totalVerifiedKwh = verifiedActions.reduce((acc, a) => acc + (a.verifiedKwhSavings || 0), 0);
  const verifiedReductionSavingsKg = Number((totalVerifiedKwh * gridFactor).toFixed(1));

  const factors: EmissionFactorMetadata[] = [
    {
      factorKey: "GRID_ELECTRICITY_CO2",
      name: "National Grid Combined Margin Carbon Intensity",
      unit: "kg CO2e / kWh",
      value: gridFactor,
      source: "Bangladesh Department of Environment (DoE) & UNFCCC CDM Grid Emission Factor Study",
      methodology: "UNFCCC ACM0002 Combined Margin: 50% Operating Margin (OM) + 50% Build Margin (BM)",
      assumptions: "Reference benchmark. Assumes national average transmission/distribution losses. Non-authoritative.",
      isAuthoritative: false,
    },
    {
      factorKey: "DIESEL_FUEL_CO2",
      name: "Stationary Diesel Fuel Combustion Emission Factor",
      unit: "kg CO2e / Litre",
      value: dieselFactor,
      source: "2006 IPCC Guidelines for National GHG Inventories, Vol. 2 (Energy), Ch. 2, Table 2.2",
      methodology: "Direct stoichiometry: 43.0 MJ/kg NCV × 74,100 kg CO2/TJ × 0.84 kg/L density = 2.676 kg CO2e/L",
      assumptions: "Complete stoichiometric combustion of unblended commercial high-speed diesel.",
      isAuthoritative: false,
    },
  ];

  return {
    scope1DieselEmissionsKg: scope1,
    scope2GridEmissionsKg: scope2,
    grossEmissionsKg: gross,
    avoidedEmissionsKg: avoided,
    netEmissionsKg: net,
    verifiedReductionSavingsKg,
    dieselLitresBurned: Number(totalDieselLitres.toFixed(1)),
    gridImportKwh: Number(totalGridImportKwh.toFixed(1)),
    cleanRenewableConsumedKwh: Number(renewableConsumedKwh.toFixed(1)),
    cleanRenewableSurplusKwh: Number(renewableSurplusKwh.toFixed(1)),
    factors,
    accountingStandard: "GHG Protocol Corporate Standard (Operational Control Approach)",
    nonDoubleCountingProtocol:
      "Strict anti-double-counting boundary: Only clean electricity actually consumed by campus facilities is credited as avoiding grid Scope 2 emissions. Unutilized solar generation surplus is accounted separately and is NOT credited as avoided emissions.",
  };
}
