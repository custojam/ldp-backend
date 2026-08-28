# Task 002 — Distribution Routes

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** 001

## What to Build

Create the authenticated `/api/distributions` Express router.

## Files to Touch

- `backend/src/routes/distributions.ts` — CREATE
- `backend/src/index.ts` — UPDATE (mount router)

## Implementation Notes

1. `GET /api/distributions` → `distributionService.getDistribution()`.
2. `POST /api/distributions` → validate `name` (notEmpty), `brokers` (isArray), `brokers.*.brokerId` (isInt), `brokers.*.percentage` (isFloat 0–100) → `distributionService.createDistribution(name, brokers)` — catch errors → 409 for "no form" and "already exists", 400 otherwise.
3. `GET /api/distributions/:id` → `distributionService.getDistributionById(id)` — 404 if null.
4. `POST /api/distributions/:id/brokers` → validate `brokerId` (isInt), `percentage` (isFloat 0–100)
   → `distributionService.addBrokerToDistribution(...)`.
5. `PUT /api/distributions/:id/brokers/:brokerId` → validate `percentage` (optional, isFloat 0–100), `isActive` (optional, isBoolean) → `distributionService.updateDistributionBroker(...)`.
6. `DELETE /api/distributions/:id/brokers/:brokerId` → `distributionService.removeBrokerFromDistribution(...)`.
7. All routes require `requireAuth`.

## Acceptance Criteria

- [ ] All endpoints require auth.
- [ ] `POST /api/distributions` returns 409 when no form exists.
- [ ] `POST /api/distributions` returns 409 when distribution exists.
- [ ] Broker add/update/remove endpoints work correctly.

## Tests to Write

Covered by service-level tests.
