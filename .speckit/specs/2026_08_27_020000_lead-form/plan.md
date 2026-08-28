# Plan 2026_08_27_020000 — Lead Form

**Spec:** [spec.md](./spec.md)
**Status:** Done
**Created:** 2026-08-27

---

## Technical Approach

`formService.ts` owns all database interactions. A single check in `createForm()` enforces the
one-form constraint by counting existing records before insert. The slug is validated with the
pattern `[a-z0-9-]+` on the backend via `express-validator`. The public form route is
unauthenticated and lives under `/api/public/`.

---

## Constitution Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| Business logic in services | ✅ | `formService.ts` — no logic in routes |
| Server-side validation | ✅ | `express-validator` on `POST /api/forms` |
| TypeScript strict | ✅ | All types explicit |
| Tests | ✅ | `backend/specs/form.spec.ts`, `frontend/specs/form.spec.ts` |

---

## File Map

| Action | File | Reason |
|--------|------|--------|
| CREATE | `backend/src/services/formService.ts` | Form CRUD + single-form guard |
| CREATE | `backend/src/routes/forms.ts` | Admin endpoints (auth required) |
| CREATE | `backend/src/routes/public.ts` | `/api/public/forms/:slug` (no auth) |
| CREATE | `frontend/src/app/(admin)/forms/page.tsx` | Admin form management UI |
| CREATE | `frontend/src/app/[slug]/page.tsx` | Public visitor form |

---

## Testing Plan

| # | Test | File |
|---|------|------|
| 1 | `getForm()` returns null when none exists | `backend/specs/form.spec.ts` |
| 2 | `createForm()` persists name, slug, and returns public URL | `backend/specs/form.spec.ts` |
| 3 | `createForm()` throws if form already exists | `backend/specs/form.spec.ts` |
| 4 | `createForm()` throws "slug already taken" on duplicate slug | `backend/specs/form.spec.ts` |
| 5 | `formExists()` returns true/false | `backend/specs/form.spec.ts` |
| 6 | Slug auto-generated from name (spaces → hyphens, lowercase) | `frontend/specs/form.spec.ts` |
| 7 | Public URL format: `/{slug}` | `frontend/specs/form.spec.ts` |
| 8 | Client-side validation: name, email, phone required | `frontend/specs/form.spec.ts` |
| 9 | Create button hidden when form already exists | `frontend/specs/form.spec.ts` |
