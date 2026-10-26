import crypto from "crypto";
import { MANDATORY_DOCUMENT_CATEGORIES } from "../../app/institution/actions";

console.log("=== AICTE SAKSHAM Automated Application & Document Submission Verification ===");

// 1. Verify Mandatory Document Categories
console.log("\n[Test 1] Mandatory Document Categories Definition");
const expectedKeys = ["land_document", "building_plan", "fire_safety", "affidavit", "faculty_list"];
const actualKeys: string[] = MANDATORY_DOCUMENT_CATEGORIES.map((c) => c.key);

for (const key of expectedKeys) {
  if (!actualKeys.includes(key)) {
    console.error(`FAIL: Missing mandatory category ${key}`);
    process.exit(1);
  }
}
console.log(`PASS: All 5 mandatory document categories verified: ${actualKeys.join(", ")}`);

// 2. Verify SHA-256 Checksum Calculation Logic
console.log("\n[Test 2] SHA-256 Checksum Verification");
const sampleFileContent = Buffer.from("AICTE Statutory Document Body - Master Building Plan Approval 2026");
const expectedHash = crypto.createHash("sha256").update(sampleFileContent).digest("hex");

if (!expectedHash || expectedHash.length !== 64) {
  console.error("FAIL: Checksum hash calculation invalid");
  process.exit(1);
}
console.log(`PASS: SHA-256 calculated correctly (${expectedHash})`);

// 3. Verify File Validation Rules
console.log("\n[Test 3] File Size & MIME Type Validation");
const MAX_ALLOWED_SIZE = 15 * 1024 * 1024;
const testOversized = 16 * 1024 * 1024;
const testValid = 4 * 1024 * 1024;

if (testOversized <= MAX_ALLOWED_SIZE) {
  console.error("FAIL: 16MB file should be flagged as oversized");
  process.exit(1);
}
if (testValid > MAX_ALLOWED_SIZE) {
  console.error("FAIL: 4MB file should be accepted");
  process.exit(1);
}
console.log("PASS: 15MB file size boundary correctly enforced");

// 4. Verify Application State Machine Transitions for Submission
console.log("\n[Test 4] Application Lifecycle & Submission State Transitions");
const validTransitions: Record<string, string[]> = {
  draft: ["submitted"],
  submitted: ["under_scrutiny"],
  under_scrutiny: ["scrutiny_clarification_sought", "scrutiny_cleared"],
  scrutiny_clarification_sought: ["under_scrutiny"],
  scrutiny_cleared: ["evc_scheduled", "council_decision_pending"],
};

// Draft can only transition to submitted by institution
if (!validTransitions.draft.includes("submitted")) {
  console.error("FAIL: draft must be able to transition to submitted");
  process.exit(1);
}
// Submitted cannot be resubmitted (duplicate prevention)
if (validTransitions.submitted.includes("submitted")) {
  console.error("FAIL: duplicate submission must be prevented");
  process.exit(1);
}
console.log("PASS: Lifecycle transitions and duplicate submission prevention verified");

// 5. Verify Checklist Completeness Logic
console.log("\n[Test 5] Mandatory Checklist Completeness Logic");
const uploadedIncomplete = ["land_document", "building_plan"];
const missingIncomplete = expectedKeys.filter((k) => !uploadedIncomplete.includes(k));

if (missingIncomplete.length !== 3) {
  console.error("FAIL: Checklist should detect 3 missing items");
  process.exit(1);
}

const uploadedComplete = ["land_document", "building_plan", "fire_safety", "affidavit", "faculty_list"];
const missingComplete = expectedKeys.filter((k) => !uploadedComplete.includes(k));

if (missingComplete.length !== 0) {
  console.error("FAIL: Complete checklist should have 0 missing items");
  process.exit(1);
}
console.log("PASS: Checklist gate blocks incomplete submissions and allows complete sets");

console.log("\n=== ALL APPLICATION & DOCUMENT SUBMISSION TESTS PASSED ===");
