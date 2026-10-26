// ==============================================================================
// AICTE SAKSHAM - Automated Compliance Review Action & UUID Validation Test
// File: supabase/tests/verify_compliance_review_action.ts
// ==============================================================================

import { reviewComplianceSubmission, verifyUndertaking, updateEvcVisitStatus } from "../../app/admin/compliance/actions";

async function runTests() {
  console.log("=== AICTE SAKSHAM Compliance Actions & UUID Validation Tests ===\n");

  // Test 1: Synthetic Demo ID "comp-1" should be gracefully handled without Postgres syntax errors
  console.log("[Test 1] Executing review on demo ID 'comp-1'...");
  const demoResult = await reviewComplianceSubmission("comp-1", "completed", "Test scrutiny remarks");
  if (!demoResult.success) {
    console.error("FAIL: Demo submission review failed:", demoResult);
    process.exit(1);
  }
  console.log("PASS: Handled demo ID 'comp-1' gracefully:", demoResult.message);

  // Test 2: Missing inputs validation
  console.log("\n[Test 2] Testing missing input validation...");
  const missingIdResult = await reviewComplianceSubmission("", "completed", "Test");
  if (missingIdResult.success || missingIdResult.error !== "INVALID_INPUT") {
    console.error("FAIL: Missing ID was not properly rejected:", missingIdResult);
    process.exit(1);
  }
  console.log("PASS: Rejected missing submission ID as expected.");

  // Test 3: Synthetic Undertaking ID "und-1"
  console.log("\n[Test 3] Testing undertaking verification on demo ID 'und-1'...");
  const undertakingResult = await verifyUndertaking("und-1");
  if (!undertakingResult.success) {
    console.error("FAIL: Demo undertaking verification failed:", undertakingResult);
    process.exit(1);
  }
  console.log("PASS: Handled demo undertaking 'und-1' gracefully:", undertakingResult.message);

  // Test 4: Synthetic EVC Visit ID "evc-1"
  console.log("\n[Test 4] Testing EVC visit update on demo ID 'evc-1'...");
  const evcResult = await updateEvcVisitStatus("evc-1", "verified", "All labs inspected", 95);
  if (!evcResult.success) {
    console.error("FAIL: Demo EVC update failed:", evcResult);
    process.exit(1);
  }
  console.log("PASS: Handled demo EVC visit 'evc-1' gracefully:", evcResult.message);

  // Test 5: Real valid UUID syntax check (should attempt DB lookup without syntax errors)
  console.log("\n[Test 5] Testing valid UUID syntax 'c0000000-0000-0000-0000-000000000000'...");
  const validUuidResult = await reviewComplianceSubmission("c0000000-0000-0000-0000-000000000000", "completed", "Test remarks");
  // When not authenticated in CLI environment, should return UNAUTHENTICATED or RECORD_NOT_FOUND, NEVER "invalid input syntax for type uuid"
  if (validUuidResult.message.includes("invalid input syntax for type uuid")) {
    console.error("FAIL: Postgres UUID syntax error leaked:", validUuidResult);
    process.exit(1);
  }
  console.log(`PASS: Valid UUID executed without syntax errors (Result error: ${validUuidResult.error || "OK"}).`);

  console.log("\nALL COMPLIANCE REVIEW ACTION TESTS PASSED.");
}

runTests();
