# Plan 2026_08_27_040000 — Distribution Logic

**Spec:** [spec.md](./spec.md)
**Status:** Done
**Created:** 2026-08-27

---

## Technical Approach

All selection logic lives in `distributionLogicService.ts` as pure or near-pure functions.
`computeDeficit()` takes a list of broker stats (no DB) and returns scored results — making it
trivially testable. `filterEligibleBrokers()` uses `isBrokerOpen()` and cap count from the DB.
`selectBroker()` orchestrates the full pipeline.

`dayjs` with `utc` + `timezone` + `customParseFormat` plugins handles all timezone conversions.
`getBrokerDayRange()` returns `{ start, end }` as UTC timestamps for "today" in the broker's
timezone, used in the Prisma `createdAt` range query for daily cap counting.

---

## Constitution Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| Business logic in services | ✅ | `distributionLogicService.ts` |
| Pure functions where possible | ✅ | `computeDeficit` is a pure function |
| TypeScript strict | ✅ | All types explicit |
| Tests | ✅ | `backend/specs/distributionLogic.spec.ts` |

---

## File Map

| Action | File | Reason |
|--------|------|--------|
| CREATE | `backend/src/services/distributionLogicService.ts` | All selection logic |

---

## Key Functions

| Function | Description |
|----------|-------------|
| `getBrokerDayRange(timezone)` | Returns UTC start/end of "today" in broker's timezone |
| `isBrokerOpen(broker, now)` | Returns boolean — checks day, opening/closing time |
| `computeDeficit(brokers, stats)` | Pure — returns scored brokers sorted by deficit |
| `filterEligibleBrokers(brokers, stats, db)` | Filters by active, cap, open hours |
| `selectBroker(distribution, db)` | Full pipeline: filter → score → pick winner |

---

## Testing Plan

| # | Test | File |
|---|------|------|
| 1 | Deficit formula: exact values match PDF example (A=+1.5, B=+0.3, C=-0.8) | `backend/specs/distributionLogic.spec.ts` |
| 2 | `selectBroker()` picks broker with highest deficit | `backend/specs/distributionLogic.spec.ts` |
| 3 | Tie-break: broker with fewer sent today wins | `backend/specs/distributionLogic.spec.ts` |
| 4 | `filterEligibleBrokers()` excludes inactive brokers | `backend/specs/distributionLogic.spec.ts` |
| 5 | `filterEligibleBrokers()` excludes brokers at daily cap | `backend/specs/distributionLogic.spec.ts` |
| 6 | `filterEligibleBrokers()` excludes brokers outside open hours | `backend/specs/distributionLogic.spec.ts` |
| 7 | `isBrokerOpen()` returns false outside working days | `backend/specs/distributionLogic.spec.ts` |
