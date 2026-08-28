# Task 002 — Lead Routes

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** 001

## What to Build

Create the authenticated `/api/leads` Express router.

## Files to Touch

- `backend/src/routes/leads.ts` — CREATE
- `backend/src/index.ts` — UPDATE (mount router)

## Implementation Notes

1. `GET /api/leads` → accepts optional `?status=` query param → `leadService.getAllLeads(status ? { status } : undefined)`.
2. `GET /api/leads/stats` → `leadService.getLeadStats()`.
3. `GET /api/leads/:id` → `leadService.getLeadById(id)` — 404 if null.
4. `POST /api/leads/:id/assign`:
   - Validate `brokerId` (isInt).
   - Call `leadService.manualAssignLead(id, brokerId)`.
   - All thrown errors (both "not found" and "Only unsent leads...") → `400`.
5. All routes require `requireAuth`.
6. Mount in `index.ts`: `app.use('/api/leads', leadsRouter)`.

## Acceptance Criteria

- [ ] All endpoints require auth.
- [ ] `POST /api/leads/:id/assign` returns 400 for non-unsent lead.
- [ ] `GET /api/leads/stats` returns correct counts.

## Tests to Write

Covered by service-level tests.
