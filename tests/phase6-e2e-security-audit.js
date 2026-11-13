const { execSync } = require("child_process");

try {
  console.log("Invoking Phase 6 End-to-End Security & Quality Audit runner with tsx...\n");
  const output = execSync("npx tsx tests/phase6-e2e-security-audit.ts", {
    stdio: "inherit",
    cwd: process.cwd(),
  });
  process.exit(0);
} catch (error) {
  process.exit(1);
}
