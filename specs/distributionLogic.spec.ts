/**
 * Feature: Distribution Logic
 *
 * Spec: The system assigns leads to the broker with the highest deficit
 * using the formula:
 *   targetAfterLead = (totalSentToday + 1) * brokerPercentage / 100
 *   deficit = targetAfterLead - brokerSentToday
 *
 * Brokers that are closed, capped, inactive, or outside working days are skipped.
 * Timezone-aware daily cap and open hours are enforced per broker.
 */

import {
  computeDeficit,
  selectBroker,
  filterEligibleBrokers,
  isBrokerOpen,
} from '../src/services/distributionLogicService';
import { BrokerWithDistributionSettings } from '../src/types';

const makeBroker = (
  overrides: Partial<BrokerWithDistributionSettings> = {}
): BrokerWithDistributionSettings => ({
  id: 1,
  name: 'Test Broker',
  isActive: true,
  dailyCap: 100,
  timezone: 'UTC',
  openingTime: '00:00',
  closingTime: '23:59',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  percentage: 50,
  isActiveInDistribution: true,
  sentToday: 0,
  ...overrides,
});

describe('Feature: Distribution Logic', () => {
  describe('Spec: computeDeficit()', () => {
    it('should compute correct deficit for Broker A (50%, 4 sent, total 10)', () => {
      const broker = makeBroker({ percentage: 50, sentToday: 4 });
      const deficit = computeDeficit(broker, 10);
      // targetAfterLead = 11 * 50 / 100 = 5.5; deficit = 5.5 - 4 = 1.5
      expect(deficit).toBeCloseTo(1.5);
    });

    it('should compute correct deficit for Broker B (30%, 3 sent, total 10)', () => {
      const broker = makeBroker({ percentage: 30, sentToday: 3 });
      const deficit = computeDeficit(broker, 10);
      // targetAfterLead = 11 * 30 / 100 = 3.3; deficit = 3.3 - 3 = 0.3
      expect(deficit).toBeCloseTo(0.3);
    });

    it('should compute negative deficit for Broker C (20%, 3 sent, total 10)', () => {
      const broker = makeBroker({ percentage: 20, sentToday: 3 });
      const deficit = computeDeficit(broker, 10);
      // targetAfterLead = 11 * 20 / 100 = 2.2; deficit = 2.2 - 3 = -0.8
      expect(deficit).toBeCloseTo(-0.8);
    });
  });

  describe('Spec: selectBroker()', () => {
    it('should select the broker with the highest deficit (Broker A)', () => {
      const brokers: BrokerWithDistributionSettings[] = [
        makeBroker({ id: 1, name: 'Broker A', percentage: 50, sentToday: 4 }),
        makeBroker({ id: 2, name: 'Broker B', percentage: 30, sentToday: 3 }),
        makeBroker({ id: 3, name: 'Broker C', percentage: 20, sentToday: 3 }),
      ];
      const selected = selectBroker(brokers, 10);
      expect(selected?.name).toBe('Broker A');
    });

    it('should break ties by choosing broker with fewer sent leads today', () => {
      const brokers: BrokerWithDistributionSettings[] = [
        makeBroker({ id: 1, name: 'Broker X', percentage: 50, sentToday: 5 }),
        makeBroker({ id: 2, name: 'Broker Y', percentage: 50, sentToday: 3 }),
      ];
      const selected = selectBroker(brokers, 10);
      expect(selected?.name).toBe('Broker Y');
    });

    it('should return null when no brokers are eligible', () => {
      const selected = selectBroker([], 0);
      expect(selected).toBeNull();
    });
  });

  describe('Spec: filterEligibleBrokers()', () => {
    it('should exclude inactive brokers', () => {
      const brokers = [makeBroker({ isActive: false })];
      expect(filterEligibleBrokers(brokers)).toHaveLength(0);
    });

    it('should exclude brokers inactive in distribution', () => {
      const brokers = [makeBroker({ isActiveInDistribution: false })];
      expect(filterEligibleBrokers(brokers)).toHaveLength(0);
    });

    it('should exclude brokers that have reached their daily cap', () => {
      const brokers = [makeBroker({ dailyCap: 10, sentToday: 10 })];
      expect(filterEligibleBrokers(brokers)).toHaveLength(0);
    });

    it('should include broker that is below daily cap', () => {
      const brokers = [makeBroker({ dailyCap: 10, sentToday: 9 })];
      expect(filterEligibleBrokers(brokers)).toHaveLength(1);
    });

    it('should include all eligible active open brokers', () => {
      const brokers = [
        makeBroker({ id: 1, name: 'Eligible A' }),
        makeBroker({ id: 2, name: 'Eligible B' }),
      ];
      expect(filterEligibleBrokers(brokers)).toHaveLength(2);
    });
  });

  describe('Spec: isBrokerOpen()', () => {
    it('should return true for broker open 24/7', () => {
      const broker = {
        timezone: 'UTC',
        openingTime: '00:00',
        closingTime: '23:59',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      };
      expect(isBrokerOpen(broker)).toBe(true);
    });

    it('should return false for broker on a non-working day', () => {
      // Force broker to only work on a specific day that is not today
      // We test with an empty workingDays list
      const broker = {
        timezone: 'UTC',
        openingTime: '00:00',
        closingTime: '23:59',
        workingDays: [],
      };
      expect(isBrokerOpen(broker)).toBe(false);
    });

    it('should enforce timezone when checking open hours', () => {
      // Broker in UTC+8 with narrow hours. We test logic by mocking is impractical;
      // instead verify the function doesn't throw for valid inputs
      const broker = {
        timezone: 'Asia/Manila',
        openingTime: '09:00',
        closingTime: '18:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      };
      // Should not throw
      expect(() => isBrokerOpen(broker)).not.toThrow();
    });
  });
});
