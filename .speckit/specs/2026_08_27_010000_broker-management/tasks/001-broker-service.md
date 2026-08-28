# Task 001 — Broker Service

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** none

## What to Build

Create `brokerService.ts` with all CRUD operations for brokers.

## Files to Touch

- `backend/src/services/brokerService.ts` — CREATE

## Implementation Notes

1. `getAllBrokers()` — `prisma.broker.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { leads: true } } } })`.
2. `getBrokerById(id)` — `prisma.broker.findUnique({ where: { id }, include: { leads: { orderBy: { createdAt: 'desc' }, include: { form: { select: { name: true } } } }, distributionBrokers: true } })`.
3. `createBroker(data)` — `prisma.broker.create({ data })`.
4. `updateBroker(id, data)` — `prisma.broker.update({ where: { id }, data })`.
5. `deleteBroker(id)` — `prisma.broker.delete({ where: { id } })`.
6. `workingDays` comes in as `string[]` — Prisma stores it as JSON automatically.

## Acceptance Criteria

- [ ] `getAllBrokers()` returns array with `_count.leads`.
- [ ] `getBrokerById()` returns broker with nested leads or null.
- [ ] `createBroker()` persists all fields including workingDays JSON.
- [ ] `updateBroker()` updates only provided fields.
- [ ] `deleteBroker()` removes the record.

## Tests to Write

`backend/specs/broker.spec.ts`

- `getAllBrokers()` returns list.
- `getAllBrokers()` returns empty array.
- `getBrokerById()` returns broker.
- `getBrokerById()` returns null for unknown ID.
- `createBroker()` persists all fields.
- `updateBroker()` updates fields.
- `deleteBroker()` removes record.
