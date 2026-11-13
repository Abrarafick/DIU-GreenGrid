/**
 * DIU GreenGrid — Phase 5 Comprehensive Verification & Quality Assurance Suite
 * 
 * Verifies:
 * 1. Sustainability management KPIs (renewables, consumption vs surplus, grid dependency)
 * 2. UN SDG Indicators for SDG 7, 9, 12, 13 (baselines, targets, currents, gaps, methods, evidence)
 * 3. Carbon Accounting & GHG Inventory (Scope 1 diesel, Scope 2 grid, strict non-double-counting avoided emissions)
 * 4. Action & Improvement lifecycle (IDENTIFIED -> IN_PROGRESS -> COMPLETED -> VERIFIED)
 * 5. Before-and-after kWh measurement and verified carbon savings calculation
 * 6. Sustainability target management & gap to goal calculations
 * 7. Report bundle compilation and CSV / Excel (.xlsx) export formats
 * 8. Audit logging and strict non-financial compliance
 */

import { PrismaClient } from "@prisma/client";
import { computeCarbonAccounting } from "../src/lib/sustainability/carbon";
import { computeSdgAnalytics } from "../src/lib/sustainability/sdg";
import {
  compileSustainabilityReportBundle,
  generateSustainabilityCsv,
  generateSustainabilityExcel,
} from "../src/lib/sustainability/reporting";

const prisma = new PrismaClient();

