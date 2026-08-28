/**
 * Feature: Broker Management
 *
 * Spec: Admin can create, read, update, and delete brokers.
 * Each broker has a name, active status, daily cap, timezone,
 * opening/closing time, and working days.
 */

const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    broker: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

import { getAllBrokers, getBrokerById, createBroker, updateBroker, deleteBroker } from '../src/services/brokerService';

const sampleBroker = {
  id: 1,
  name: 'Broker Alpha',
  isActive: true,
  dailyCap: 50,
  timezone: 'Asia/Manila',
  openingTime: '09:00',
  closingTime: '18:00',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Feature: Broker Management', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Spec: getAllBrokers()', () => {
    it('should return a list of all brokers', async () => {
      mockFindMany.mockResolvedValue([sampleBroker]);
      const result = await getAllBrokers();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Broker Alpha');
    });

    it('should return an empty array when no brokers exist', async () => {
      mockFindMany.mockResolvedValue([]);
      const result = await getAllBrokers();
      expect(result).toHaveLength(0);
    });
  });

  describe('Spec: getBrokerById()', () => {
    it('should return a broker when a valid ID is provided', async () => {
      mockFindUnique.mockResolvedValue(sampleBroker);
      const broker = await getBrokerById(1);
      expect(broker?.id).toBe(1);
      expect(broker?.name).toBe('Broker Alpha');
    });

    it('should return null when the broker ID does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);
      const broker = await getBrokerById(999);
      expect(broker).toBeNull();
    });
  });

  describe('Spec: createBroker()', () => {
    it('should create a broker with all required fields', async () => {
      mockCreate.mockResolvedValue(sampleBroker);
      const broker = await createBroker({
        name: 'Broker Alpha',
        dailyCap: 50,
        timezone: 'Asia/Manila',
        openingTime: '09:00',
        closingTime: '18:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      });
      expect(broker.name).toBe('Broker Alpha');
      expect(broker.dailyCap).toBe(50);
    });
  });

  describe('Spec: updateBroker()', () => {
    it('should update specified broker fields', async () => {
      const updated = { ...sampleBroker, dailyCap: 100 };
      mockUpdate.mockResolvedValue(updated);
      const broker = await updateBroker(1, { dailyCap: 100 });
      expect(broker.dailyCap).toBe(100);
    });
  });

  describe('Spec: deleteBroker()', () => {
    it('should delete a broker by ID', async () => {
      mockDelete.mockResolvedValue(sampleBroker);
      await expect(deleteBroker(1)).resolves.not.toThrow();
    });
  });
});
