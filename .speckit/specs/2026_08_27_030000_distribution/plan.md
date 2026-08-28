# Plan 2026_08_27_030000 — Distribution

**Spec:** [spec.md](./spec.md)
**Status:** Done
**Created:** 2026-08-27

---

## Technical Approach

`distributionService.ts` owns all distribution business logic. `createDistribution()` first calls
`formExists()` and throws a user-facing error if no form is found, then checks `distributionExists()`
to enforce the one-distribution constraint. The `DistributionBroker` join table has a compound
unique constraint `[distributionId, brokerId]` enforced at the DB level.

The distribution detail page fetches distribution with nested `brokers` (with broker info) and
`leads` in a single Prisma query using `include`.

---

## Constitution Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| Business logic in services | ✅ | `distributionService.ts` |
| Server-side validation | ✅ | `express-validator` on write endpoints |
| TypeScript strict | ✅ | All types explicit |
| Tests | ✅ | `backend/specs/distribution.spec.ts`, `frontend/specs/distribution.spec.ts` |

---

## File Map

| Action | File | Reason |
|--------|------|--------|
| CREATE | `backend/src/services/distributionService.ts` | All distribution logic |
| CREATE | `backend/src/routes/distributions.ts` | REST endpoints |
| CREATE | `frontend/src/app/(admin)/distributions/page.tsx` | Create/view distribution |
| CREATE | `frontend/src/app/(admin)/distributions/[id]/page.tsx` | Detail with broker table and leads |

---

## Testing Plan

| # | Test | File |
|---|------|------|
| 1 | `createDistribution()` throws "Oops, please create a form first." when no form | `backend/specs/distribution.spec.ts` |
| 2 | `createDistribution()` creates when form exists | `backend/specs/distribution.spec.ts` |
| 3 | `createDistribution()` throws `409` when distribution already exists | `backend/specs/distribution.spec.ts` |
| 4 | `getDistribution()` returns null when none | `backend/specs/distribution.spec.ts` |
| 5 | `distributionExists()` returns true/false | `backend/specs/distribution.spec.ts` |
| 6 | "Create form first" guard shown in UI before form exists | `frontend/specs/distribution.spec.ts` |
| 7 | Create button hidden when distribution already exists | `frontend/specs/distribution.spec.ts` |
| 8 | Percentage validation: 1–100 integer | `frontend/specs/distribution.spec.ts` |
| 9 | Broker payload includes `brokerId` and `percentage` | `frontend/specs/distribution.spec.ts` |
| 10 | Lead counts by status (sent/unsent/duplicate) | `frontend/specs/distribution.spec.ts` |
