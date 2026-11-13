const http = require("http");

function request(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runLiveVerification() {
  console.log("================================================================================");
  console.log("DIU GREENGRID — LIVE APPLICATION & UI ROUTE VERIFICATION");
  console.log("Target Base URL: http://localhost:3000");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, desc, details) {
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
    // 1. Verify Login Page
    console.log("1. Probing Login Page...");
    const loginRes = await request("http://localhost:3000/login");
    assert(loginRes.statusCode === 200, "Login page opens successfully (HTTP 200)");
    assert(loginRes.body.includes("DIU GreenGrid") || loginRes.body.includes("Sign In"), "Login page contains branding and login form");

    // 2. Test Login for all 3 Roles
    console.log("\n2. Testing Authentication for all 3 Roles...");

    const testLogin = async (email, password, roleName) => {
      const payload = JSON.stringify({ email, password });
      const res = await request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        body: payload,
      });

      assert(res.statusCode === 200, `Authentication successful for ${roleName} (${email}) - HTTP 200`);
      const json = JSON.parse(res.body);
      assert(json.success === true && json.user.email === email, `Response confirms valid user profile for ${roleName}`);

      const setCookie = res.headers["set-cookie"];
      assert(!!setCookie && setCookie.some((c) => c.includes("diu_greengrid_token")), `Secure session cookie returned for ${roleName}`);

      // Extract token cookie
      let cookieHeader = "";
      if (setCookie) {
        cookieHeader = setCookie.map((c) => c.split(";")[0]).join("; ");
      }
      return cookieHeader;
    };

    const adminCookie = await testLogin("admin@diu.edu.bd", "Admin@GreenGrid2026!", "Administrator");
    const managerCookie = await testLogin("facility@diu.edu.bd", "Facility@2026!", "Facility Manager");
    const auditorCookie = await testLogin("auditor@diu.edu.bd", "Auditor@2026!", "Sustainability Auditor");

    // 3. Verify Authenticated Navigation across All Pages
    console.log("\n3. Testing Dashboard & Page Rendering with Authenticated Session...");

    const pages = [
      { path: "/", title: "Overview Dashboard" },
      { path: "/buildings", title: "Campus Buildings" },
      { path: "/data-sources", title: "Data Sources & Ingestion" },
      { path: "/ai-intelligence", title: "AI Energy Intelligence" },
      { path: "/sustainability", title: "Sustainability & SDGs" },
      { path: "/actions", title: "Action Management" },
    ];

    for (const pg of pages) {
      const res = await request(`http://localhost:3000${pg.path}`, {
        headers: { Cookie: adminCookie },
      });
      assert(res.statusCode === 200, `Page '${pg.title}' (${pg.path}) renders successfully (HTTP 200)`);
      assert(
        !res.body.includes("Application error") && !res.body.includes("Internal Server Error"),
        `Page '${pg.title}' renders cleanly without runtime exceptions`
      );
    }

    // 4. Verify Core Analytical APIs
    console.log("\n4. Probing Core APIs...");

    // /api/overview
    const overviewRes = await request("http://localhost:3000/api/overview", { headers: { Cookie: adminCookie } });
    assert(overviewRes.statusCode === 200, "/api/overview returns HTTP 200");
    const overviewJson = JSON.parse(overviewRes.body);
    assert(overviewJson.summary.isSimulated === true, "Overview data source explicitly labeled isSimulated: true (SIMULATED mode)");
    assert(overviewJson.summary.dieselLitres > 0, "Diesel fuel tracked in technical litres");

    // /api/analytics/overview
    const analyticsRes = await request("http://localhost:3000/api/analytics/overview", { headers: { Cookie: adminCookie } });
    assert(analyticsRes.statusCode === 200, "/api/analytics/overview returns HTTP 200");
    const analyticsJson = JSON.parse(analyticsRes.body);
    assert(analyticsJson.summary.energyBalanceResidualKwh > 0, "Analytics unmasks positive energy balance residual Δ > 0");
    assert(analyticsJson.summary.renewableContributionPercent > 0, "Analytics quantifies clean energy self-consumption");

    // /api/ai/forecasts
    const forecastRes = await request("http://localhost:3000/api/ai/forecasts", { headers: { Cookie: adminCookie } });
    assert(forecastRes.statusCode === 200, "/api/ai/forecasts returns HTTP 200");
    const forecastJson = JSON.parse(forecastRes.body);
    assert(forecastJson.demand.campusHourly24h.length === 24, "AI Demand Forecaster returns 24-hour prediction points");
    assert(forecastJson.solar.diurnalCurve.length === 24, "AI Solar Forecaster returns 24-hour diurnal yield curve");

    // /api/ai/anomalies
    const anomalyRes = await request("http://localhost:3000/api/ai/anomalies", { headers: { Cookie: adminCookie } });
    assert(anomalyRes.statusCode === 200, "/api/ai/anomalies returns HTTP 200");
    const anomalyJson = JSON.parse(anomalyRes.body);
    assert(anomalyJson.totalAnomaliesCount > 0, "AI Anomaly Detection returns detected events with evidence");

    // /api/ai/recommendations
    const recRes = await request("http://localhost:3000/api/ai/recommendations", { headers: { Cookie: adminCookie } });
    assert(recRes.statusCode === 200, "/api/ai/recommendations returns HTTP 200");
    const recJson = JSON.parse(recRes.body);
    assert(recJson.recommendations.length > 0, "AI Recommendations returns actionable initiatives with kWh savings");

    // /api/sustainability/overview
    const sustRes = await request("http://localhost:3000/api/sustainability/overview", { headers: { Cookie: adminCookie } });
    assert(sustRes.statusCode === 200, "/api/sustainability/overview returns HTTP 200");
    const sustJson = JSON.parse(sustRes.body);
    assert(sustJson.summary.renewableSelfConsumptionPercent > 0, "Sustainability overview calculates renewable self-consumption");
    assert(sustJson.summary.avoidedCarbonKg > 0, "Sustainability calculates avoided GHG emissions (Scope 2 displacement)");

    // /api/sustainability/sdgs
    const sdgRes = await request("http://localhost:3000/api/sustainability/sdgs", { headers: { Cookie: adminCookie } });
    assert(sdgRes.statusCode === 200, "/api/sustainability/sdgs returns HTTP 200");
    const sdgJson = JSON.parse(sdgRes.body);
    assert(sdgJson.sdgs.length === 4, "SDG API returns all 4 UN SDGs (SDG 7, 9, 12, 13) with baseline, target, and gaps");

    // /api/actions
    const actionRes = await request("http://localhost:3000/api/actions", { headers: { Cookie: adminCookie } });
    assert(actionRes.statusCode === 200, "/api/actions returns HTTP 200");
    const actionJson = JSON.parse(actionRes.body);
    assert(actionJson.summary.totalVerifiedKwhSavings > 0, "Action Management tracks verified permanent kWh savings");

    console.log("\n================================================================================");
    console.log(`LIVE DEMO VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log("================================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Live test failed with error:", err);
    process.exit(1);
  }
}

runLiveVerification();
