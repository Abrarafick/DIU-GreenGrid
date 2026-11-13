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

export interface IngestionBatchData {
  id: string;
  filename: string;
  fileType: string;
  sourceType: IngestionMethod;
  isSimulated: boolean;
  totalRows: number;
  successfulRows: number;
  rejectedRows: number;
  duplicateRows: number;
  validationErrorsJson?: string | null;
  summaryNotes?: string | null;
  importedBy: string;
  createdAt: string | Date;
  provenanceId?: string | null;
  provenance?: DataSourceProvenanceData | null;
}

export interface ApiAdapterConfigData {
  id: string;
  name: string;
  adapterType: "SOLAR_INVERTER" | "GRID_METER" | "GENSET_TELEMETRY" | "BIOGAS_MONITOR";
  baseUrl: string;
  authType: "API_KEY" | "BEARER_TOKEN" | "BASIC_AUTH" | "NONE";
  authKeyMasked?: string | null;
  pollingIntervalMins: number;
  status: "CONFIGURED_IDLE" | "ACTIVE_SYNCING" | "CONNECTION_ERROR" | "MOCK_SYNC_OK";
  lastSyncAt?: string | Date | null;
  lastSyncStatus?: string | null;
  lastSyncMessage?: string | null;
  isSimulatedFallback: boolean;
  isEnabled: boolean;
  targetEnergySourceId?: string | null;
  targetEnergySource?: EnergySourceData | null;
}

export interface EnergyMetricData {
  id: string;
  timestamp: string | Date;
  buildingId?: string | null;
  building?: BuildingData | null;
  energySourceId?: string | null;
  energySource?: EnergySourceData | null;
  provenanceId: string;
  provenance?: DataSourceProvenanceData;
  batchId?: string | null;
  batch?: IngestionBatchData | null;
  isSimulated: boolean;
  
  // Technical measurements
  kwhConsumed: number;
  peakDemandKw?: number | null;
  powerFactor?: number | null;
  solarKwhGenerated: number;
  dieselLitres: number;
  generatorRuntimeHours: number;
  generatorKwhGenerated: number;
  biogasM3Consumed: number;
  biogasKwhGenerated: number;

  carbonKgEmitted: number;
  carbonKgAvoided: number;
  notes?: string | null;
  rawPayload?: string | null;
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

// Ingestion Parsing & Validation interfaces
export interface IngestionRowInput {
  timestamp: string;
  buildingCode?: string;
  sourceCode?: string;
  kwhConsumed?: number | string;
  solarKwhGenerated?: number | string;
  dieselLitres?: number | string;
  generatorRuntimeHours?: number | string;
  generatorKwhGenerated?: number | string;
  biogasM3Consumed?: number | string;
  biogasKwhGenerated?: number | string;
  peakDemandKw?: number | string;
  powerFactor?: number | string;
  unit?: string; // e.g. "kWh", "MWh", "W", "Litres", "m3"
  notes?: string;
}

export interface IngestionValidationError {
  row: number;
  field?: string;
  value?: any;
  message: string;
}

export interface ValidatedIngestionResult {
  totalRows: number;
  acceptedRows: Array<{
    timestamp: Date;
    buildingId?: string | null;
    energySourceId?: string | null;
    kwhConsumed: number;
    solarKwhGenerated: number;
    dieselLitres: number;
    generatorRuntimeHours: number;
    generatorKwhGenerated: number;
    biogasM3Consumed: number;
    biogasKwhGenerated: number;
    peakDemandKw?: number | null;
    powerFactor?: number | null;
    carbonKgEmitted: number;
    carbonKgAvoided: number;
    notes?: string | null;
    rawPayload: string;
  }>;
  duplicateRows: number;
  rejectedRows: number;
  errors: IngestionValidationError[];
}
