# Plan 2026_08_27_010000 — Broker Management

**Spec:** [spec.md](./spec.md)
**Status:** Done
**Created:** 2026-08-27

---

## Technical Approach

Standard CRUD pattern. `brokerService.ts` owns all database interactions via Prisma.
Routes delegate to the service and return HTTP responses. The frontend uses a single page
with a modal for create/edit, and a separate detail page for leads.

`workingDays` is stored as a Prisma `Json` column (MySQL JSON type), parsed to a string
array on read.

---

## Constitution Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| Business logic in services | ✅ | `brokerService.ts` — no logic in routes |
| Server-side validation | ✅ | `express-validator` on all write endpoints |
| TypeScript strict | ✅ | All types explicit |
| Tests | ✅ | `backend/specs/broker.spec.ts`, `frontend/specs/broker.spec.ts` |

---

## File Map

| Action | File | Reason |
|--------|------|--------|
| CREATE | `backend/src/services/brokerService.ts` | CRUD operations |
| CREATE | `backend/src/routes/brokers.ts` | REST endpoints |
| CREATE | `frontend/src/app/(admin)/brokers/page.tsx` | Broker list + create/edit modal |
| CREATE | `frontend/src/app/(admin)/brokers/[id]/page.tsx` | Broker detail with leads |
| CREATE | `frontend/src/components/admin/BrokerForm.tsx` | Reusable create/edit form |

---

## Testing Plan

| # | Test | File |
|---|------|------|
| 1 | `getAllBrokers()` returns list | `backend/specs/broker.spec.ts` |
| 2 | `getAllBrokers()` returns empty array | `backend/specs/broker.spec.ts` |
| 3 | `getBrokerById()` returns broker | `backend/specs/broker.spec.ts` |
| 4 | `getBrokerById()` returns null for unknown ID | `backend/specs/broker.spec.ts` |
| 5 | `createBroker()` persists all fields | `backend/specs/broker.spec.ts` |
| 6 | `updateBroker()` updates fields | `backend/specs/broker.spec.ts` |
| 7 | `deleteBroker()` removes record | `backend/specs/broker.spec.ts` |
| 8 | Day abbreviation display (Mon/Tue/...) | `frontend/specs/broker.spec.ts` |
| 9 | Active/inactive toggle logic | `frontend/specs/broker.spec.ts` |
| 10 | Time format `HH:MM – HH:MM` | `frontend/specs/broker.spec.ts` |
| 11 | Name and dailyCap validation | `frontend/specs/broker.spec.ts` |
