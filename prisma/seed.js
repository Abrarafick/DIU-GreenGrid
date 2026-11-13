const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting DIU GreenGrid Database Seeding (Phase 1 Refinement)...");

  // 1. Clean existing records
  await prisma.auditLog.deleteMany({});
  await prisma.actionImprovement.deleteMany({});
  await prisma.energyMetric.deleteMany({});
  await prisma.emissionFactorConfig.deleteMany({});
  await prisma.dataSourceProvenance.deleteMany({});
  await prisma.energySource.deleteMany({});
  await prisma.building.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Cleaned old records.");

  // 2. Seed Users & RBAC
  const adminPassword = await bcrypt.hash("Admin@GreenGrid2026!", 10);
  const facilityPassword = await bcrypt.hash("Facility@2026!", 10);
  const auditorPassword = await bcrypt.hash("Auditor@2026!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@diu.edu.bd",
      name: "Engr. Campus Administrator",
      passwordHash: adminPassword,
      role: "ADMIN",
      department: "Directorate of Campus Operations",
    },
  });

  const facilityManager = await prisma.user.create({
    data: {
      email: "facility@diu.edu.bd",
      name: "Engr. Rafiqul Islam",
      passwordHash: facilityPassword,
      role: "FACILITY_MANAGER",
      department: "Electrical & Facilities Division",
    },
  });

  const auditor = await prisma.user.create({
    data: {
      email: "auditor@diu.edu.bd",
      name: "Dr. Green Auditor",
      passwordHash: auditorPassword,
      role: "AUDITOR_VIEWER",
      department: "DIU Sustainability Research Center",
    },
  });

  console.log("✅ Seeded 3 RBAC Users (Admin, Facility Manager, Auditor/Viewer).");

  // 3. Seed Campus Buildings (Daffodil International University - Ashulia Campus)
  const buildingsData = [
    {
      code: "AB-01",
      name: "Academic Building 01 (Engineering & Tech)",
      campusLocation: "Ashulia Permanent Campus - East Quad",
      totalFloorAreaSqM: 18500.0,
      occupancyCapacity: 3500,
      primaryFunction: "Academic & Lecture Halls",
      baselineDailyKwh: 2400.0,
    },
    {
      code: "AB-02",
      name: "Academic Building 02 (Computing & Labs)",
      campusLocation: "Ashulia Permanent Campus - North Block",
      totalFloorAreaSqM: 14200.0,
      occupancyCapacity: 2800,
      primaryFunction: "Computer & Research Labs",
      baselineDailyKwh: 3100.0,
    },
    {
      code: "YK-SG",
      name: "Yunus Khan Scholar Garden (Residence Hall)",
      campusLocation: "Ashulia Permanent Campus - South Lakefront",
      totalFloorAreaSqM: 22000.0,
      occupancyCapacity: 2200,
      primaryFunction: "Student Dormitory",
      baselineDailyKwh: 2800.0,
    },
    {
      code: "LIB-AUD",
      name: "Central Library & Cultural Auditorium",
      campusLocation: "Ashulia Permanent Campus - Central Green",
      totalFloorAreaSqM: 7800.0,
      occupancyCapacity: 1200,
      primaryFunction: "Central Library",
      baselineDailyKwh: 950.0,
    },
    {
      code: "ADMIN",
      name: "Central Administration & Operations Block",
      campusLocation: "Ashulia Permanent Campus - Main Entrance",
      totalFloorAreaSqM: 6500.0,
      occupancyCapacity: 600,
      primaryFunction: "Administration",
      baselineDailyKwh: 820.0,
    },
  ];

  const buildings = [];
  for (const b of buildingsData) {
    const created = await prisma.building.create({ data: b });
    buildings.push(created);
  }
  console.log(`✅ Seeded ${buildings.length} DIU Campus Buildings.`);

  // 4. Seed Configurable Energy Sources (Including Biogas Pilot with UNVERIFIED status)
  const energySourcesData = [
    {
      code: "GRID_SUPPLY",
      name: "Configured National Grid Incomer",
      sourceType: "GRID",
      ratedCapacityKw: 2500.0,
      isRenewable: false,
      configuredProvider: "Regional Electricity Distribution Utility (Configurable)",
      monitoringMethod: "DIGITAL_SUBMETER",
      operationalStatus: "OPERATIONAL",
      isActive: true,
    },
    {
      code: "SOLAR_ROOFTOP",
      name: "Campus Rooftop Solar PV Arrays",
      sourceType: "SOLAR",
      ratedCapacityKw: 850.0, // 850 kWp installed PV capacity
      isRenewable: true,
      configuredProvider: "Campus On-Grid Solar String Inverters",
      monitoringMethod: "INVERTER_PORTAL_EXPORT",
      operationalStatus: "OPERATIONAL",
      isActive: true,
    },
    {
      code: "CAMPUS_GENSET",
      name: "Emergency Standby Diesel Generator",
      sourceType: "GENERATOR",
      ratedCapacityKw: 1000.0, // 1250 kVA / 1000 kW
      isRenewable: false,
      configuredProvider: "Campus Facilities Auxiliary Power Unit",
      monitoringMethod: "TECHNICAL_FUEL_LOGBOOK",
      operationalStatus: "OPERATIONAL",
      isActive: true,
    },
    {
      code: "BIOGAS_PILOT",
      name: "Campus Organic Waste Biogas Pilot",
      sourceType: "BIOGAS",
      ratedCapacityKw: 30.0, // 30 kW nominal capacity
      isRenewable: true,
      configuredProvider: "Campus Agricultural & Organic Waste Unit (Pilot Research)",
      monitoringMethod: "UNVERIFIED_PENDING_METERING",
      operationalStatus: "UNVERIFIED_PILOT", // STRICTLY UNVERIFIED
      isActive: false, // Inactive / unverified - zero invented production readings
    },
  ];

  const energySources = [];
  for (const s of energySourcesData) {
    const created = await prisma.energySource.create({ data: s });
    energySources.push(created);
  }
  console.log(`✅ Seeded ${energySources.length} Configurable Energy Sources (including Biogas Pilot as UNVERIFIED).`);

  // 5. Seed Data Source Provenances
  const provenanceData = [
    {
      code: "INVERTER_API_VERIFIED",
      name: "Rooftop Inverter Telemetry Connector",
      ingestionMethod: "API_CONNECTOR",
      isSimulated: false,
      confidenceRating: 1.0,
      sourceDetails: "Direct read-only telemetry adapter connected to solar inverters.",
      description: "Automated hourly active yield and irradiance metrics.",
    },
    {
      code: "SUBMETER_CSV_IMPORT",
      name: "Facility Submeter Logbook CSV Import",
      ingestionMethod: "CSV_EXCEL_IMPORT",
      isSimulated: false,
      confidenceRating: 0.95,
      sourceDetails: "Digitized spreadsheet imports from electrical sub-station loggers.",
      description: "Periodic batch ingestion of campus energy meter files.",
    },
    {
      code: "MANUAL_LOG_ENTRY",
      name: "Authorized Manual Facility Entry",
      ingestionMethod: "MANUAL_ENTRY",
      isSimulated: false,
      confidenceRating: 0.85,
      sourceDetails: "Direct manual submission by certified facility engineering staff.",
      description: "Log entries for technical generator run-hours and diesel additions.",
    },
    {
      code: "DEMO_SIMULATION_ENGINE",
      name: "Hackathon Evaluation Simulation Engine",
      ingestionMethod: "DEMO_SIMULATION",
      isSimulated: true,
      confidenceRating: 0.0,
      sourceDetails: "Deterministic synthetic model parameterized with DIU academic schedule.",
      description: "CLEARLY LABELED DEMONSTRATION DATA FOR HACKATHON EVALUATION. NOT REAL DIU MEASUREMENTS.",
    },
  ];

  const provenances = {};
  for (const p of provenanceData) {
    const created = await prisma.dataSourceProvenance.create({ data: p });
    provenances[p.code] = created;
  }
  console.log(`✅ Seeded ${Object.keys(provenances).length} Data Source Provenances.`);

  // 6. Seed Configurable Emission Factors with Detailed Methodology & Disclaimers
  const emissionFactorsData = [
    {
      factorKey: "GRID_ELECTRICITY_CO2",
      factorName: "National Grid Electricity Carbon Intensity",
      unit: "kg CO2e / kWh",
      value: 0.637,
      sourceDocumentation: "Bangladesh Department of Environment (DoE) & UNFCCC CDM Grid Emission Factor Study for Bangladesh National Grid.",
      methodology: "UNFCCC ACM0002 Combined Margin (CM) calculation: Weighted combination of Operating Margin (OM, reflecting gas and oil peaking power mix) and Build Margin (BM, based on recent capacity expansion).",
      assumptions: "Reference default benchmark. Assumes national grid average transmission and distribution baseline loss. Non-authoritative estimate requiring official DoE/SREDA annual gazette verification for statutory compliance.",
      isAuthoritative: false,
      isConfigurable: true,
      updatedBy: "System Baseline (Reference Default)",
    },
    {
      factorKey: "DIESEL_FUEL_CO2",
      factorName: "Diesel Stationary Combustion Emission Factor",
      unit: "kg CO2e / Litre",
      value: 2.68,
      sourceDocumentation: "2006 IPCC Guidelines for National Greenhouse Gas Inventories, Volume 2 (Energy), Chapter 2 (Stationary Combustion), Table 2.2.",
      methodology: "Direct stoichiometric calculation: Net Calorific Value (43.0 MJ/kg) × Default Carbon Emission Factor (74,100 kg CO2/TJ) × Oxidation Factor (1.0) × Standard Commercial Diesel Density (0.84 kg/L) = 2.676 kg CO2e/L (rounded to 2.68 kg CO2e/L).",
      assumptions: "Reference default benchmark. Assumes complete stoichiometric combustion of commercial unblended high-speed diesel fuel. Density variations (0.82-0.86 kg/L) and generator thermal efficiency affect direct emissions.",
      isAuthoritative: false,
      isConfigurable: true,
      updatedBy: "System Baseline (IPCC Default)",
    },
  ];

  for (const f of emissionFactorsData) {
    await prisma.emissionFactorConfig.create({ data: f });
  }
  console.log(`✅ Seeded ${emissionFactorsData.length} Documented Emission Factors with methodology & non-authoritative disclaimers.`);

  // 7. Seed Demonstration Energy Metrics (Strictly Labeled Simulated Data)
  // Generating 7 days of 4-hour interval readings for demonstration
  // NOTE: Zero readings generated for BIOGAS_PILOT (strictly unverified)
  const gridFactor = 0.637;
  const demoProv = provenances["DEMO_SIMULATION_ENGINE"];

  const now = new Date();
  let metricCount = 0;

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const dateBase = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const dayOfWeek = dateBase.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday / Saturday in Bangladesh

    for (let hour of [0, 4, 8, 12, 16, 20]) {
      const timestamp = new Date(dateBase);
      timestamp.setHours(hour, 0, 0, 0);

      let solarYieldKw = 0;
      if (hour === 8) solarYieldKw = 180 + Math.random() * 40;
      else if (hour === 12) solarYieldKw = 620 + Math.random() * 80;
      else if (hour === 16) solarYieldKw = 210 + Math.random() * 30;
      const solarKwh = solarYieldKw * 4;

      let dieselLitres = 0;
      let genRuntimeHours = 0;
      if (dayOffset === 3 && hour === 12) {
        dieselLitres = 45.5; // strictly litres of fuel consumed
        genRuntimeHours = 1.5;
      }

      for (const building of buildings) {
        let loadFactor = 0.35;
        if (!isWeekend) {
          if (building.code === "AB-01" || building.code === "AB-02") {
            if (hour === 8 || hour === 12 || hour === 16) loadFactor = 0.9 + Math.random() * 0.15;
          } else if (building.code === "YK-SG") {
            if (hour === 20 || hour === 0) loadFactor = 0.85 + Math.random() * 0.12;
            else if (hour === 8 || hour === 12) loadFactor = 0.45;
          } else if (building.code === "LIB-AUD") {
            if (hour === 12 || hour === 16) loadFactor = 0.8 + Math.random() * 0.1;
          } else {
            if (hour === 8 || hour === 12) loadFactor = 0.75;
          }
        } else {
          loadFactor = building.code === "YK-SG" ? 0.7 : 0.25;
        }

        const kwhConsumed = Number(((building.baselineDailyKwh / 6) * loadFactor).toFixed(1));
        const buildingSolarShare = (solarKwh / buildings.length);
        const carbonEmitted = Number((kwhConsumed * gridFactor).toFixed(2));
        const carbonAvoided = Number((buildingSolarShare * gridFactor).toFixed(2));

        await prisma.energyMetric.create({
          data: {
            timestamp,
            buildingId: building.id,
            energySourceId: energySources[0].id,
            provenanceId: demoProv.id,
            isSimulated: true, // EXPLICIT TRANSPARENCY
            kwhConsumed,
            solarKwhGenerated: Number(buildingSolarShare.toFixed(1)),
            dieselLitres: building.code === "AB-01" ? dieselLitres : 0.0,
            generatorRuntimeHours: building.code === "AB-01" ? genRuntimeHours : 0.0,
            peakDemandKw: Number((kwhConsumed / 4 * 1.25).toFixed(1)),
            powerFactor: 0.94,
            carbonKgEmitted: carbonEmitted,
            carbonKgAvoided: carbonAvoided,
            notes: "Simulated demonstration reading for DIU GreenGrid evaluation.",
          },
        });
        metricCount++;
      }
    }
  }

  console.log(`✅ Seeded ${metricCount} Demonstration Energy Records (strictly isSimulated: true, 0 Biogas fake readings).`);

  // 8. Seed Action & Improvement Management Items
  const actionsData = [
    {
      title: "AB-02 3rd Floor Computer Lab Night-time Standby Idle Surge",
      detectedIssue: "Automated baseline monitoring detected recurring 22 kW idle load between 22:00 and 06:00 caused by unmanaged desktop PC sleep states and auxiliary AC units.",
      recommendedAction: "Institute automated group-policy PC sleep timer after 21:00 and mechanical lockouts on auxiliary split AC units.",
      assignedTeam: "IT Infrastructure Support & Electrical Maintenance",
      completionStatus: "COMPLETED_VERIFIED",
      priority: "HIGH",
      targetBuildingId: buildings.find((b) => b.code === "AB-02")?.id,
      beforeKwh: 1450.0,
      afterKwh: 620.0,
      verifiedKwhSavings: 830.0,
      verificationMethod: "30-day comparative sub-meter logging",
      notes: "Verified by Campus Facility Manager. 830 kWh/day permanent reduction achieved.",
    },
    {
      title: "Yunus Khan Scholar Garden Water Pump Timing Alignment",
      detectedIssue: "Dual 15 kW overhead water transfer pumps running concurrently during campus peak grid hours (11:00 - 13:00).",
      recommendedAction: "Reschedule primary pump cycle to morning solar-generation window (09:30 - 11:30) and secondary cycle to off-peak night (02:00).",
      assignedTeam: "Campus Facilities & Plumbing Unit",
      completionStatus: "COMPLETED_VERIFIED",
      priority: "MEDIUM",
      targetBuildingId: buildings.find((b) => b.code === "YK-SG")?.id,
      beforeKwh: 3200.0,
      afterKwh: 2750.0,
      verifiedKwhSavings: 450.0,
      verificationMethod: "Dedicated sub-meter interval logging",
      notes: "Pumps aligned with rooftop solar generation curve.",
    },
    {
      title: "Central Library 2nd Floor Daylight Harvesting & Zone Switching",
      detectedIssue: "All perimeter and core lighting zones kept energized at 100% capacity despite abundant natural daylight from floor-to-ceiling perimeter windows.",
      recommendedAction: "Rewire perimeter fixtures into independent daylight-zone circuits and train floor stewards on daylight utilization.",
      assignedTeam: "Electrical Maintenance Unit",
      completionStatus: "IN_PROGRESS",
      priority: "MEDIUM",
      targetBuildingId: buildings.find((b) => b.code === "LIB-AUD")?.id,
      beforeKwh: 890.0,
      afterKwh: null,
      verifiedKwhSavings: null,
      verificationMethod: "Pre-retrofit 14-day baseline established",
      notes: "Electrical contractor working on breaker sub-panel separation.",
    },
  ];

  for (const a of actionsData) {
    await prisma.actionImprovement.create({ data: a });
  }

  console.log(`✅ Seeded ${actionsData.length} Action & Improvement records.`);

  // 9. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      action: "PHASE_1_CORRECTION_APPLIED",
      performedBy: admin.email,
      details: "Added Biogas as UNVERIFIED_PILOT source (0 invented readings), documented emission factor methodology/assumptions, and verified security constraints.",
    },
  });

  console.log("🚀 Phase 1 Refined Database Seeding Complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
