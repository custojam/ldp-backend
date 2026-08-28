# Spec 2026_08_27_060000 — Public Form (Visitor Submission)

**Status:** Done
**Created:** 2026-08-27
**Author:** AI

---

## Overview

The public form is the visitor-facing page accessible at `/{slug}`. No authentication is required.
Visitors fill in their details and submit. The submission triggers the lead capture and distribution
pipeline. On success, a thank-you message replaces the form.

---

## Goals

- Provide a clean, accessible form for lead capture.
- Validate all fields client-side before submission.
- Show contextual error messages per field.
- Replace form with a thank-you message on successful submission.
- Show a "Form Not Found" state for unknown slugs.

---

## User Stories

- As a **visitor**, I want to fill in the form and submit my lead without creating an account.
- As a **visitor**, I want to see clear error messages if I fill in something wrong.
- As a **visitor**, I want to see a thank-you message after submitting successfully.
- As a **visitor**, I want to see a "Form Not Found" message if the URL is wrong.

---

## Acceptance Criteria

### AC #1 — Form Fields

- [ ] **Full Name** — required string.
- [ ] **Email Address** — required, valid email format.
- [ ] **Phone Number** — required string.

### AC #2 — Validation

- [ ] Inline error per field shown after failed submit attempt.
- [ ] Submit button disabled (or errors shown) while fields are invalid.
- [ ] Server-side validation error (e.g. 400) surfaces a generic form-level message.

### AC #3 — Success State

- [ ] On `201` response: form is replaced with a thank-you message. Heading: "Thank You!" Body: "Your information has been submitted successfully. We'll be in touch shortly."

### AC #4 — Error States

- [ ] Slug not found (`404` from API): render "Form Not Found" message.
- [ ] Network error: render generic error message.

### AC #5 — No Authentication

- [ ] Page and API endpoints accessible without any token or cookie.
- [ ] Next.js middleware must NOT protect `/{slug}` paths.

---

## API Endpoints Used

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/public/forms/:slug` | Fetch form metadata |
| `POST` | `/api/public/forms/:slug/submit` | Submit lead |

---

## Dependencies

- **`2026_08_27_020000_lead-form`** — Form must exist with a valid slug.
- **`2026_08_27_050000_leads`** — Submission triggers the lead pipeline.
- **`2026_08_27_000000_authentication`** — Middleware must explicitly allow `/{slug}` paths.
