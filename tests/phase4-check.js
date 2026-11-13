const { spawnSync } = require("child_process");
const path = require("path");

const tsFile = path.join(__dirname, "phase4-check.ts");
const result = spawnSync("npx", ["tsx", tsFile], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status || 0);
