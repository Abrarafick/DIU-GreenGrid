// Carbon Calculation Engine with Documented & Configurable Emission Factors
// Citations: Bangladesh Dept of Environment (DoE) & IPCC 2006 Guidelines

export interface CarbonCalculationResult {
  carbonKgEmittedFromGrid: number;
  carbonKgEmittedFromDiesel: number;
  totalCarbonKgEmitted: number;
  carbonKgAvoidedBySolar: number;
  netCarbonFootprintKg: number;
  calculationAssumptions: {
    gridFactorKgPerKwh: number;
    gridFactorSource: string;
    gridMethodology: string;
    gridStatus: string;
    dieselFactorKgPerLitre: number;
    dieselFactorSource: string;
    dieselMethodology: string;
    dieselStatus: string;
  };
}

/**
 * Documented reference benchmark values.
 * NOT authoritative statutory figures without site-specific utility and fuel lab verification.
 */
export const DEFAULT_EMISSION_FACTORS = {
  GRID_ELECTRICITY_CO2: {
    value: 0.637, // kg CO2e / kWh
    unit: "kg CO2e / kWh",
    source: "Bangladesh Department of Environment (DoE) & UNFCCC CDM Grid Emission Factor Study for Bangladesh National Grid",
    methodology: "UNFCCC ACM0002 Combined Margin (CM) weighting of Operating Margin (OM, dominated by natural gas and HFO/HSD peaking) and Build Margin (BM, recent capacity additions).",
    assumptions: "Combined margin factor based on national generation mix. Assumes standard transmission/distribution loss baseline. Non-authoritative reference estimate requiring annual gazette verification for statutory audit.",
    isAuthoritative: false,
  },
  DIESEL_FUEL_CO2: {
    value: 2.68, // kg CO2e / Litre
    unit: "kg CO2e / Litre",
    source: "2006 IPCC Guidelines for National Greenhouse Gas Inventories, Volume 2 (Energy), Chapter 2 (Stationary Combustion), Table 2.2",
    methodology: "Stoichiometric conversion: Net Calorific Value (43.0 TJ/Gg = 43.0 MJ/kg) × Default Carbon Emission Factor (74,100 kg CO2/TJ) × Oxidation Factor (1.0) × Standard Commercial Diesel Density (0.84 kg/L) = 43.0 × 74,100 × 10^-6 × 0.84 ≈ 2.676 kg CO2e/L (rounded to 2.68).",
    assumptions: "Complete stoichiometric combustion of unblended commercial high-speed diesel fuel. Density variations (0.82-0.86 kg/L) and engine thermal efficiency affect actual direct emissions.",
    isAuthoritative: false,
  },
};

/**
 * Calculates carbon emissions and avoided emissions based on technical energy metrics.
 * Strictly non-financial.
 */
export function calculateCarbonMetrics(params: {
  gridKwhConsumed: number;
  solarKwhGenerated: number;
  dieselLitresConsumed: number;
  gridFactorOverride?: number;
  dieselFactorOverride?: number;
}): CarbonCalculationResult {
  const gridFactor = params.gridFactorOverride ?? DEFAULT_EMISSION_FACTORS.GRID_ELECTRICITY_CO2.value;
  const dieselFactor = params.dieselFactorOverride ?? DEFAULT_EMISSION_FACTORS.DIESEL_FUEL_CO2.value;

  const carbonKgEmittedFromGrid = params.gridKwhConsumed * gridFactor;
  const carbonKgEmittedFromDiesel = params.dieselLitresConsumed * dieselFactor;
  const totalCarbonKgEmitted = carbonKgEmittedFromGrid + carbonKgEmittedFromDiesel;

  // Clean solar generation avoids emissions that would otherwise be drawn from the grid
  const carbonKgAvoidedBySolar = params.solarKwhGenerated * gridFactor;
  
  const netCarbonFootprintKg = Math.max(0, totalCarbonKgEmitted - carbonKgAvoidedBySolar);

  return {
    carbonKgEmittedFromGrid: Number(carbonKgEmittedFromGrid.toFixed(2)),
    carbonKgEmittedFromDiesel: Number(carbonKgEmittedFromDiesel.toFixed(2)),
    totalCarbonKgEmitted: Number(totalCarbonKgEmitted.toFixed(2)),
    carbonKgAvoidedBySolar: Number(carbonKgAvoidedBySolar.toFixed(2)),
    netCarbonFootprintKg: Number(netCarbonFootprintKg.toFixed(2)),
    calculationAssumptions: {
      gridFactorKgPerKwh: gridFactor,
      gridFactorSource: DEFAULT_EMISSION_FACTORS.GRID_ELECTRICITY_CO2.source,
      gridMethodology: DEFAULT_EMISSION_FACTORS.GRID_ELECTRICITY_CO2.methodology,
      gridStatus: "Reference Default Benchmark (Non-Authoritative)",
      dieselFactorKgPerLitre: dieselFactor,
      dieselFactorSource: DEFAULT_EMISSION_FACTORS.DIESEL_FUEL_CO2.source,
      dieselMethodology: DEFAULT_EMISSION_FACTORS.DIESEL_FUEL_CO2.methodology,
      dieselStatus: "IPCC Default Benchmark (Non-Authoritative)",
    },
  };
}
