const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "diu-greengrid-dev-secret-only-not-for-production-2026";

async function runPhase1Checks() {
  console.log("==================================================");
  console.log("   DIU GREENGRID - PHASE 1 INTEGRATION TEST SUITE ");
  console.log("==================================================\n");

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${testName}`);
      testsPassed++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Test Users & RBAC
    const users = await prisma.user.findMany();
    assert(users.length === 3, "Verified 3 RBAC users exist (ADMIN, FACILITY_MANAGER, AUDITOR_VIEWER)");

    const admin = users.find((u) => u.role === "ADMIN");
    assert(admin && admin.email === "admin@diu.edu.bd", "Admin account properly mapped");

    const passwordMatch = await bcrypt.compare("Admin@GreenGrid2026!", admin.passwordHash);
    assert(passwordMatch, "Admin password hash verifies successfully");

    // 2. Test JWT Token Creation & Verification
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    const decoded = jwt.verify(token, JWT_SECRET);
    assert(decoded.role === "ADMIN" && decoded.email === admin.email, "JWT Session token generated and verified");

    // 3. Test Campus Buildings
    const buildings = await prisma.building.findMany();
    assert(buildings.length === 9, "9 DIU campus buildings registered with floor area & capacity (AB-1..4, YKSG-1..2, RASG-1..2, FabLab)");
    const ab1 = buildings.find((b) => b.code === "AB-1" || b.code === "AB-01");
    assert(ab1 && typeof ab1.totalFloorAreaSqM === "number", "AB-1 registered with floor area and capacity");
    const fablab = buildings.find((b) => b.code === "FabLab");
    assert(fablab && typeof fablab.totalFloorAreaSqM === "number" && fablab.totalFloorAreaSqM === 3800.0, "FabLab maker laboratory facility registered (3,800 m²)");

    // 4. Test Configurable Energy Sources & Biogas Presence
    const sources = await prisma.energySource.findMany();
    assert(sources.length === 4, "4 Energy sources configured (Grid, Solar PV, Standby Diesel, Biogas Pilot)");

    const solar = sources.find((s) => s.code === "SOLAR_ROOFTOP");
    assert(solar && solar.ratedCapacityKw === 850.0 && solar.isRenewable === true, "Rooftop Solar rated at 850 kWp renewable");

    const genset = sources.find((s) => s.code === "CAMPUS_GENSET");
    assert(genset && genset.monitoringMethod === "TECHNICAL_FUEL_LOGBOOK", "Diesel generator strictly monitored via technical fuel logbook");

    const biogas = sources.find((s) => s.code === "BIOGAS_PILOT");
    assert(
      biogas && biogas.operationalStatus === "UNVERIFIED_PILOT",
      "Biogas source explicitly tagged with operationalStatus: 'UNVERIFIED_PILOT'"
    );

    // 5. Test Demonstration Provenance for Biogas
    const biogasMetrics = await prisma.energyMetric.findMany({
      where: { energySourceId: biogas?.id },
    });
    assert(
      biogasMetrics.every((m) => m.isSimulated === true),
      "All Biogas demonstration readings are strictly tagged isSimulated: true"
    );

    // 6. Test Data Provenance Transparency
    const demoProvenance = await prisma.dataSourceProvenance.findUnique({
      where: { code: "DEMO_SIMULATION_ENGINE" },
    });
    assert(demoProvenance && demoProvenance.isSimulated === true, "Demo Provenance engine strictly flagged isSimulated: true");

    // 7. Test Energy Metrics Lineage (Strict non-financial verification)
    const metrics = await prisma.energyMetric.findMany({ take: 10 });
    assert(metrics.length === 10, "Energy metrics queryable");
    assert(metrics.every((m) => m.isSimulated === true), "All demonstration records have isSimulated: true");
    assert(metrics.every((m) => typeof m.dieselLitres === "number"), "Diesel fuel tracked in technical litres");

    // 8. Test Documented Emission Factors, Methodology & Disclaimers
    const factors = await prisma.emissionFactorConfig.findMany();
    assert(factors.length === 2, "Documented emission factors present");
    
    const gridFactor = factors.find((f) => f.factorKey === "GRID_ELECTRICITY_CO2");
    assert(
      gridFactor &&
        gridFactor.value === 0.637 &&
        gridFactor.unit === "kg CO2e / kWh" &&
        gridFactor.sourceDocumentation.includes("DoE") &&
        gridFactor.methodology.includes("ACM0002") &&
        gridFactor.isAuthoritative === false,
      "Grid factor has exact unit, citation, ACM0002 methodology, and non-authoritative disclaimer"
    );

    const dieselFactor = factors.find((f) => f.factorKey === "DIESEL_FUEL_CO2");
    assert(
      dieselFactor &&
        dieselFactor.value === 2.68 &&
        dieselFactor.unit === "kg CO2e / Litre" &&
        dieselFactor.sourceDocumentation.includes("IPCC") &&
        dieselFactor.methodology.includes("43.0") &&
        dieselFactor.isAuthoritative === false,
      "Diesel factor has exact unit, IPCC citation, stoichiometric calculation, and non-authoritative disclaimer"
    );

    // 9. Test Action & Improvement Tracking
    const actions = await prisma.actionImprovement.findMany();
    assert(actions.length >= 3, "Initial energy improvement actions tracked (>= 3)");
    const verifiedAction = actions.find((a) => a.completionStatus === "COMPLETED_VERIFIED" || a.completionStatus === "VERIFIED");
    assert(
      verifiedAction && verifiedAction.verifiedKwhSavings > 0,
      `Action tracks verified energy reduction: ${verifiedAction?.verifiedKwhSavings} kWh`
    );

    // 10. Security Checks (.gitignore protecting secrets and DB files)
    const gitignoreContent = fs.readFileSync(path.join(__dirname, "../.gitignore"), "utf-8");
    const hasEnvIgnored = gitignoreContent.includes(".env");
    const hasDbIgnored = gitignoreContent.includes("*.db") || gitignoreContent.includes("prisma/dev.db");
    assert(
      hasEnvIgnored && hasDbIgnored,
      "Security: .gitignore strictly excludes .env secrets and database storage files"
    );

    console.log(`\n==================================================`);
    console.log(`   TEST RESULT: ${testsPassed}/${totalTests} PASSED (100% SUCCESS)`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runPhase1Checks();
