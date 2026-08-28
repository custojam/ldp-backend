/**
 * Feature: Distribution Management
 *
 * Spec: Admin can create exactly ONE distribution, linked automatically to
 * the existing form. If no form exists, creating a distribution must fail
 * with the message "Oops, please create a form first."
 */

const mockDistFindFirst = jest.fn();
const mockDistCreate = jest.fn();
const mockFormFindFirst = jest.fn();

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    distribution: {
      findFirst: mockDistFindFirst,
      create: mockDistCreate,
    },
    form: {
      findFirst: mockFormFindFirst,
    },
  },
}));

import { getDistribution, createDistribution, distributionExists } from '../src/services/distributionService';

const sampleForm = {
  id: 1,
  name: 'Lead Registration',
  slug: 'lead-registration',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleDistribution = {
  id: 1,
  name: 'Main Distribution',
  formId: 1,
  form: sampleForm,
  distributionBrokers: [],
  leads: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Feature: Distribution Management', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Spec: createDistribution() - guard: form must exist first', () => {
    it('should throw "Oops, please create a form first." when no form exists', async () => {
      mockFormFindFirst.mockResolvedValue(null);
      mockDistFindFirst.mockResolvedValue(null);

      await expect(createDistribution('Main Distribution', [])).rejects.toThrow(
        'Oops, please create a form first.'
      );
    });

    it('should create distribution and link to form when form exists', async () => {
      mockFormFindFirst.mockResolvedValue(sampleForm);
      mockDistFindFirst.mockResolvedValue(null);
      mockDistCreate.mockResolvedValue(sampleDistribution);

      const dist = await createDistribution('Main Distribution', []);
      expect(dist.formId).toBe(1);
    });

    it('should throw an error if a distribution already exists (only one allowed)', async () => {
      mockFormFindFirst.mockResolvedValue(sampleForm);
      mockDistFindFirst.mockResolvedValue(sampleDistribution);

      await expect(createDistribution('Another Distribution', [])).rejects.toThrow(
        'A distribution already exists'
      );
    });
  });

  describe('Spec: getDistribution()', () => {
    it('should return the existing distribution', async () => {
      mockDistFindFirst.mockResolvedValue(sampleDistribution);
      const dist = await getDistribution();
      expect(dist?.name).toBe('Main Distribution');
    });

    it('should return null when no distribution exists', async () => {
      mockDistFindFirst.mockResolvedValue(null);
      const dist = await getDistribution();
      expect(dist).toBeNull();
    });
  });

  describe('Spec: distributionExists()', () => {
    it('should return true when distribution exists', async () => {
      mockDistFindFirst.mockResolvedValue(sampleDistribution);
      expect(await distributionExists()).toBe(true);
    });

    it('should return false when no distribution exists', async () => {
      mockDistFindFirst.mockResolvedValue(null);
      expect(await distributionExists()).toBe(false);
    });
  });
});
