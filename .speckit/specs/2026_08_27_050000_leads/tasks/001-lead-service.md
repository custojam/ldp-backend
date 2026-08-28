# Task 001 — Lead Service

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** none

## What to Build

Create `leadService.ts` with the full submission pipeline, manual assignment, and stats queries.

## Files to Touch

- `backend/src/services/leadService.ts` — CREATE

## Implementation Notes

1. `submitLead({ name, email, phone, ipAddress, formSlug })`:
   - Normalize: `normalizedEmail = email.trim().toLowerCase()`.
   - Find form: `prisma.form.findUnique({ where: { slug: formSlug } })` — throw `"Form not found"` if null.
   - Duplicate check: `prisma.lead.findFirst({ where: { email: normalizedEmail, status: 'sent' } })` → if found, create lead with `status: "duplicate"`, return. Only previously **sent** leads trigger the duplicate flag.
   - Fetch distribution: `distributionService.getDistribution()` → if null, create lead with `status: "unsent"`.
   - Build `brokersWithStats` array: for each `distributionBroker`, count `sentToday` using `getBrokerDayRange(broker.timezone)` and `prisma.lead.count(...)`.
   - Compute `totalSentToday = sum of all sentToday`.
   - Call `filterEligibleBrokers(brokersWithStats)` then `selectBroker(eligibleBrokers, totalSentToday)`.
   - All `prisma.lead.create()` calls include `formName: form.name` (denormalized field stored on lead).
   - If winner: create lead with `status: "sent"`, `brokerId: winner.id`, `distributionId: distribution.id`, include `broker: { select: { id, name } }`.
   - If no winner: create lead with `status: "unsent"`, `distributionId: distribution.id`.

2. `getAllLeads(filters?: { status?: string })` — `prisma.lead.findMany({ where: filters?.status ? { status } : undefined, orderBy: { createdAt: 'desc' }, include: { broker: { select: { id, name } }, form: { select: { id, name, slug } } } })`.

3. `getLeadById(id)` — `prisma.lead.findUnique({ where: { id }, include: { broker: { select: { id, name } }, form: { select: { id, name, slug } } } })`.

4. `manualAssignLead(leadId, brokerId)`:
   - Fetch lead → if not found, throw `"Lead not found"`.
   - If `lead.status !== "unsent"`, throw `"Only unsent leads can be manually assigned"`.
   - Fetch broker → if not found, throw `"Broker not found"`.
   - `prisma.lead.update({ where: { id: leadId }, data: { brokerId, status: "sent" }, include: { broker: { select: { id, name } } } })`.

5. `getLeadStats()` — count by status: `{ total, sent, unsent, duplicate, failed }`.

## Acceptance Criteria

- [ ] `getAllLeads()` returns leads with form and broker.
- [ ] `getLeadById()` returns single lead.
- [ ] `manualAssignLead()` assigns unsent lead.
- [ ] `manualAssignLead()` throws on sent lead.
- [ ] `manualAssignLead()` throws on missing lead or broker.
- [ ] Email stored as lowercase.
- [ ] IP address stored on lead.

## Tests to Write

`backend/specs/lead.spec.ts`

- `getAllLeads()` returns leads with form and broker.
- `getLeadById()` returns single lead.
- `manualAssignLead()` assigns unsent lead.
- `manualAssignLead()` throws on sent lead.
- `manualAssignLead()` throws on missing lead.
- `manualAssignLead()` throws on missing broker.
- Email stored lowercase.
- IP address present.