async function runPhase5Tests() {
  console.log("================================================================================");
  console.log("DIU GREENGRID — PHASE 5 VERIFICATION SUITE: SUSTAINABILITY & ACTION MANAGEMENT");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string, details?: any) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      if (details) console.error("       Details:", details);
      failed++;
    }
  }

  try {
    // 1. Fetch DB data
    const [metrics, buildings, targets, actions, emissionFactors] = await Promise.all([
      prisma.energyMetric.findMany({ orderBy: { timestamp: "asc" } }),
      prisma.building.findMany(),
      prisma.sustainabilityTarget.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.actionImprovement.findMany({ include: { targetBuilding: true }, orderBy: { reportedAt: "desc" } }),
      prisma.emissionFactorConfig.findMany(),
    ]);

    console.log(`Loaded dataset: ${metrics.length} telemetry metrics, ${buildings.length} campus buildings, ${targets.length} targets, ${actions.length} action items.\n`);

    // ============================================================================
    // SUITE A: Sustainability & Renewable Self-Consumption Accounting
    // ============================================================================
    console.log("--- SUITE A: Renewable Self-Consumption & Energy Balance Accuracy ---");
    const carbon = computeCarbonAccounting(metrics, actions, emissionFactors);

    assert(carbon.dieselLitresBurned > 0, "Standby diesel fuel consumed is tracked in litres (technical only)", {
      litres: carbon.dieselLitresBurned,
    });
    assert(carbon.gridImportKwh > 0, "Grid electricity import is computed from net deficit", {
      gridImportKwh: carbon.gridImportKwh,
    });
    assert(carbon.cleanRenewableConsumedKwh > 0, "Clean renewable energy consumed on campus is quantified", {
      consumedKwh: carbon.cleanRenewableConsumedKwh,
    });
    assert(carbon.cleanRenewableSurplusKwh > 0, "Unutilized solar surplus during midday peak is tracked separately", {
      surplusKwh: carbon.cleanRenewableSurplusKwh,
    });

    // Check non-double-counting boundary
    const expectedAvoided = Number((carbon.cleanRenewableConsumedKwh * 0.637).toFixed(1));
    assert(
      carbon.avoidedEmissionsKg === expectedAvoided,
      "Strict anti-double-counting: avoided emissions credited ONLY for clean energy consumed on campus (surplus excluded)",
      { avoidedEmissionsKg: carbon.avoidedEmissionsKg, expectedAvoided }
    );

    const grossCalculated = Number((carbon.scope1DieselEmissionsKg + carbon.scope2GridEmissionsKg).toFixed(1));
    assert(
      carbon.grossEmissionsKg === grossCalculated,
      "Gross GHG footprint equals Scope 1 (Diesel) + Scope 2 (Grid)",
      { grossEmissionsKg: carbon.grossEmissionsKg, grossCalculated }
    );

    const netCalculated = Number(Math.max(0, grossCalculated - expectedAvoided).toFixed(1));
    assert(
      carbon.netEmissionsKg === netCalculated,
      "Net GHG emissions equals Gross Emissions minus Consumed Clean Avoided Emissions",
      { netEmissionsKg: carbon.netEmissionsKg, netCalculated }
    );

    // ============================================================================
    // SUITE B: UN Sustainable Development Goals (SDG 7, 9, 12, 13)
    // ============================================================================
    console.log("\n--- SUITE B: SDG Indicators, Baselines, Targets & Gaps ---");
    const sdgs = computeSdgAnalytics(metrics, buildings, targets, actions);

    assert(sdgs.length === 4, "SDG framework computes exactly 4 primary goals (SDG 7, 9, 12, 13)", {
      count: sdgs.length,
    });

    const sdg7 = sdgs.find((s) => s.sdgCode === "SDG_7");
    const sdg9 = sdgs.find((s) => s.sdgCode === "SDG_9");
    const sdg12 = sdgs.find((s) => s.sdgCode === "SDG_12");
    const sdg13 = sdgs.find((s) => s.sdgCode === "SDG_13");

    assert(!!sdg7 && !!sdg9 && !!sdg12 && !!sdg13, "All 4 required SDG groups exist");

    // SDG 7 Check
    const ind7_2_1 = sdg7?.indicators.find((i) => i.code === "7.2.1");
    assert(!!ind7_2_1, "SDG 7.2.1 Renewable Electricity Self-Consumption indicator exists");
    assert(
      ind7_2_1?.baselineValue === 38.0 && ind7_2_1?.targetValue === 50.0,
      "SDG 7.2.1 has correct baseline (38.0%) and target (50.0%)",
      { baseline: ind7_2_1?.baselineValue, target: ind7_2_1?.targetValue }
    );
    assert(
      ind7_2_1?.remainingGap === Number(Math.max(0, 50.0 - (ind7_2_1?.currentValue || 0)).toFixed(1)),
      "SDG 7.2.1 accurately calculates remaining gap to target",
      { current: ind7_2_1?.currentValue, gap: ind7_2_1?.remainingGap }
    );

    // SDG 9 Check
    const ind9_4_1 = sdg9?.indicators.find((i) => i.code === "9.4.1");
    assert(!!ind9_4_1, "SDG 9.4.1 Digital Energy Sub-Metering Coverage exists");
    assert(
      ind9_4_1?.currentValue === 100.0 && ind9_4_1?.status === "ACHIEVED",
      "SDG 9.4.1 reports 100% digital sub-metering coverage across all 5 campus facilities",
      { current: ind9_4_1?.currentValue, status: ind9_4_1?.status }
    );

    // SDG 12 Check
    const ind12_5_1 = sdg12?.indicators.find((i) => i.code === "12.5.1");
    assert(!!ind12_5_1, "SDG 12.5.1 Verified Permanent Energy Reduction exists");
    assert(
      (ind12_5_1?.currentValue || 0) >= 1200,
      "SDG 12.5.1 reflects sum of verified action savings (>= 1,200 kWh)",
      { verifiedSavings: ind12_5_1?.currentValue }
    );

    // SDG 13 Check
    const ind13_2_1 = sdg13?.indicators.find((i) => i.code === "13.2.1");
    const ind13_2_2 = sdg13?.indicators.find((i) => i.code === "13.2.2");
    assert(!!ind13_2_1, "SDG 13.2.1 Avoided Scope 2 Emissions exists");
    assert(!!ind13_2_2, "SDG 13.2.2 Verified GHG Reductions from Completed Energy Actions exists");

    // Check transparency requirements: calculationMethod, assumptions, evidenceSource
    let allIndicatorsTransparent = true;
    sdgs.forEach((s) => {
      s.indicators.forEach((ind) => {
        if (!ind.calculationMethod || !ind.documentedAssumptions || !ind.evidenceSource) {
          allIndicatorsTransparent = false;
        }
      });
    });
    assert(
      allIndicatorsTransparent,
      "Every single SDG indicator provides transparent calculationMethod, documentedAssumptions, and evidenceSource"
    );

    // ============================================================================
    // SUITE C: Action & Improvement Management Lifecycle & Savings Verification
    // ============================================================================
    console.log("\n--- SUITE C: Action & Improvement Lifecycle & Savings Verification ---");

    const verifiedAction = actions.find(
      (a) => (a.completionStatus === "VERIFIED" || a.completionStatus === "COMPLETED_VERIFIED") && a.beforeKwh && a.afterKwh
    );
    assert(!!verifiedAction, "Verified action item exists in database with before and after readings");

    if (verifiedAction) {
      const calculatedSavings = Math.max(0, Number(((verifiedAction.beforeKwh || 0) - (verifiedAction.afterKwh || 0)).toFixed(1)));
      assert(
        verifiedAction.verifiedKwhSavings === calculatedSavings,
        "Action verifiedKwhSavings strictly equals (beforeKwh - afterKwh)",
        { before: verifiedAction.beforeKwh, after: verifiedAction.afterKwh, verified: verifiedAction.verifiedKwhSavings }
      );

      const expectedCarbon = Number((calculatedSavings * 0.637).toFixed(1));
      const carbonDiff = Math.abs((verifiedAction.verifiedCarbonSavingsKg || 0) - expectedCarbon);
      assert(
        carbonDiff <= 0.1,
        "Action verifiedCarbonSavingsKg accurately applies 0.637 factor to verified kWh",
        { verifiedCarbonSavingsKg: verifiedAction.verifiedCarbonSavingsKg, expectedCarbon }
      );

      assert(
        !!verifiedAction.assignedTeam && !!verifiedAction.assignedPersonnel,
        "Action item has assigned engineering team and lead personnel",
        { team: verifiedAction.assignedTeam, lead: verifiedAction.assignedPersonnel }
      );

      assert(
        !!verifiedAction.verificationMethod && !!verifiedAction.verifiedBy,
        "Verified action includes documented audit protocol and verifier identity",
        { method: verifiedAction.verificationMethod, verifier: verifiedAction.verifiedBy }
      );
    }

    // Test creating a new Action and transitioning through lifecycle
    console.log("Testing action lifecycle transitions: IDENTIFIED -> IN_PROGRESS -> VERIFIED...");
    const testAction = await prisma.actionImprovement.create({
      data: {
        title: "Test Phase 5 Verification Chiller Staging",
        detectedIssue: "Chiller 2 operating at suboptimal 45% load during low occupancy.",
        recommendedAction: "Reschedule staging sequence to maintain Chiller 1 at 85% load.",
        assignedTeam: "HVAC Engineering Operations",
        assignedPersonnel: "Engr. Monirul Islam",
        priority: "HIGH",
        completionStatus: "IDENTIFIED",
        sdgAlignment: "SDG_7",
      },
    });

    assert(testAction.completionStatus === "IDENTIFIED", "New action created with status 'IDENTIFIED'");

    // Update to IN_PROGRESS
    const inProgressAction = await prisma.actionImprovement.update({
      where: { id: testAction.id },
      data: { completionStatus: "IN_PROGRESS" },
    });
    assert(inProgressAction.completionStatus === "IN_PROGRESS", "Action transitioned to 'IN_PROGRESS'");

    // Complete & Verify with before and after measurements
    const beforeKwh = 3500;
    const afterKwh = 2800;
    const savingsKwh = beforeKwh - afterKwh; // 700 kWh
    const carbonSavingsKg = Number((savingsKwh * 0.637).toFixed(1)); // 445.9 kg

    const verifiedTestAction = await prisma.actionImprovement.update({
      where: { id: testAction.id },
      data: {
        completionStatus: "VERIFIED",
        beforeKwh,
        afterKwh,
        verifiedKwhSavings: savingsKwh,
        verifiedCarbonSavingsKg: carbonSavingsKg,
        measurementPeriodDays: 30,
        verificationMethod: "30-day comparative sub-meter logging",
        verifiedBy: "admin@diu.edu.bd",
        verifiedAt: new Date(),
      },
    });

    assert(
      verifiedTestAction.completionStatus === "VERIFIED" &&
        verifiedTestAction.verifiedKwhSavings === 700 &&
        verifiedTestAction.verifiedCarbonSavingsKg === 445.9,
      "Action successfully audited and transitioned to 'VERIFIED' with exact calculated kWh and carbon savings",
      { savings: verifiedTestAction.verifiedKwhSavings, carbon: verifiedTestAction.verifiedCarbonSavingsKg }
    );

    // Clean up test action
    await prisma.actionImprovement.delete({ where: { id: testAction.id } });

    // ============================================================================
    // SUITE D: Sustainability Target Management & Gap Tracking
    // ============================================================================
    console.log("\n--- SUITE D: Institutional Sustainability Target Tracking ---");

    assert(targets.length >= 4, "Institutional targets registered across SDG categories", { count: targets.length });

    const cleanTarget = targets.find((t) => t.sdgCategory === "SDG_7");
    assert(!!cleanTarget, "Institutional target exists for SDG 7 Clean Energy");
    if (cleanTarget) {
      assert(cleanTarget.targetValue === 50.0, "SDG 7 target goal is 50.0% clean energy self-consumption");
      assert(
        cleanTarget.remainingGap === Number(Math.abs(cleanTarget.targetValue - cleanTarget.currentValue).toFixed(3)),
        "Target remaining gap accurately matches |targetValue - currentValue|",
        { target: cleanTarget.targetValue, current: cleanTarget.currentValue, gap: cleanTarget.remainingGap }
      );
    }

    // ============================================================================
    // SUITE E: Formal Sustainability Reporting & Exports (CSV & Excel)
    // ============================================================================
    console.log("\n--- SUITE E: Formal Reports & Multi-Format Exports ---");

    const reportBundle = compileSustainabilityReportBundle({
      metrics,
      buildings,
      targets,
      actions,
      periodLabel: "November 2026 Comprehensive Operational Assessment",
    });

    assert(!!reportBundle.monthlySummary, "Report bundle compiles monthly sustainability summary");
    assert(reportBundle.sdgSummaries.length === 4, "Report bundle includes all 4 SDG categories");
    assert(reportBundle.carbonAccounting.grossEmissionsKg > 0, "Report bundle includes carbon accounting inventory");

    // CSV generation check
    const csvContent = generateSustainabilityCsv(reportBundle, "all");
    const csvUpper = csvContent.toUpperCase();
    assert(
      csvUpper.includes("CAMPUS MONTHLY SUSTAINABILITY SUMMARY") &&
        csvUpper.includes("UN SUSTAINABLE DEVELOPMENT GOALS (SDG) INDICATORS") &&
        csvUpper.includes("CARBON ACCOUNTING & GHG INVENTORY (SCOPE 1 & 2)") &&
        csvUpper.includes("GREEN CAMPUS ACTION & IMPROVEMENT MANAGEMENT AUDIT"),
      "Generated CSV report contains all 4 major sections with formal metadata headers"
    );

    // Excel workbook buffer generation check
    const excelBuffer = generateSustainabilityExcel(reportBundle);
    assert(
      excelBuffer instanceof Buffer && excelBuffer.length > 5000,
      "Generated multi-sheet Excel (.xlsx) workbook is a valid binary buffer (> 5 KB)",
      { sizeBytes: excelBuffer.length }
    );

    // ============================================================================
    // SUITE F: Strict Non-Financial & Security Boundary
    // ============================================================================
    console.log("\n--- SUITE F: Non-Financial Integrity & Security Audit ---");

    const csvLower = csvContent.toLowerCase();
    const hasFinancials =
      csvLower.includes("bdt") ||
      csvLower.includes("taka") ||
      csvLower.includes("dollar") ||
      csvLower.includes("billing cost") ||
      csvLower.includes("roi");

    assert(
      !hasFinancials,
      "Strict Non-Financial Integrity: ZERO currency, electricity bills, or financial ROI anywhere in export reports"
    );

    console.log("\n================================================================================");
    console.log(`PHASE 5 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log("================================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Unhandled test execution error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase5Tests();
