# Plan 2026_08_27_060000 — Public Form (Visitor Submission)

**Spec:** [spec.md](./spec.md)
**Status:** Done
**Created:** 2026-08-27

---

## Technical Approach

The public form lives at `frontend/src/app/[slug]/page.tsx` — Next.js dynamic route. On mount, it
calls `GET /api/public/forms/:slug` to fetch form metadata. If the slug is not found, it renders
a "Form Not Found" state. On submit, it calls `POST /api/public/forms/:slug/submit`.

Client-side validation is done with React `useState` for per-field errors, checked on form submit
before the API call.

The Next.js middleware (`middleware.ts`) explicitly excludes dynamic `/{slug}` routes from
protection by matching only known admin path prefixes.

---

## Constitution Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| No auth on public routes | ✅ | `publicApi` axios instance has no auth header |
| Server-side validation | ✅ | `express-validator` on `/api/public/forms/:slug/submit` |
| TypeScript strict | ✅ | All types explicit |
| Tests | ✅ | Covered via `frontend/specs/form.spec.ts` |

---

## File Map

| Action | File | Reason |
|--------|------|--------|
| CREATE | `frontend/src/app/[slug]/page.tsx` | Public visitor form |
| CREATE | `backend/src/routes/public.ts` | Unauthenticated API endpoints |
| UPDATE | `frontend/src/middleware.ts` | Exclude `/{slug}` from protection |

---

## Testing Plan

| # | Test | File |
|---|------|------|
| 1 | Email validation rejects invalid format | `frontend/specs/form.spec.ts` |
| 2 | Name and phone are required | `frontend/specs/form.spec.ts` |
| 3 | `/login` and `/{slug}` are not in the protected paths list | `frontend/specs/auth.spec.ts` |
