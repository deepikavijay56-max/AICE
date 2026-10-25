# AICTE SAKSHAM - Security Verification & Role Matrix Checklist

This document details the practical verification checklist across all platform roles for [`supabase/migrations/20261025164500_initial_schema.sql`](file:///c:/Users/mutha/OneDrive/Desktop/AICTE/aicte-saksham/supabase/migrations/20261025164500_initial_schema.sql).

---

## 1. Role Permission Matrix & Test Checklist

### 1.1 Institution Users (`institution_admin`, `institution_user`)
- [ ] **Permitted**:
  - `SELECT` on own institution record (`institutions.id = profile.institution_id`).
  - `UPDATE` contact details on own institution (`institution_admin` only).
  - `INSERT` new applications in `status = 'draft'` and `current_stage = 'draft'` for own institution.
  - `UPDATE` draft applications belonging to own institution (fields: metadata, application details).
  - `UPDATE` application status from `draft` &rarr; `submitted` (automatically sets `submission_date = NOW()`).
  - `INSERT` documents with `is_verified = false` bound to own institution.
  - `INSERT` undertakings with `is_verified = false` and matching own `signed_by_profile_id`.
  - `INSERT` compliance submissions responding to own application.
  - `SELECT` own submitted tasks, undertakings, documents, and notifications.
  - `UPDATE` own notification events to toggle `is_read`.
- [ ] **Denied / Enforced Rejection**:
  - `SELECT` applications, documents, or compliance submissions belonging to other institutions (*Denied by RLS*).
  - `INSERT` application for any other `institution_id` or mismatched `region_id` (*Blocked by Trigger*).
  - `INSERT` application directly into `submitted`, `under_scrutiny`, or `approved` (*Blocked by Trigger*).
  - `UPDATE` application once status is `submitted` or later (*Blocked by Trigger*).
  - `UPDATE` `target_decision_date`, `workflow_definition_id`, `application_number`, or `institution_id` (*Blocked by Trigger*).
  - `UPDATE` `documents.storage_key`, `checksum_sha256`, `file_size_bytes`, or `is_verified` (*Blocked by Trigger*).
  - `UPDATE` `undertakings.clause_text`, `digital_signature_hash`, or `is_verified` (*Blocked by Trigger*).
  - `UPDATE` `notification_events.content`, `title`, or `recipient_profile_id` (*Blocked by Trigger*).
  - `UPDATE` or `DELETE` on `application_events` or `audit_logs` (*No RLS policies exist*).
  - `UPDATE` own profile to elevate `role`, change `institution_id`, or change `region_id` (*Blocked by Trigger*).

---

### 1.2 Scrutiny Officers (`scrutiny_officer`)
- [ ] **Permitted**:
  - `SELECT` applications, documents, compliance submissions, and tasks within assigned `region_id`.
  - `UPDATE` applications in status `submitted`, `under_scrutiny`, or `scrutiny_clarification_sought` within assigned `region_id`:
    - Permitted target statuses: `under_scrutiny`, `scrutiny_clarification_sought`, `scrutiny_cleared`, `rejected`.
  - `UPDATE` `documents.is_verified`, `verified_by`, `verified_at` for applications in assigned region.
  - `UPDATE` `undertakings.is_verified`, `verified_by`, `verified_at` for applications in assigned region.
  - `UPDATE` `compliance_submissions.review_comments`, `status`, `reviewed_by`, `reviewed_at`.
  - `INSERT` and `UPDATE` assigned workflow tasks in assigned region.
  - `INSERT` and `UPDATE` escalations for applications in assigned region.
  - `INSERT` notifications scoped strictly to users within the application's institution or region.
- [ ] **Denied / Enforced Rejection**:
  - `SELECT` or `UPDATE` records from outside assigned `region_id` (*Denied by RLS*).
  - `UPDATE` application status from `scrutiny_cleared` to `approved` (*Restricted to Council Admins*).
  - `UPDATE` `documents.storage_key` or `documents.checksum_sha256` (*Blocked by Trigger*).
  - `UPDATE` or `INSERT` audit logs directly (*No direct modification allowed*).

---

### 1.3 Regional Officers (`regional_officer`)
- [ ] **Permitted**:
  - `SELECT` all institutions, applications, tasks, visits, documents, and submissions in assigned `region_id`.
  - `UPDATE` applications across all valid regional stage transitions:
    - `under_scrutiny`, `scrutiny_cleared`, `evc_scheduled`, `evc_completed`, `sac_review`, `rejected`, `withdrawn`.
  - `INSERT` and `UPDATE` `evc_visits` for applications in assigned region.
  - Assign and reassign tasks within assigned region.
  - Read and manage regional officer profile team members.
- [ ] **Denied / Enforced Rejection**:
  - Access any application, institution, or document outside assigned `region_id` (*Denied by RLS*).
  - Jump application status to `approved` without council approval stage (*Blocked by State Machine*).
  - Rebind workflow tasks to an application in a different region (*Blocked by Trigger*).
  - Modify core institutional identity (e.g. `legal_entity_type` or `aicte_id`) (*Council Admin only*).

---

### 1.4 EVC Experts (`evc_expert`)
- [ ] **Permitted**:
  - `SELECT` application and document metadata for specifically assigned EVC visits (`lead_expert_id = auth.uid()` or listed in `committee_members`).
  - `UPDATE` findings summary, compliance score, and report storage key on assigned `evc_visits`.
  - `INSERT` application events for assigned EVC visit milestones.
- [ ] **Denied / Enforced Rejection**:
  - Access any application or institution where the expert is not explicitly assigned (*Denied by RLS*).
  - Directly alter application status or verify compliance submissions (*Denied by RLS*).
  - Insert or delete workflow definitions, deadline policies, or regions (*Denied by RLS*).

---

### 1.5 Council Administrators (`council_admin`)
- [ ] **Permitted**:
  - `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on all workflow definitions, deadline policies, and regions.
  - Create and manage profiles, user roles, institution assignments, and region assignments.
  - Authorize final statutory decisions (`approved`, `rejected`).
  - View full system audit logs (`audit_logs`) and system-wide application events.
- [ ] **Denied / Enforced Rejection**:
  - Cannot bypass immutable audit log triggers.
  - Direct `UPDATE` or `DELETE` on `audit_logs` table (*Strictly disallow all modifications*).

---

### 1.6 System Auditors (`system_auditor`)
- [ ] **Permitted**:
  - Read-only `SELECT` access across all domain tables (`institutions`, `applications`, `documents`, `tasks`, `evc_visits`, `undertakings`, `compliance_submissions`, `escalations`, `audit_logs`).
- [ ] **Denied / Enforced Rejection**:
  - All `INSERT`, `UPDATE`, and `DELETE` operations on every domain table (*Strictly Read-Only*).

---

## 2. Test Execution Command

To execute the transactional test suite against a test database:
```bash
# In Supabase SQL Editor:
# Paste supabase/tests/01_security_verification.sql and click Run.
# Ensure all 8 test assertions log "TEST X PASSED" and complete with "ROLLBACK".
```
