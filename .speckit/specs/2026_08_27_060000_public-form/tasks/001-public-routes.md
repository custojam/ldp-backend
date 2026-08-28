# Task 001 — Public API Routes

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** none

## What to Build

Create the unauthenticated `/api/public` Express router. See also lead-form spec task 003 —
this task creates the same file; public-form spec documents the visitor submission side.

## Files to Touch

- `backend/src/routes/public.ts` — CREATE
- `backend/src/index.ts` — UPDATE (mount without requireAuth)

## Implementation Notes

1. `GET /api/public/forms/:slug` → `formService.getFormBySlug(slug)` — 404 if null.
2. `POST /api/public/forms/:slug/submit`:
   - Validate: `name` (notEmpty), `email` (isEmail + normalizeEmail), `phone` (notEmpty).
   - Capture IP: `req.headers['x-forwarded-for']?.split(',')[0]?.trim()` or `req.socket.remoteAddress` or `"0.0.0.0"`.
   - Call `leadService.submitLead({ name, email, phone, ipAddress, formSlug: slug })`.
   - Return `201 { message: "Thank you! Your information has been submitted successfully.", status: lead.status }`.
3. No `requireAuth` — these routes must be publicly accessible.

## Acceptance Criteria

- [ ] `GET` returns form metadata with no authentication.
- [ ] `GET` returns 404 for unknown slug.
- [ ] `POST` validates all three fields.
- [ ] `POST` captures and stores visitor IP.
- [ ] `POST` returns 201 with `{ message, status }` (not full lead data).

## Tests to Write

Covered by `backend/specs/lead.spec.ts` (IP capture, submission pipeline).
