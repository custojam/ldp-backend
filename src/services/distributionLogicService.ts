import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { BrokerWithDistributionSettings } from '../types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns current time in the broker's timezone as a dayjs object.
 */
export function getBrokerLocalTime(brokerTimezone: string): dayjs.Dayjs {
  return dayjs().tz(brokerTimezone);
}

/**
 * Returns the start and end of "today" in broker's timezone as UTC range.
 * Used for counting leads sent to the broker today.
 */
export function getBrokerDayRange(brokerTimezone: string): { start: Date; end: Date } {
  const now = dayjs().tz(brokerTimezone);
  const start = now.startOf('day').toDate();
  const end = now.endOf('day').toDate();
  return { start, end };
}

/**
 * Checks whether a broker is currently open based on its timezone and schedule.
 */
export function isBrokerOpen(broker: {
  timezone: string;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
}): boolean {
  const localTime = getBrokerLocalTime(broker.timezone);
  const dayName = DAY_NAMES[localTime.day()];

  const workingDays = Array.isArray(broker.workingDays)
    ? broker.workingDays
    : (JSON.parse(broker.workingDays as unknown as string) as string[]);

  if (!workingDays.includes(dayName)) return false;

  const currentHHMM = localTime.format('HH:mm');
  return currentHHMM >= broker.openingTime && currentHHMM < broker.closingTime;
}

/**
 * Calculates deficit for a broker under the percentage-based distribution formula.
 * deficit = ((totalSentToday + 1) * percentage / 100) - brokerSentToday
 */
export function computeDeficit(
  broker: Pick<BrokerWithDistributionSettings, 'percentage' | 'sentToday'>,
  totalSentToday: number
): number {
  const targetAfterLead = ((totalSentToday + 1) * broker.percentage) / 100;
  return targetAfterLead - broker.sentToday;
}

/**
 * Selects the best eligible broker using the deficit formula.
 * Tie-break: broker with fewer sent leads today.
 */
export function selectBroker(
  eligibleBrokers: BrokerWithDistributionSettings[],
  totalSentToday: number
): BrokerWithDistributionSettings | null {
  if (eligibleBrokers.length === 0) return null;

  let selected: BrokerWithDistributionSettings | null = null;
  let maxDeficit = -Infinity;

  for (const broker of eligibleBrokers) {
    const deficit = computeDeficit(broker, totalSentToday);

    if (
      deficit > maxDeficit ||
      (deficit === maxDeficit && selected !== null && broker.sentToday < selected.sentToday)
    ) {
      maxDeficit = deficit;
      selected = broker;
    }
  }

  return selected;
}

/**
 * Filters brokers to only those currently eligible to receive a lead.
 */
export function filterEligibleBrokers(
  brokers: BrokerWithDistributionSettings[]
): BrokerWithDistributionSettings[] {
  return brokers.filter((b) => {
    if (!b.isActive) return false;
    if (!b.isActiveInDistribution) return false;
    if (b.sentToday >= b.dailyCap) return false;
    if (!isBrokerOpen(b)) return false;
    return true;
  });
}
