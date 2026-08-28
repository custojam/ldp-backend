# Task 002 — Broker Routes

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** 001

## What to Build

Create the `/api/brokers` Express router with full CRUD endpoints, all protected by `requireAuth`.

## Files to Touch

- `backend/src/routes/brokers.ts` — CREATE
- `backend/src/index.ts` — UPDATE (mount router)

## Implementation Notes

1. All routes use `requireAuth` middleware.
2. `GET /api/brokers` → `brokerService.getAllBrokers()`.
3. `POST /api/brokers` → validate: `name` (notEmpty, trim — required), `dailyCap` (optional, isInt
   min:1), `timezone` (optional, isString), `openingTime` (optional, HH:MM pattern), `closingTime`
   (optional, HH:MM pattern), `workingDays` (optional, isArray). All non-name fields default via
   Prisma schema when omitted → `brokerService.createBroker(data)`.
4. `GET /api/brokers/:id` → `brokerService.getBrokerById(id)` — 404 if null.
5. `PUT /api/brokers/:id` → validate: `name` (optional, notEmpty, trim), `dailyCap` (optional, isInt min:1), `openingTime` (optional, HH:MM pattern), `closingTime` (optional, HH:MM pattern) → `brokerService.updateBroker(id, data)`. Note: `timezone` and `workingDays` are NOT validated by express-validator on PUT (they pass through directly in `req.body`).
6. `DELETE /api/brokers/:id` → `brokerService.deleteBroker(id)`.
7. Mount in `index.ts`: `app.use('/api/brokers', brokerRouter)`.

## Acceptance Criteria

- [ ] All endpoints require authentication.
- [ ] `POST` and `PUT` validate all required fields.
- [ ] `GET /api/brokers/:id` returns 404 for unknown ID.

## Tests to Write

Covered by service-level tests in `backend/specs/broker.spec.ts`.
