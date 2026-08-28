# Task 001 — Distribution Logic Service

**Plan:** [plan.md](../plan.md)
**Status:** Done
**Depends on:** none

## What to Build

Create `distributionLogicService.ts` — a set of pure and near-pure functions that implement the
deficit-based broker selection algorithm.

## Files to Touch

- `backend/src/services/distributionLogicService.ts` — CREATE

## Implementation Notes

1. Import `dayjs` with `utc`, `timezone`, `customParseFormat` plugins.

2. `getBrokerDayRange(timezone)` — returns `{ start: Date, end: Date }` for today in the
   broker's local timezone (00:00:00 → 23:59:59), as UTC Date objects.

3. `getBrokerLocalTime(timezone)` — returns current dayjs object in broker's timezone.

4. `isBrokerOpen(broker: { timezone, openingTime, closingTime, workingDays })`:
   - Call `getBrokerLocalTime(broker.timezone)`.
   - Check current day name is in `broker.workingDays`.
   - Check `currentHHMM >= openingTime && currentHHMM < closingTime`.

5. `computeDeficit(broker: { percentage, sentToday }, totalSentToday)` — pure function returning a **single number**:
   ```
   targetAfterLead = (totalSentToday + 1) × (broker.percentage / 100)
   deficit = targetAfterLead − broker.sentToday
   ```

6. `filterEligibleBrokers(brokers: BrokerWithDistributionSettings[])`:
   - Filter `isActive === true` (global broker flag).
   - Filter `isActiveInDistribution === true` (per-distribution flag).
   - Filter `sentToday < dailyCap`.
   - Filter `isBrokerOpen(broker) === true`.
   - Note: DB queries for `sentToday` are done upstream in `leadService` before calling this.

7. `selectBroker(eligibleBrokers: BrokerWithDistributionSettings[], totalSentToday: number)`:
   - If no eligible brokers → return `null`.
   - Iterate brokers, compute `deficit` for each via `computeDeficit()`.
   - Return broker with highest deficit; tie-break: broker with fewest `sentToday`.

## Acceptance Criteria

- [ ] Deficit formula matches PDF example: A=+1.5, B=+0.3, C=-0.8.
- [ ] Highest deficit broker wins.
- [ ] Tie-break: fewer sentToday wins.
- [ ] Inactive brokers excluded.
- [ ] Capped brokers excluded.
- [ ] Closed brokers excluded (outside hours or working days).

## Tests to Write

`backend/specs/distributionLogic.spec.ts`

- Deficit values match PDF example exactly.
- `selectBroker()` picks highest deficit.
- Tie-break: fewest sent today wins.
- `filterEligibleBrokers()` excludes inactive.
- `filterEligibleBrokers()` excludes capped.
- `filterEligibleBrokers()` excludes outside hours.
- `isBrokerOpen()` false outside working days.
