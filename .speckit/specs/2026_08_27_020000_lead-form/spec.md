# Spec 2026_08_27_020000 — Lead Form

**Status:** Done
**Created:** 2026-08-27
**Author:** AI

---

## Overview

Admin creates exactly one lead form. The form has a name and a URL slug. Once created,
visitors can access the form at `/{slug}` without logging in. Only one form may ever exist.

---

## Goals

- Give the platform a single public entry point for lead collection.
- Auto-generate a URL-safe slug from the form name.
- Enforce the one-form-only constraint at both API and UI levels.

---

## User Stories

- As an **admin**, I want to create a lead form with a public URL so visitors can submit leads.
- As an **admin**, I want to see the public URL and copy it easily.
- As a **visitor**, I want to open the form URL and fill in my details without needing an account.

---

## Acceptance Criteria

### AC #1 — Create Form (Admin)

- [ ] Form requires: name (any string), slug (lowercase alphanumeric + hyphens, pattern `[a-z0-9-]+`).
- [ ] Slug auto-generates from name on input; admin can override it.
- [ ] If a form already exists, the create button is hidden — one form only.
- [ ] API enforces single-form constraint: second creation attempt returns `409`.
- [ ] Duplicate slug returns `400 { error: "This slug is already taken." }`.

### AC #2 — View Form (Admin)

- [ ] Forms page shows: name, slug, created date, public URL (copyable), "Open" button.
- [ ] "Open" button opens `/{slug}` in a new tab.

### AC #3 — Public Form (Visitor)

- [ ] Accessible at `/{slug}` with no authentication.
- [ ] Fields: Full Name (required), Email Address (valid email, required), Phone Number (required).
- [ ] Client-side validation with inline field errors.
- [ ] On success: thank-you message replaces the form.
- [ ] If slug not found: "Form Not Found" message.

---

## Form Data Model

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name, e.g. "Lead Registration" |
| `slug` | string | Unique; URL-safe; e.g. "lead-registration" |
| `createdAt` | datetime | Auto-set |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/forms` | Yes | Get the single form (or null) |
| `POST` | `/api/forms` | Yes | Create form — one only |
| `GET` | `/api/public/forms/:slug` | No | Form metadata for public page |
| `POST` | `/api/public/forms/:slug/submit` | No | Submit a lead |

---

## Constraints

- **One form only** — enforced in `formService.createForm()` and hidden in UI when form exists.
- Slug must be unique and URL-safe.

---

## Dependencies

- **`2026_08_27_000000_authentication`** — Admin must be authenticated to create the form.
