# Spec 2026_08_27_010000 — Broker Management

**Status:** Done
**Created:** 2026-08-27
**Author:** AI

---

## Overview

Admins create and manage brokers. Each broker has a schedule (timezone, open hours, working
days) and a daily cap. The broker's schedule and cap directly control whether it receives leads
from the distribution engine. Many brokers can be created.

---

## Goals

- Allow admins to create, edit, deactivate, and delete brokers.
- Enforce timezone-aware schedule configuration per broker.
- Provide a broker detail page showing all leads that broker has received.

---

## User Stories

- As an **admin**, I want to create a broker with a schedule so it can receive leads automatically.
- As an **admin**, I want to edit a broker's daily cap and hours so I can adjust capacity.
- As an **admin**, I want to toggle a broker's active status without deleting it.
- As an **admin**, I want to view all leads a broker received including their IP addresses.

---

## Acceptance Criteria

### AC #1 — Create Broker

- [ ] Required fields: name, daily cap (positive integer), timezone, opening time (`HH:MM`), closing time (`HH:MM`), working days (array).
- [ ] Active/inactive toggle defaults to `true`.
- [ ] Broker immediately appears in the list after creation.

### AC #2 — Broker List

- [ ] Table columns: name (link), status badge, daily cap, timezone, hours, working days, lead count, edit/delete actions.
- [ ] Status badge: green = Active, gray = Inactive.
- [ ] Clicking status badge toggles `isActive` immediately.

### AC #3 — Edit Broker

- [ ] Pre-filled modal with all current values.
- [ ] All fields editable.
- [ ] Changes reflected immediately in the table.

### AC #4 — Delete Broker

- [ ] Confirmation prompt before deletion.
- [ ] Broker removed from list after confirmation.

### AC #5 — Broker Detail Page

- [ ] Accessible at `/brokers/:id`.
- [ ] Shows broker config: cap, timezone, hours, working days count.
- [ ] Lead table: name, email, phone, IP address, form name, status badge, date received.
- [ ] Empty state if no leads assigned.

---

## Broker Data Model

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `name` | string | Yes | — | Display name |
| `isActive` | boolean | Yes | `true` | Global active flag |
| `dailyCap` | integer | Yes | `100` | Min: 1 |
| `timezone` | string | Yes | `"UTC"` | IANA timezone name |
| `openingTime` | string | Yes | `"09:00"` | Format: `HH:MM` |
| `closingTime` | string | Yes | `"18:00"` | Format: `HH:MM` |
| `workingDays` | JSON array | Yes | Mon–Fri | Day names |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/brokers` | Yes | List all with lead `_count` |
| `POST` | `/api/brokers` | Yes | Create |
| `GET` | `/api/brokers/:id` | Yes | Detail with nested leads |
| `PUT` | `/api/brokers/:id` | Yes | Update any fields |
| `DELETE` | `/api/brokers/:id` | Yes | Delete |

---

## Out of Scope

- Broker endpoint URL / webhook integration (not required for this exam).
- Bulk broker import.

---

## Dependencies

- **`2026_08_27_000000_authentication`** — Admin must be authenticated to manage brokers.
