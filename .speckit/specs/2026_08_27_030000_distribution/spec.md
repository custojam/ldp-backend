# Spec 2026_08_27_030000 — Distribution

**Status:** Done
**Created:** 2026-08-27
**Author:** AI

---

## Overview

Admins configure exactly one distribution. A distribution links a form to a set of brokers with
percentage weights. The total percentage across all brokers should equal 100. Once a distribution
exists, the lead submission pipeline uses it to route leads.

---

## Goals

- Allow the admin to create a distribution tied to the existing form.
- Let the admin add, edit, or remove brokers from the distribution with percentage weights.
- Enforce the one-distribution constraint at both API and UI levels.

---

## User Stories

- As an **admin**, I want to create a distribution so that submitted leads get routed to brokers.
- As an **admin**, I want to add brokers to the distribution with a percentage so I can control
  how many leads each broker receives.
- As an **admin**, I want to remove a broker from the distribution without deleting the broker.
- As an **admin**, I want to see a summary of how many leads have been sent to each broker.

---

## Acceptance Criteria

### AC #1 — Create Distribution

- [ ] A form must exist before creating a distribution; API returns `409 { error: "Oops, please create a form first." }` otherwise.
- [ ] Only one distribution may exist; second attempt returns `409`.
- [ ] Distribution is linked to the existing form automatically (no form selection UI).

### AC #2 — Broker Assignments

- [ ] Admin can add any active broker with a `percentage` (float).
- [ ] Admin can toggle a broker's `isActive` flag within the distribution (independent of the broker's global status).
- [ ] Admin can update a broker's percentage.
- [ ] Admin can remove a broker from the distribution.
- [ ] Adding a broker that already exists in the distribution upserts (updates the percentage).

### AC #3 — Distribution Detail Page

- [ ] Accessible at `/distributions/:id`.
- [ ] Shows total leads, sent, unsent, and duplicate counts.
- [ ] Broker table: name, percentage, isActive badge, edit/remove actions.
- [ ] Full lead history table: name, email, phone, IP, broker, status, date.
- [ ] "Add Broker" panel to attach brokers not yet in the distribution.

---

## Distribution Data Model

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name for the distribution |
| `formId` | int | FK → Form; `@unique` (one distribution per form) |
| `createdAt` | datetime | Auto-set |
| `updatedAt` | datetime | Auto-updated |

## DistributionBroker Data Model

| Field | Type | Notes |
|-------|------|-------|
| `distributionId` | int | FK → Distribution |
| `brokerId` | int | FK → Broker |
| `percentage` | float | Broker's share of leads |
| `isActive` | boolean | Active/inactive inside this distribution; default `true` |
| @@unique | [distributionId, brokerId] | No duplicate pairs |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/distributions` | Yes | Get the single distribution (or null) |
| `POST` | `/api/distributions` | Yes | Create distribution |
| `GET` | `/api/distributions/:id` | Yes | Detail with brokers and leads |
| `PUT` | `/api/distributions/:id/brokers/:brokerId` | Yes | Update broker percentage and/or isActive |
| `POST` | `/api/distributions/:id/brokers` | Yes | Add broker |
| `DELETE` | `/api/distributions/:id/brokers/:brokerId` | Yes | Remove broker |

---

## Constraints

- **One distribution only** — enforced in `distributionService.createDistribution()` and hidden in UI.
- **Form must exist first** — service throws if no form record found.

---

## Dependencies

- **`2026_08_27_000000_authentication`** — Admin must be authenticated.
- **`2026_08_27_020000_lead-form`** — Distribution requires a form to exist.
- **`2026_08_27_010000_broker-management`** — Brokers must exist to be added.
