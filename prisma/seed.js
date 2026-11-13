const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting DIU GreenGrid Database Seeding (Phase 2 Integration)...");

  // 1. Clean existing records
  await prisma.auditLog.deleteMany({});
  await prisma.aiRecommendation.deleteMany({});
  await prisma.energyAnomaly.deleteMany({});
  await prisma.energyForecastRecord.deleteMany({});
  await prisma.aiModelMetadata.deleteMany({});
  await prisma.sustainabilityTarget.deleteMany({});
  await prisma.actionImprovement.deleteMany({});
  await prisma.energyMetric.deleteMany({});
  await prisma.ingestionBatch.deleteMany({});
  await prisma.apiAdapterConfig.deleteMany({});
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

  // 3. Seed Campus Buildings (Official 9 DIU Campus Facilities)
  const buildingsData = [
    // Academic Buildings (AB)
    {
      code: "AB-1",
      name: "Academic Building 1 (Engineering & Tech)",
      campusLocation: "Ashulia Permanent Campus - East Quad",
      totalFloorAreaSqM: 16500.0,
      occupancyCapacity: 3500,
      primaryFunction: "Academic Classrooms & Engineering Lecture Halls",
      baselineDailyKwh: 2600.0,
    },
    {
      code: "AB-2",
      name: "Academic Building 2 (Computing & IT Labs)",
      campusLocation: "Ashulia Permanent Campus - North Block",
      totalFloorAreaSqM: 15200.0,
      occupancyCapacity: 3000,
      primaryFunction: "Computer Science & Software Engineering Labs",
      baselineDailyKwh: 3100.0,
    },
    {
      code: "AB-3",
      name: "Academic Building 3 (Business & Entrepreneurship)",
      campusLocation: "Ashulia Permanent Campus - West Block",
      totalFloorAreaSqM: 14000.0,
      occupancyCapacity: 2800,
      primaryFunction: "Business School & Faculty Offices",
      baselineDailyKwh: 2200.0,
    },
    {
      code: "AB-4",
      name: "Academic Building 4 (Science & Allied Health)",
      campusLocation: "Ashulia Permanent Campus - South Block",
      totalFloorAreaSqM: 14500.0,
      occupancyCapacity: 2900,
      primaryFunction: "Allied Health, Pharmacy & Life Science Labs",
      baselineDailyKwh: 2400.0,
    },
    // Yunus Khan Scholars Garden (YKSG) - Male Dormitories
    {
      code: "YKSG-1",
      name: "Yunus Khan Scholars Garden 1 (Male Residence Wing A)",
      campusLocation: "Ashulia Permanent Campus - South Lakefront",
      totalFloorAreaSqM: 13000.0,
      occupancyCapacity: 1250,
      primaryFunction: "Student Dormitory & Dining Commons",
      baselineDailyKwh: 1900.0,
    },
    {
      code: "YKSG-2",
      name: "Yunus Khan Scholars Garden 2 (Male Residence Wing B)",
      campusLocation: "Ashulia Permanent Campus - South Lakefront",
      totalFloorAreaSqM: 13000.0,
      occupancyCapacity: 1250,
      primaryFunction: "Student Dormitory & Study Commons",
      baselineDailyKwh: 1850.0,
    },
    // Rowshan Ara Scholars Garden (RASG) - Female Dormitories
    {
      code: "RASG-1",
      name: "Rowshan Ara Scholars Garden 1 (Female Residence Wing A)",
      campusLocation: "Ashulia Permanent Campus - North Lakeside",
      totalFloorAreaSqM: 11500.0,
      occupancyCapacity: 1100,
      primaryFunction: "Student Dormitory & Dining Commons",
      baselineDailyKwh: 1600.0,
    },
    {
      code: "RASG-2",
      name: "Rowshan Ara Scholars Garden 2 (Female Residence Wing B)",
      campusLocation: "Ashulia Permanent Campus - North Lakeside",
      totalFloorAreaSqM: 11500.0,
      occupancyCapacity: 1100,
      primaryFunction: "Student Dormitory & Study Commons",
      baselineDailyKwh: 1550.0,
    },
    // Other - FabLab (Makerspace & Prototyping Laboratory)
    {
      code: "FabLab",
      name: "Fabrication Laboratory (FabLab DIU - Maker & Prototyping Center)",
      campusLocation: "Ashulia Permanent Campus - Innovation Hub Ground Floor",
      totalFloorAreaSqM: 3800.0,
      occupancyCapacity: 450,
      primaryFunction: "Digital Fabrication, 3D Printing, Laser Cutting & CNC Prototyping",
      baselineDailyKwh: 1450.0,
    },
  ];

  const buildings = [];
  for (const b of buildingsData) {
    const created = await prisma.building.create({ data: b });
    buildings.push(created);
  }
  console.log(`✅ Seeded ${buildings.length} DIU Campus Buildings (AB-1..4, YKSG-1..2, RASG-1..2, FabLab).`);

  // 4. Seed Configurable Energy Sources (All 4 Sources: Grid, Solar, Diesel, Biogas)
  const energySourcesData = [
    {
      code: "GRID_SUPPLY",
      name: "Government Grid Incomer",
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
      ratedCapacityKw: 30.0,
      isRenewable: true,
      configuredProvider: "DIU Agricultural & Organic Waste Unit (Pilot Research)",
      monitoringMethod: "UNVERIFIED_PENDING_METERING",
      operationalStatus: "UNVERIFIED_PILOT", // Clearly labeled
      isActive: true, // Enabled for demonstrated simulation testing
    },
  ];

  const energySources = {};
  for (const s of energySourcesData) {
    const created = await prisma.energySource.create({ data: s });
    energySources[s.code] = created;
  }
  console.log(`✅ Seeded 4 Configurable Energy Sources (Grid, Solar, Diesel, Biogas).`);

  // 5. Seed Data Source Provenances
  const provenanceData = [
    {
      code: "INVERTER_API_VERIFIED",
      name: "Rooftop Inverter Telemetry Connector",
      ingestionMethod: "API_CONNECTOR",
      isSimulated: false,
      confidenceRating: 1.0,
      sourceDetails: "Read-only REST adapter connected to solar inverters.",
      description: "Automated hourly active yield and irradiance metrics.",
    },
    {
      code: "SUBMETER_CSV_IMPORT",
      name: "Facility Submeter Logbook CSV/Excel Import",
      ingestionMethod: "CSV_EXCEL_IMPORT",
      isSimulated: false,
      confidenceRating: 0.95,
      sourceDetails: "Batch spreadsheet ingestion from electrical loggers.",
      description: "Validated sub-station digital CSV/Excel logs.",
    },
    {
      code: "MANUAL_LOG_ENTRY",
      name: "Authorized Manual Facility Entry",
      ingestionMethod: "MANUAL_ENTRY",
      isSimulated: false,
      confidenceRating: 0.85,
      sourceDetails: "Direct manual submission by certified facility engineering staff.",
      description: "Logbook entries for technical generator run-hours and diesel additions.",
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

  // 6. Seed Configurable API Adapters (Phase 2)
  const adaptersData = [
    {
      name: "Campus Solar Inverter Telemetry Gateway",
      adapterType: "SOLAR_INVERTER",
      baseUrl: "https://inverters.campus.diu.edu.bd/api/v1/telemetry",
      authType: "API_KEY",
      authKeyMasked: "diu_••••_sol850",
      pollingIntervalMins: 15,
      status: "CONFIGURED_IDLE",
      isSimulatedFallback: true,
      targetEnergySourceId: energySources["SOLAR_ROOFTOP"].id,
    },
    {
      name: "Sub-station 11kV Incomer Digital Interface",
      adapterType: "GRID_METER",
      baseUrl: "http://substation-modbus.internal.diu.edu.bd/api/meter",
      authType: "NONE",
      pollingIntervalMins: 30,
      status: "CONFIGURED_IDLE",
      isSimulatedFallback: true,
      targetEnergySourceId: energySources["GRID_SUPPLY"].id,
    },
    {
      name: "Auxiliary Generator Fuel & Runtime Telemetry",
      adapterType: "GENSET_TELEMETRY",
      baseUrl: "http://genset-mon.internal.diu.edu.bd/telemetry",
      authType: "BEARER_TOKEN",
      authKeyMasked: "bear••••9281",
      pollingIntervalMins: 60,
      status: "CONFIGURED_IDLE",
      isSimulatedFallback: true,
      targetEnergySourceId: energySources["CAMPUS_GENSET"].id,
    },
    {
      name: "Biogas Pilot Plant Orifice Flow Meter",
      adapterType: "BIOGAS_MONITOR",
      baseUrl: "http://biogas-pilot.internal.diu.edu.bd/flow-rate",
      authType: "NONE",
      pollingIntervalMins: 60,
      status: "CONFIGURED_IDLE",
      isSimulatedFallback: true,
      targetEnergySourceId: energySources["BIOGAS_PILOT"].id,
    },
  ];

  for (const a of adaptersData) {
    await prisma.apiAdapterConfig.create({ data: a });
  }
  console.log(`✅ Seeded ${adaptersData.length} Configurable API Adapters.`);

  // 7. Seed Initial Ingestion Batch (Auditing demonstrative import)
  const sampleBatch = await prisma.ingestionBatch.create({
    data: {
      filename: "diu-campus-weekly-baseline-log.csv",
      fileType: "CSV",
      sourceType: "DEMO_SIMULATION",
      isSimulated: true,
      totalRows: 215,
      successfulRows: 215,
      rejectedRows: 0,
      duplicateRows: 0,
      summaryNotes: "Baseline multi-source campus demonstration readings for hackathon evaluation.",
      importedBy: admin.email,
      provenanceId: provenances["DEMO_SIMULATION_ENGINE"].id,
    },
  });
  console.log(`✅ Seeded initial Ingestion Batch record.`);

  // 8. Seed Documented Emission Factors
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
  console.log(`✅ Seeded 2 Documented Emission Factors.`);

  // 9. Seed Demonstration Energy Metrics Across ALL FOUR SOURCES (Strictly Labeled isSimulated: true)
  const gridFactor = 0.637;
  const dieselFactor = 2.68;
  const demoProv = provenances["DEMO_SIMULATION_ENGINE"];

  const now = new Date();
  let metricCount = 0;

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const dateBase = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const dayOfWeek = dateBase.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    for (let hour of [0, 4, 8, 12, 16, 20]) {
      const timestamp = new Date(dateBase);
      timestamp.setHours(hour, 0, 0, 0);

      // 1. Solar Generation (Bell curve)
      let solarYieldKw = 0;
      if (hour === 8) solarYieldKw = 180 + Math.random() * 40;
      else if (hour === 12) solarYieldKw = 620 + Math.random() * 80;
      else if (hour === 16) solarYieldKw = 210 + Math.random() * 30;
      const solarKwh = solarYieldKw * 4;

      // 2. Diesel Generator Maintenance Test (strictly Day 3 at 12:00)
      let dieselLitres = 0;
      let genRuntimeHours = 0;
      let genKwh = 0;
      if (dayOffset === 3 && hour === 12) {
        dieselLitres = 45.5; // litres consumed (technical only)
        genRuntimeHours = 1.5;
        genKwh = 135.0; // kWh produced by generator
      }

      // 3. Biogas Pilot Plant (Daytime digestate production, 8.5 m3, 14.2 kWh)
      let biogasM3 = 0;
      let biogasKwh = 0;
      if (hour === 12) {
        biogasM3 = Number((7.5 + Math.random() * 2).toFixed(1));
        biogasKwh = Number((biogasM3 * 1.65).toFixed(1)); // ~1.65 kWh/m3 conversion factor
      }

      for (const building of buildings) {
        let loadFactor = 0.35;
        if (!isWeekend) {
          if (building.code.startsWith("AB-")) {
            if (hour === 8 || hour === 12 || hour === 16) {
              loadFactor = 0.90 + Math.random() * 0.15;
            } else {
              loadFactor = 0.22 + Math.random() * 0.08;
            }
          } else if (building.code.startsWith("YKSG") || building.code.startsWith("RASG")) {
            if (hour === 20 || hour === 0) {
              loadFactor = 0.85 + Math.random() * 0.12;
            } else if (hour === 8 || hour === 12) {
              loadFactor = 0.40 + Math.random() * 0.08;
            } else {
              loadFactor = 0.65;
            }
          } else if (building.code === "FabLab") {
            // Maker Lab & Digital Fabrication: high daytime CNC/laser load, moderate overnight 3D printing batches
            if (hour === 8 || hour === 12 || hour === 16) {
              loadFactor = 1.05 + Math.random() * 0.20; // Active prototyping peak
            } else if (hour === 20 || hour === 0) {
              loadFactor = 0.52 + Math.random() * 0.10; // Heated beds of overnight 3D printing farm
            } else {
              loadFactor = 0.35;
            }
          } else {
            if (hour === 8 || hour === 12) loadFactor = 0.75;
          }
        } else {
          // Weekend load
          if (building.code.startsWith("YKSG") || building.code.startsWith("RASG")) {
            loadFactor = 0.72; // Active student dormitories
          } else if (building.code === "FabLab") {
            loadFactor = 0.45; // Weekend maker club prototyping
          } else {
            loadFactor = 0.20; // Vacant academic classrooms
          }
        }

        const kwhConsumed = Number(((building.baselineDailyKwh / 6) * loadFactor).toFixed(1));
        const buildingSolarShare = (solarKwh / buildings.length);
        const buildingBiogasShare = (biogasKwh / buildings.length);
        const isDieselGenBuilding = building.code === "AB-1";
        const carbonEmitted = Number(((kwhConsumed * gridFactor) + (isDieselGenBuilding ? dieselLitres * dieselFactor : 0)).toFixed(2));
        const carbonAvoided = Number(((buildingSolarShare + buildingBiogasShare) * gridFactor).toFixed(2));

        await prisma.energyMetric.create({
          data: {
            timestamp,
            buildingId: building.id,
            energySourceId: energySources["GRID_SUPPLY"].id,
            provenanceId: demoProv.id,
            batchId: sampleBatch.id,
            isSimulated: true, // EXPLICIT TRANSPARENCY
            kwhConsumed,
            solarKwhGenerated: Number(buildingSolarShare.toFixed(1)),
            dieselLitres: isDieselGenBuilding ? dieselLitres : 0.0,
            generatorRuntimeHours: isDieselGenBuilding ? genRuntimeHours : 0.0,
            generatorKwhGenerated: isDieselGenBuilding ? genKwh : 0.0,
            biogasM3Consumed: Number(buildingBiogasShare > 0 ? (biogasM3 / buildings.length).toFixed(2) : 0),
            biogasKwhGenerated: Number(buildingBiogasShare.toFixed(1)),
            peakDemandKw: Number((kwhConsumed / 4 * 1.25).toFixed(1)),
            powerFactor: building.code === "FabLab" ? 0.91 : 0.95,
            carbonKgEmitted: carbonEmitted,
            carbonKgAvoided: carbonAvoided,
            notes: `Simulated demonstration reading for DIU GreenGrid evaluation. Sources: Grid, Solar PV, Diesel Gen, Biogas Pilot. Facility: ${building.code}.`,
          },
        });
        metricCount++;
      }
    }
  }

  console.log(`✅ Seeded ${metricCount} Demonstration Energy Records across Grid, Solar PV, Diesel Gen, and Biogas Pilot (all isSimulated: true).`);

  // 10. Seed Action & Improvement Management Items
  const actionsData = [
    {
      title: "AB-02 3rd Floor Computer Lab Night-time Standby Idle Surge",
      detectedIssue: "Automated baseline monitoring detected recurring 22 kW idle load between 22:00 and 06:00 caused by unmanaged desktop PC sleep states and auxiliary AC units.",
      recommendedAction: "Institute automated group-policy PC sleep timer after 21:00 and mechanical lockouts on auxiliary split AC units.",
      assignedTeam: "IT Infrastructure Support & Electrical Maintenance",
      assignedPersonnel: "Engr. Rafiqul Islam (Lead Electrical)",
      completionStatus: "VERIFIED",
      priority: "HIGH",
      targetBuildingId: buildings.find((b) => b.code === "AB-2")?.id,
      beforeKwh: 1450.0,
      afterKwh: 620.0,
      verifiedKwhSavings: 830.0,
      measurementPeriodDays: 30,
      verificationMethod: "30-day comparative sub-meter logging",
      verifiedCarbonSavingsKg: Number((830.0 * 0.637).toFixed(2)), // 528.71 kg CO2e
      verifiedBy: "admin@diu.edu.bd",
      verifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      supportingEvidence: "Floor 3 sub-meter logbook export (Ref: MTR-AB02-L3-OCT26) showing reduction from 22 kW to 8 kW off-peak baseload.",
      completionNotes: "Group policy active across 140 workstations. Breakers relabeled. Verified by Campus Facility Manager. 830 kWh/day permanent reduction achieved.",
      sdgAlignment: "SDG_12",
      notes: "Verified by Campus Facility Manager. 830 kWh/day permanent reduction achieved.",
    },
    {
      title: "Yunus Khan Scholars Garden Water Pump Timing Alignment",
      detectedIssue: "Dual 15 kW overhead water transfer pumps running concurrently during campus peak grid hours (11:00 - 13:00).",
      recommendedAction: "Reschedule primary pump cycle to morning solar-generation window (09:30 - 11:30) and secondary cycle to off-peak night (02:00).",
      assignedTeam: "Campus Facilities & Plumbing Unit",
      assignedPersonnel: "Md. Tariqul Anam (Water Systems Tech)",
      completionStatus: "VERIFIED",
      priority: "MEDIUM",
      targetBuildingId: buildings.find((b) => b.code === "YKSG-1")?.id,
      beforeKwh: 3200.0,
      afterKwh: 2750.0,
      verifiedKwhSavings: 450.0,
      measurementPeriodDays: 30,
      verificationMethod: "Dedicated sub-meter interval logging",
      verifiedCarbonSavingsKg: Number((450.0 * 0.637).toFixed(2)), // 286.65 kg CO2e
      verifiedBy: "facility@diu.edu.bd",
      verifiedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      supportingEvidence: "Sub-meter interval log demonstrating zero water pump draw during peak tariff grid window.",
      completionNotes: "Pumps aligned with rooftop solar generation curve. Automatic timer relays installed.",
      sdgAlignment: "SDG_7",
      notes: "Pumps aligned with rooftop solar generation curve.",
    },
    {
      title: "FabLab 3D Printer Farm & Laser Cutter Exhaust Sequencing",
      detectedIssue: "18x 3D printers and high-power industrial laser exhaust blowers running simultaneously during peak grid hours and idling on standby overnight.",
      recommendedAction: "Shift long-duration 3D print jobs to 10:00-14:00 solar peak window; install smart current-sensing power cutoffs on laser cutter ventilation blowers.",
      assignedTeam: "FabLab Digital Prototyping Operations & Electrical Maintenance",
      assignedPersonnel: "Engr. Mahmudul Hasan (FabLab Operations Manager)",
      completionStatus: "VERIFIED",
      priority: "HIGH",
      targetBuildingId: buildings.find((b) => b.code === "FabLab")?.id,
      beforeKwh: 1200.0,
      afterKwh: 750.0,
      verifiedKwhSavings: 450.0,
      measurementPeriodDays: 30,
      verificationMethod: "FabLab smart sub-meter logger comparison",
      verifiedCarbonSavingsKg: Number((450.0 * 0.637).toFixed(2)), // 286.65 kg CO2e
      verifiedBy: "facility@diu.edu.bd",
      verifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      supportingEvidence: "FabLab smart panel export showing 450 kWh/day peak demand reduction through staggered job sequencing.",
      completionNotes: "Automatic shutoff relays active on laser exhaust. Print jobs queued with solar irradiance tracker.",
      sdgAlignment: "SDG_9",
      notes: "Maker lab prototyping equipment synchronized with campus clean solar generation.",
    },
    {
      title: "Rowshan Ara Scholars Garden Central Hot Water Heat Pump Scheduling",
      detectedIssue: "Central heat pump circulation running continuously 24/7 without night temperature setback in dormitories.",
      recommendedAction: "Implement timer setback schedule to pause circulation loops between 01:00 and 05:00 BST.",
      assignedTeam: "HVAC & Thermal Systems Unit",
      assignedPersonnel: "Kazi Nazmul (Thermal Specialist)",
      completionStatus: "COMPLETED",
      priority: "HIGH",
      targetBuildingId: buildings.find((b) => b.code === "RASG-1")?.id,
      beforeKwh: 1120.0,
      afterKwh: 880.0,
      verifiedKwhSavings: 240.0,
      measurementPeriodDays: 14,
      verificationMethod: "Thermal sub-meter 14-day interval comparison",
      verifiedCarbonSavingsKg: Number((240.0 * 0.637).toFixed(2)),
      supportingEvidence: "BMS trend log showing heat pump overnight setback schedule with zero hot water availability complaints.",
      completionNotes: "Setback schedule validated. Final 30-day verification sign-off pending.",
      sdgAlignment: "SDG_13",
      notes: "Circulation loop pause eliminates night thermal radiation losses.",
    },
    {
      title: "Academic Building 1 Rooftop Solar Array String Diagnostic & Soiling Wash",
      detectedIssue: "String Inverter #4 DC current output lagging adjacent inverter strings by 22% due to dust accumulation from nearby construction.",
      recommendedAction: "Perform module surface washing with deionized water and check string MC4 connector contact resistance.",
      assignedTeam: "Solar Inverter Maintenance Unit",
      assignedPersonnel: "Md. Al-Amin (Solar Specialist)",
      completionStatus: "IDENTIFIED",
      priority: "HIGH",
      targetBuildingId: buildings.find((b) => b.code === "AB-1")?.id,
      beforeKwh: 580.0,
      afterKwh: null,
      verifiedKwhSavings: null,
      measurementPeriodDays: 30,
      verificationMethod: "Inverter string DC monitoring comparative yield",
      supportingEvidence: "Solar inverter telemetry log showing String 4 operating at 18.2A vs String 3 at 23.4A.",
      completionNotes: "Dispatched from AI Anomaly Detection Engine (Ref: anom-solar-12). Scheduled for weekend wash.",
      sdgAlignment: "SDG_7",
      notes: "Cleaning expected to restore ~120 kWh/day of clean solar generation.",
    },
  ];

  for (const a of actionsData) {
    await prisma.actionImprovement.create({ data: a });
  }
  console.log(`✅ Seeded ${actionsData.length} Action & Improvement records across workflow stages.`);

  // 11. Seed Sustainability Targets (Phase 5 SDG Tracking)
  const targetsData = [
    {
      title: "Achieve 50% Clean Energy Self-Consumption across Campus Demand",
      sdgCategory: "SDG_7",
      targetPeriod: "Academic Year 2026",
      baselineValue: 38.0,
      targetValue: 50.0,
      currentValue: 49.8,
      unit: "%",
      status: "ON_TRACK",
      calculationMethod: "(Consumed Clean Renewable Electricity / Total Campus Electricity Demand) * 100%",
      remainingGap: 0.2,
      targetYear: 2026,
      responsibleUnit: "Campus Renewable Energy & Solar Inverter Operations",
      notes: "Solar PV rooftop (850 kWp) + Biogas pilot supplying on-site campus demand.",
    },
    {
      title: "Improve Campus Energy Use Intensity (EUI) Below 0.070 kWh/m²",
      sdgCategory: "SDG_7",
      targetPeriod: "Academic Year 2026",
      baselineValue: 0.082,
      targetValue: 0.070,
      currentValue: 0.074,
      unit: "kWh/m²",
      status: "ON_TRACK",
      calculationMethod: "Total Monitored Campus Consumption (kWh) / Total Gross Floor Area (103,000 m²)",
      remainingGap: 0.004,
      targetYear: 2026,
      responsibleUnit: "Directorate of Campus Operations",
      notes: "Baseline established from pre-monitoring campus utility records across 9 facilities.",
    },
    {
      title: "Maintain 100% Digital Sub-Metering Coverage of Campus Facilities",
      sdgCategory: "SDG_9",
      targetPeriod: "Academic Year 2026",
      baselineValue: 60.0,
      targetValue: 100.0,
      currentValue: 100.0,
      unit: "%",
      status: "ACHIEVED",
      calculationMethod: "(Monitored Building Floor Area / Total Permanent Campus Floor Area) * 100%",
      remainingGap: 0.0,
      targetYear: 2026,
      responsibleUnit: "Electrical Infrastructure & Automation Unit",
      notes: "All 9 official DIU campus facilities (AB-1, AB-2, AB-3, AB-4, YKSG-1, YKSG-2, RASG-1, RASG-2, FabLab) integrated.",
    },
    {
      title: "Reduce Unoccupied Off-Peak Energy Waste by 25%",
      sdgCategory: "SDG_12",
      targetPeriod: "Academic Year 2026",
      baselineValue: 28.5,
      targetValue: 15.0,
      currentValue: 18.2,
      unit: "%",
      status: "ON_TRACK",
      calculationMethod: "(Nighttime & Weekend Unoccupied Baseload / Average Daytime Peak Draw) * 100%",
      remainingGap: 3.2,
      targetYear: 2026,
      responsibleUnit: "HVAC Operations & Building Supervisors",
      notes: "Targeting parasitic standby equipment, corridor lighting, and unmanaged workstation sleep states.",
    },
    {
      title: "Offset 25,000 kg CO2e Monthly via On-Campus Clean Generation",
      sdgCategory: "SDG_13",
      targetPeriod: "Academic Year 2026",
      baselineValue: 12000.0,
      targetValue: 25000.0,
      currentValue: 19469.0,
      unit: "kg CO2e",
      status: "ON_TRACK",
      calculationMethod: "Consumed Renewable Electricity (kWh) * DoE Grid Factor (0.637 kg CO2e/kWh)",
      remainingGap: 5531.0,
      targetYear: 2026,
      responsibleUnit: "DIU Sustainability Committee & Solar Asset Unit",
      notes: "Avoided Scope 2 greenhouse gas emissions offset against Bangladesh national grid factor.",
    },
  ];

  for (const t of targetsData) {
    await prisma.sustainabilityTarget.create({ data: t });
  }
  console.log(`✅ Seeded ${targetsData.length} Sustainability & SDG Target records.`);

  // 12. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      action: "PHASE_5_SEED_COMPLETED",
      performedBy: admin.email,
      details: "Database populated with Phase 5 sustainability metrics, SDG targets, and end-to-end action improvement workflows.",
    },
  });

  console.log("🚀 Phase 5 Database Seeding Complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
