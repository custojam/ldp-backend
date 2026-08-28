# Plan 2026_08_27_050000 — Leads

**Spec:** [spec.md](./spec.md)
**Status:** Done
**Created:** 2026-08-27

---

## Technical Approach

`leadService.ts` orchestrates the full submission pipeline:

1. Normalize email to lowercase.
2. Check for duplicate email (`prisma.lead.findFirst({ where: { email } })`).
3. Fetch the active distribution with broker assignments.
4. Call `filterEligibleBrokers()` → `computeDeficit()` → select winner.
5. Create lead record with correct status and brokerId.

Manual assignment in `manualAssignLead()` reads the lead first and throws if `status !== "unsent"`.

---

## Constitution Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| Business logic in services | ✅ | `leadService.ts` |
| Server-side validation | ✅ | `express-validator` on submit and assign |
| TypeScript strict | ✅ | All types explicit |
| Tests | ✅ | `backend/specs/lead.spec.ts`, `frontend/specs/lead.spec.ts` |

---

## File Map

| Action | File | Reason |
|--------|------|--------|
| CREATE | `backend/src/services/leadService.ts` | Lead pipeline + stats |
| CREATE | `backend/src/routes/leads.ts` | Admin lead endpoints |
| UPDATE | `backend/src/routes/public.ts` | `POST /api/public/forms/:slug/submit` calls `leadService` |
| CREATE | `frontend/src/app/(admin)/leads/page.tsx` | All leads with filter and manual assign |

---

## Testing Plan

| # | Test | File |
|---|------|------|
| 1 | `getAllLeads()` returns leads with form and broker | `backend/specs/lead.spec.ts` |
| 2 | `getLeadById()` returns single lead | `backend/specs/lead.spec.ts` |
| 3 | `manualAssignLead()` assigns `unsent` lead | `backend/specs/lead.spec.ts` |
| 4 | `manualAssignLead()` throws on `sent` lead | `backend/specs/lead.spec.ts` |
| 5 | `manualAssignLead()` throws on missing lead | `backend/specs/lead.spec.ts` |
| 6 | `manualAssignLead()` throws on missing broker | `backend/specs/lead.spec.ts` |
| 7 | Email stored as lowercase | `backend/specs/lead.spec.ts` |
| 8 | IP address present on lead | `backend/specs/lead.spec.ts` |
| 9 | Status badge colors correct per status | `frontend/specs/lead.spec.ts` |
| 10 | Only `unsent` leads show Assign action | `frontend/specs/lead.spec.ts` |
| 11 | Status filter reduces visible leads | `frontend/specs/lead.spec.ts` |
| 12 | Required columns: name, email, phone, IP, form, broker, status, date | `frontend/specs/lead.spec.ts` |
