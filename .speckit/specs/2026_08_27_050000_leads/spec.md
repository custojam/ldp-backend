# Spec 2026_08_27_050000 — Leads

**Status:** Done
**Created:** 2026-08-27
**Author:** AI

---

## Overview

Leads are captured when a visitor submits the public form. Each lead stores the visitor's contact
details, IP address, status, and the broker it was assigned to. Admins can view all leads and
manually assign unsent leads to a broker.

---

## Goals

- Store all submitted leads with full audit trail (IP, form, broker, status, timestamp).
- Prevent duplicate submissions by the same email address.
- Allow admins to manually assign `unsent` leads to a specific broker.
- Expose lead statistics for the dashboard.

---

## User Stories

- As the **system**, I want to save every lead submission with its IP address for audit purposes.
- As the **system**, I want to mark duplicate emails as `status = "duplicate"` and not route them.
- As an **admin**, I want to see all leads with their current status and broker assignment.
- As an **admin**, I want to manually assign an `unsent` lead to a broker if auto-routing failed.

---

## Acceptance Criteria

### AC #1 — Lead Capture

- [ ] Fields stored: name, email (normalized lowercase), phone, ipAddress, formId, formName (snapshot), brokerId (nullable), distributionId (nullable), status.
- [ ] If email was previously sent to a broker (`status = 'sent'` check): `status = "duplicate"`, brokerId = null.
- [ ] If no eligible broker found: `status = "unsent"`, brokerId = null.
- [ ] If broker selected: `status = "sent"`, brokerId = broker.id.

### AC #2 — Lead Status

| Status | Meaning |
|--------|---------|
| `sent` | Routed to a broker successfully |
| `unsent` | No eligible broker at submission time |
| `duplicate` | Email already exists |
| `failed` | Unexpected routing error |

### AC #3 — Admin Leads Page

- [ ] Table: name, email, phone, IP, form, broker, status badge, date.
- [ ] Filter by status (all / sent / unsent / duplicate / failed).
- [ ] `unsent` leads show "Assign" action; other statuses do not.

### AC #4 — Manual Assignment

- [ ] Only `unsent` leads may be manually assigned.
- [ ] Admin selects a broker from a dropdown and confirms.
- [ ] After assignment, status changes to `sent` and broker is recorded.
- [ ] Attempting to assign a non-`unsent` lead returns `400`.

### AC #5 — Lead Statistics

- [ ] `GET /api/leads/stats` returns `{ total, sent, unsent, duplicate, failed }`.
- [ ] Used on the dashboard. (Distribution detail page computes per-status counts locally from embedded `leads[]` in the distribution response, not from this endpoint.)

---

## Lead Data Model

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Visitor's full name |
| `email` | string | Normalized to lowercase |
| `phone` | string | Raw string |
| `ipAddress` | string | Captured from request |
| `formId` | int | FK → Form |
| `formName` | string | Snapshot of form name at submission time |
| `brokerId` | int? | FK → Broker; null if unassigned |
| `distributionId` | int? | FK → Distribution; null if no distribution existed |
| `status` | enum | `sent`, `unsent`, `duplicate`, `failed` |
| `createdAt` | datetime | Auto-set |
| `updatedAt` | datetime | Auto-updated |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/leads` | Yes | All leads (with form and broker); optional `?status=` filter |
| `GET` | `/api/leads/stats` | Yes | Status counts |
| `GET` | `/api/leads/:id` | Yes | Single lead detail |
| `POST` | `/api/leads/:id/assign` | Yes | Manually assign unsent lead |

---

## Dependencies

- **`2026_08_27_000000_authentication`** — Admin must be authenticated to view leads.
- **`2026_08_27_020000_lead-form`** — Leads reference a form.
- **`2026_08_27_030000_distribution`** — Lead submission triggers broker selection.
- **`2026_08_27_040000_distribution-logic`** — The selection algorithm.
