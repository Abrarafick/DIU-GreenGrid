// DIU GreenGrid TypeScript Definitions
// Strictly technical energy monitoring, sustainability & actions. No financial ROI or billing.

export type UserRole = "ADMIN" | "FACILITY_MANAGER" | "AUDITOR_VIEWER";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
}

export interface BuildingData {
  id: string;
  code: string;
  name: string;
  campusLocation: string;
  totalFloorAreaSqM: number;
  occupancyCapacity: number;
  primaryFunction: string;
  baselineDailyKwh: number;
  isActive: boolean;
}

export type EnergySourceType = "GRID" | "SOLAR" | "GENERATOR" | "BIOGAS";
export type OperationalStatus = "OPERATIONAL" | "UNVERIFIED_PILOT" | "UNAVAILABLE";

export interface EnergySourceData {
  id: string;
  code: string;
  name: string;
  sourceType: EnergySourceType;
  ratedCapacityKw: number;
  isRenewable: boolean;
  configuredProvider: string;
  monitoringMethod: string;
  operationalStatus: OperationalStatus;
  isActive: boolean;
}

export type IngestionMethod = 
  | "API_CONNECTOR" 
  | "CSV_EXCEL_IMPORT" 
  | "MANUAL_ENTRY" 
  | "DEMO_SIMULATION";

export interface DataSourceProvenanceData {
  id: string;
  code: string;
  name: string;
  ingestionMethod: IngestionMethod;
  isSimulated: boolean;
  confidenceRating: number; // 0.0 to 1.0
  sourceDetails: string;
  description: string;
}

export interface EnergyMetricData {
  id: string;
  timestamp: string | Date;
  buildingId?: string | null;
  building?: BuildingData | null;
  energySourceId?: string | null;
  energySource?: EnergySourceData | null;
  provenanceId: string;
  provenance: DataSourceProvenanceData;
  isSimulated: boolean;
  kwhConsumed: number;
  solarKwhGenerated: number;
  dieselLitres: number; // Technical monitoring
  generatorRuntimeHours: number;
  peakDemandKw?: number | null;
  powerFactor?: number | null;
  carbonKgEmitted: number;
  carbonKgAvoided: number;
  notes?: string | null;
}

export interface EmissionFactorData {
  id: string;
  factorKey: string;
  factorName: string;
  unit: string;
  value: number;
  sourceDocumentation: string;
  methodology: string;
  assumptions: string;
  isAuthoritative: boolean;
  isConfigurable: boolean;
  updatedAt: string | Date;
}

export type ActionStatus = "IDENTIFIED" | "IN_PROGRESS" | "COMPLETED_VERIFIED" | "CANCELLED";
export type ActionPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ActionImprovementData {
  id: string;
  title: string;
  detectedIssue: string;
  recommendedAction: string;
  assignedTeam: string;
  completionStatus: ActionStatus;
  priority: ActionPriority;
  targetBuildingId?: string | null;
  targetBuilding?: BuildingData | null;
  beforeKwh?: number | null;
  afterKwh?: number | null;
  verifiedKwhSavings?: number | null;
  verificationMethod?: string | null;
  reportedAt: string | Date;
  completedAt?: string | Date | null;
  notes?: string | null;
}

// Sustainability & SDG Indicators (SDG 7, 9, 12, 13, and optional 11)
export interface SDGReport {
  // SDG 7: Affordable & Clean Energy
  sdg7: {
    totalGenerationKwh: number;
    solarGenerationKwh: number;
    renewableSharePercent: number;
    cleanEnergyUptimePercent: number;
  };
  // SDG 9: Industry, Innovation, and Infrastructure
  sdg9: {
    smartMonitoringCoveragePercent: number;
    submeterDigitalizationRate: number;
    gridStabilityIndex: number;
  };
  // SDG 12: Responsible Consumption & Production
  sdg12: {
    totalCampusConsumptionKwh: number;
    perCapitaConsumptionKwhPerDay: number;
    nighttimeBaseloadFractionPercent: number;
    wasteReductionVerifiedKwh: number;
  };
  // SDG 13: Climate Action
  sdg13: {
    netCarbonEmittedKg: number;
    solarCarbonAvoidedKg: number;
    netEmissionsIntensityKgPerSqm: number;
    configuredGridEmissionFactor: number;
    configuredDieselEmissionFactor: number;
  };
  // SDG 11: Sustainable Cities & Communities (Optional Indicator)
  sdg11?: {
    campusGreenScore: number;
    ecoFacilityIndex: number;
  };
}
