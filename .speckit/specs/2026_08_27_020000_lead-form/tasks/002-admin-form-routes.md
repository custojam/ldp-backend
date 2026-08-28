# Task 002 — Admin Form Routes

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** 001

## What to Build

Create the authenticated `/api/forms` router for admin form management.

## Files to Touch

- `backend/src/routes/forms.ts` — CREATE
- `backend/src/index.ts` — UPDATE (mount router)

## Implementation Notes

1. `GET /api/forms` → `formService.getForm()` — returns form or null.
2. `POST /api/forms`:
   - Validate: `name` (notEmpty), `slug` (matches `[a-z0-9-]+`).
   - Call `formService.createForm(name, slug)`.
   - Catch via `message.includes('already exists')` → `409 { error: message }`.
   - All other errors (e.g. "This slug is already taken.") → `400 { error: message }`.
   - Success → `201 <form object>` (the Prisma `Form` record returned directly, not wrapped).
3. All routes require `requireAuth`.

## Acceptance Criteria

- [ ] `GET /api/forms` returns current form or null.
- [ ] `POST /api/forms` returns 409 if form exists.
- [ ] `POST /api/forms` returns 400 with message if slug taken.
- [ ] `POST /api/forms` returns 201 on success.

## Tests to Write

Covered by service-level tests.
