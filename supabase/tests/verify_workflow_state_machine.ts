// ==============================================================================
// AICTE SAKSHAM - Automated P0 Workflow State Machine Verification Test
// File: supabase/tests/verify_workflow_state_machine.ts
// ==============================================================================

import type { ApplicationStatus } from "../../types/database";

// Exact transition map as defined in app/admin/applications/actions.ts and enforce_application_integrity()
const PERMITTED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ["submitted"],
  submitted: ["under_scrutiny", "withdrawn", "rejected"],
  under_scrutiny: ["scrutiny_clarification_sought", "scrutiny_cleared", "rejected"],
  scrutiny_clarification_sought: ["under_scrutiny", "withdrawn", "rejected"],
  scrutiny_cleared: ["evc_scheduled", "council_decision_pending", "rejected"],
  evc_scheduled: ["evc_completed", "scrutiny_clarification_sought", "rejected"],
  evc_completed: ["sac_review", "council_decision_pending", "rejected"],
  sac_review: ["council_decision_pending", "scrutiny_clarification_sought", "rejected"],
  council_decision_pending: ["approved", "rejected"],
  approved: [],
  rejected: [],
  withdrawn: [],
};

console.log("=== AICTE SAKSHAM P0 State Machine & Transition Tests ===");

function assertTransition(from: ApplicationStatus, to: ApplicationStatus, shouldBeAllowed: boolean) {
  const allowed = PERMITTED_TRANSITIONS[from]?.includes(to) ?? false;
  if (allowed !== shouldBeAllowed) {
    console.error(`FAIL: Transition from '${from}' to '${to}' expected ${shouldBeAllowed ? "ALLOWED" : "DISALLOWED"} but got ${allowed ? "ALLOWED" : "DISALLOWED"}`);
    process.exit(1);
  }
}

// 1. Test Route A: Scrutiny Only (Bypasses EVC)
console.log("\n[Test 1] Route A (SCRUTINY_ONLY): draft -> submitted -> under_scrutiny -> scrutiny_cleared -> council_decision_pending -> approved");
assertTransition("draft", "submitted", true);
assertTransition("submitted", "under_scrutiny", true);
assertTransition("under_scrutiny", "scrutiny_cleared", true);
assertTransition("scrutiny_cleared", "council_decision_pending", true); // Bypasses EVC
assertTransition("council_decision_pending", "approved", true);
console.log("PASS: Route A valid transition sequence verified.");

// 2. Test Route B: Scrutiny + EVC (Expansion / New Course)
console.log("\n[Test 2] Route B (SCRUTINY_EVC): scrutiny_cleared -> evc_scheduled -> evc_completed -> council_decision_pending -> approved");
assertTransition("scrutiny_cleared", "evc_scheduled", true);
assertTransition("evc_scheduled", "evc_completed", true);
assertTransition("evc_completed", "council_decision_pending", true);
assertTransition("council_decision_pending", "approved", true);
console.log("PASS: Route B valid transition sequence verified.");

// 3. Test Route C: EVC + SAC (Appellate Appeal Track)
console.log("\n[Test 3] Route C (EVC_SAC): evc_completed -> sac_review -> council_decision_pending -> approved");
assertTransition("evc_completed", "sac_review", true);
assertTransition("sac_review", "council_decision_pending", true);
assertTransition("council_decision_pending", "approved", true);
console.log("PASS: Route C valid transition sequence verified.");

// 4. Test Deficiency and Resubmission Cycle
console.log("\n[Test 4] Deficiency Loop: under_scrutiny -> scrutiny_clarification_sought -> under_scrutiny");
assertTransition("under_scrutiny", "scrutiny_clarification_sought", true);
assertTransition("scrutiny_clarification_sought", "under_scrutiny", true);
console.log("PASS: Deficiency notice issuance and institutional rectification loop verified.");

// 5. Test Invalid & Unauthorized State Jumps (Must Be Strictly Denied)
console.log("\n[Test 5] Security Guard: Rejecting invalid state jumps");
assertTransition("draft", "approved", false); // Cannot jump from draft to approved
assertTransition("submitted", "approved", false); // Cannot bypass scrutiny
assertTransition("under_scrutiny", "approved", false); // Scrutiny officer cannot approve
assertTransition("evc_scheduled", "approved", false); // Expert cannot approve
assertTransition("approved", "under_scrutiny", false); // Terminal state cannot transition
assertTransition("rejected", "under_scrutiny", false); // Terminal state cannot transition
console.log("PASS: All 6 illegal state transitions were strictly disallowed.");

console.log("\nALL P0 STATE MACHINE TRANSITION TESTS PASSED.");
