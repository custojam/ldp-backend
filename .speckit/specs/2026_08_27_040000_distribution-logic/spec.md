# Spec 2026_08_27_040000 — Distribution Logic

**Status:** Done
**Created:** 2026-08-27
**Author:** AI

---

## Overview

When a lead is submitted, the distribution engine must select the best eligible broker using a
deficit-based algorithm. The engine accounts for each broker's timezone, open hours, working days,
and daily cap before scoring candidates.

---

## Goals

- Route each lead to the broker with the highest deficit score.
- Ensure brokers only receive leads when they are open and under their daily cap.
- Provide deterministic tie-breaking when two brokers have equal deficit.

---

## User Stories

- As the **system**, I want to select the broker with the highest deficit so percentages are
  respected over time.
- As the **system**, I want to skip brokers that are closed, inactive, or capped so leads are
  only sent to available brokers.

---

## Acceptance Criteria

### AC #1 — Broker Eligibility

- [ ] Broker must be `isActive = true` (global broker flag).
- [ ] Broker must be `isActiveInDistribution = true` (per-distribution flag on `DistributionBroker`).
- [ ] Broker must not have reached `dailyCap` for the current day in its own timezone.
- [ ] Broker's current time (in its timezone) must be within `openingTime`–`closingTime`.
- [ ] Current day (in broker's timezone) must be in `workingDays`.

### AC #2 — Deficit Formula

Given `N` brokers each with weight `pᵢ` (percentage) and `sᵢ` leads sent today:

```
totalSentAfter = sum(sᵢ) + 1
targetᵢ        = totalSentAfter × (pᵢ / 100)
deficitᵢ       = targetᵢ − sᵢ
```

- [ ] The broker with the **highest** deficit wins.
- [ ] On tie: broker with **fewer leads sent today** wins.
- [ ] If no eligible broker exists, the lead is saved with `status = "unsent"`.

### AC #3 — Daily Cap Window

- [ ] "Today" is computed in the **broker's own timezone**.
- [ ] Leads counted for cap enforcement use `createdAt` within broker's local day (00:00–23:59).

---

## Constraints

- The formula is a pure function: `computeDeficit(broker, totalSentToday)` takes no DB calls and returns a single deficit number.
- Timezone conversions use `dayjs` with `utc`, `timezone`, and `customParseFormat` plugins.

---

## Dependencies

- **`2026_08_27_010000_broker-management`** — Brokers and their schedule config.
- **`2026_08_27_030000_distribution`** — Distribution broker percentage weights.
