const { execSync } = require("child_process");

try {
  console.log("Invoking Phase 5 test runner with tsx...\n");
  const output = execSync("npx tsx tests/phase5-check.ts", {
    stdio: "inherit",
    cwd: process.cwd(),
  });
  process.exit(0);
} catch (error) {
  process.exit(1);
}
