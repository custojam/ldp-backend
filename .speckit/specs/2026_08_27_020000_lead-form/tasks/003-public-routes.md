# Task 003 — Public Routes

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** 001

## What to Build

Create the unauthenticated `/api/public` router for visitor-facing form access and lead submission.

## Files to Touch

- `backend/src/routes/public.ts` — CREATE
- `backend/src/index.ts` — UPDATE (mount router, no requireAuth)

## Implementation Notes

1. `GET /api/public/forms/:slug` → `formService.getFormBySlug(slug)` — 404 if null.
2. `POST /api/public/forms/:slug/submit`:
   - Validate: `name` (notEmpty), `email` (isEmail + normalizeEmail), `phone` (notEmpty).
   - Capture IP: `req.headers['x-forwarded-for']?.split(',')[0]?.trim()` or `req.socket.remoteAddress` or `"0.0.0.0"`.
   - Call `leadService.submitLead({ name, email, phone, ipAddress, formSlug: slug })`.
   - Return `201 { message: "Thank you! Your information has been submitted successfully.", status: lead.status }`.
3. No `requireAuth` on this router.

## Acceptance Criteria

- [ ] `GET /api/public/forms/:slug` returns form metadata with no auth.
- [ ] `GET /api/public/forms/:slug` returns 404 for unknown slug.
- [ ] `POST /api/public/forms/:slug/submit` creates lead and captures IP.

## Tests to Write

Covered by service-level tests in `backend/specs/lead.spec.ts`.
