# Task 001 — Distribution Service

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** none

## What to Build

Create `distributionService.ts` with all distribution and broker-assignment operations.

## Files to Touch

- `backend/src/services/distributionService.ts` — CREATE

## Implementation Notes

1. `getDistribution()` — `prisma.distribution.findFirst({ orderBy: { createdAt: 'asc' }, include: { form: true, distributionBrokers: { include: { broker: true } } } })`.
2. `getDistributionById(id)` — `prisma.distribution.findUnique({ where: { id }, include: { form: true, distributionBrokers: { include: { broker: true } }, leads: { orderBy: { createdAt: 'desc' }, include: { broker: { select: { id, name } } } } } })`.
3. `distributionExists()` — `const dist = await prisma.distribution.findFirst(); return !!dist`.
4. `createDistribution(name, brokers)`:
   - Call `formService.formExists()` — if false, throw `Error("Oops, please create a form first.")`.
   - Call `distributionExists()` — if true, throw `Error("A distribution already exists. Only one distribution is allowed.")` (→ 409).
   - Get form via `prisma.form.findFirst()`.
   - `prisma.distribution.create({ data: { name, formId: form.id, distributionBrokers: { create: brokers.map(...) } } })`.
5. `addBrokerToDistribution(distributionId, brokerId, percentage)` — `prisma.distributionBroker.upsert(...)` (upserts: updates percentage if pair exists, creates if not).
6. `updateDistributionBroker(distributionId, brokerId, data: { percentage?: number; isActive?: boolean })` — `prisma.distributionBroker.updateMany({ where: { distributionId, brokerId }, data })`.
7. `removeBrokerFromDistribution(distributionId, brokerId)` — `prisma.distributionBroker.deleteMany({ where: { distributionId, brokerId } })`.

## Acceptance Criteria

- [ ] `createDistribution()` throws "Oops, please create a form first." when no form.
- [ ] `createDistribution()` creates when form exists.
- [ ] `createDistribution()` throws when distribution already exists.
- [ ] `getDistribution()` returns null when none exists.
- [ ] `distributionExists()` returns true/false.

## Tests to Write

`backend/specs/distribution.spec.ts`

- Throws "Oops, please create a form first." when no form.
- Creates when form exists.
- Throws 409 when distribution already exists.
- `getDistribution()` returns null when none.
- `distributionExists()` returns true/false.
