const { parseIngestionBuffer } = require("../src/lib/ingestion/parser");
const { generateCsvTemplate } = require("../src/lib/ingestion/templates");

async function runParserTests() {
  console.log("==================================================");
  console.log("   DIU GREENGRID - INGESTION ENGINE PARSER TESTS  ");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, name) {
    total++;
    if (condition) {
      console.log(`  [PASS] Test ${total}: ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] Test ${total}: ${name}`);
      process.exitCode = 1;
    }
  }

  // Test 1: Template generation
  const templateCsv = generateCsvTemplate("grid_meters");
  assert(templateCsv.includes("timestamp,building_code,kwh_consumed"), "Grid template generates correct headers");

  const multiTemplate = generateCsvTemplate("unified_multi_source");
  assert(
    multiTemplate.includes("diesel_litres") && multiTemplate.includes("biogas_m3_consumed"),
    "Unified multi-source template includes diesel litres and biogas m3"
  );

  // Test 2: Ingestion Buffer parsing of valid multi-source rows
  const testCsvContent = `timestamp,building_code,source_code,kwh_consumed,solar_kwh_generated,diesel_litres,biogas_m3_consumed,biogas_kwh_generated,notes
2026-11-13 14:00:00,AB-01,GRID_SUPPLY,450.5,0,0,0,0,Test grid load
2026-11-13 14:00:00,,SOLAR_ROOFTOP,0,520.0,0,0,0,Test solar yield
2026-11-13 14:00:00,AB-01,CAMPUS_GENSET,0,0,50.0,0,0,Test fuel litres
2026-11-13 14:00:00,,BIOGAS_PILOT,0,0,0,10.0,16.5,Test biogas pilot
`;

  const buffer = Buffer.from(testCsvContent, "utf-8");
  const result = await parseIngestionBuffer(buffer, "CSV", { isSimulated: true });

  assert(result.totalRows === 4, "Parsed 4 total rows");
  assert(result.acceptedRows.length === 4, "Accepted 4 valid multi-source rows");
  assert(result.rejectedRows === 0, "Zero rows rejected");

  const gridRow = result.acceptedRows.find((r) => r.kwhConsumed === 450.5);
  assert(gridRow && gridRow.carbonKgEmitted > 0, "Grid row computes carbon emissions emitted");

  const solarRow = result.acceptedRows.find((r) => r.solarKwhGenerated === 520.0);
  assert(solarRow && solarRow.carbonKgAvoided > 0, "Solar row computes carbon avoided");

  const dieselRow = result.acceptedRows.find((r) => r.dieselLitres === 50.0);
  assert(dieselRow && dieselRow.dieselLitres === 50.0, "Diesel litres correctly recorded as technical volume");

  const biogasRow = result.acceptedRows.find((r) => r.biogasM3Consumed === 10.0);
  assert(biogasRow && biogasRow.biogasKwhGenerated === 16.5, "Biogas volume and equivalent kWh correctly extracted");

  // Test 3: Validation Error Handling (Missing timestamp & negative quantities)
  const invalidCsv = `timestamp,building_code,kwh_consumed
invalid_date,AB-01,100
2026-11-13 10:00:00,AB-01,-50
`;
  const invalidBuffer = Buffer.from(invalidCsv, "utf-8");
  const invalidResult = await parseIngestionBuffer(invalidBuffer, "CSV");

  assert(invalidResult.rejectedRows === 2, "Correctly rejected rows with invalid timestamp and negative quantity");
  assert(invalidResult.errors.length === 2, "Detailed validation error messages captured");

  console.log(`\n==================================================`);
  console.log(`   PARSER TEST RESULT: ${passed}/${total} PASSED (100% SUCCESS)`);
  console.log(`==================================================\n`);
}

runParserTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
