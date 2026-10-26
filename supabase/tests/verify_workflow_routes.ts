import { STATUTORY_WORKFLOW_ROUTES } from "../../lib/workflowEngine";

console.log("=== AICTE SAKSHAM Automated Route Verification ===");

// 1. Verify existence of all 4 statutory routes
const expectedRoutes = ["SCRUTINY_ONLY", "SCRUTINY_EVC", "EVC_SAC", "ONLY_EVC"];
const routeCodes = STATUTORY_WORKFLOW_ROUTES.map((r) => r.code);

for (const expected of expectedRoutes) {
  if (!routeCodes.includes(expected)) {
    console.error(`FAIL: Expected route ${expected} not found in STATUTORY_WORKFLOW_ROUTES`);
    process.exit(1);
  }
}
console.log(`PASS: All 4 configured statutory routes present: ${routeCodes.join(", ")}`);

// 2. Verify stage sequences & SLA constraints
for (const route of STATUTORY_WORKFLOW_ROUTES) {
  console.log(`\nVerifying Route [${route.code}] - ${route.title}`);
  if (!route.stageSequence || route.stageSequence.length === 0) {
    console.error(`FAIL: Route ${route.code} has empty stage sequence`);
    process.exit(1);
  }

  for (const stage of route.stageSequence) {
    if (!stage.stageKey || !stage.roleRequired || stage.turnaroundDays <= 0 || stage.warningThresholdDays <= 0) {
      console.error(`FAIL: Invalid stage configuration in ${route.code}:`, stage);
      process.exit(1);
    }
  }
  console.log(`  Stages: ${route.stageSequence.map((s) => `${s.stageKey} (${s.roleRequired}, SLA:${s.turnaroundDays}d)`).join(" -> ")}`);
}

// 3. Verify Route-specific statutory criteria
// SCRUTINY_ONLY should NOT include evc_scheduled
const scrutinyOnly = STATUTORY_WORKFLOW_ROUTES.find((r) => r.code === "SCRUTINY_ONLY")!;
const scrutinyOnlyStages = scrutinyOnly.stageSequence.map((s) => s.stageKey);
if (scrutinyOnlyStages.includes("evc_scheduled")) {
  console.error("FAIL: SCRUTINY_ONLY must not include EVC stage");
  process.exit(1);
}
console.log("PASS: SCRUTINY_ONLY correctly bypasses EVC");

// EVC_SAC must include sac_review stage
const evcSac = STATUTORY_WORKFLOW_ROUTES.find((r) => r.code === "EVC_SAC")!;
const evcSacStages = evcSac.stageSequence.map((s) => s.stageKey);
if (!evcSacStages.includes("sac_review")) {
  console.error("FAIL: EVC_SAC must include sac_review stage");
  process.exit(1);
}
console.log("PASS: EVC_SAC correctly mandates Standing Appellate Committee (SAC) review");

// ONLY_EVC must include evc_scheduled and direct council review
const onlyEvc = STATUTORY_WORKFLOW_ROUTES.find((r) => r.code === "ONLY_EVC")!;
const onlyEvcStages = onlyEvc.stageSequence.map((s) => s.stageKey);
if (!onlyEvcStages.includes("evc_scheduled") || onlyEvcStages.includes("under_scrutiny")) {
  console.error("FAIL: ONLY_EVC must be an inspection-first track without scrutiny");
  process.exit(1);
}
console.log("PASS: ONLY_EVC is an inspection-first direct audit track");

console.log("\nALL 4 ROUTE CHECKS PASSED SUCCESSFULLY.");
