/**
 * Feature: Lead Form Management
 *
 * Spec: Admin can create exactly ONE lead form.
 * Each form has a name and a public URL slug.
 * If a form already exists, creating another must throw an error.
 */

const mockFindFirst = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    form: {
      findFirst: mockFindFirst,
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}));

import { getForm, createForm, formExists } from '../src/services/formService';

const sampleForm = {
  id: 1,
  name: 'Lead Registration',
  slug: 'lead-registration',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Feature: Lead Form Management', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Spec: getForm()', () => {
    it('should return the existing form', async () => {
      mockFindFirst.mockResolvedValue(sampleForm);
      const form = await getForm();
      expect(form?.name).toBe('Lead Registration');
    });

    it('should return null when no form exists', async () => {
      mockFindFirst.mockResolvedValue(null);
      const form = await getForm();
      expect(form).toBeNull();
    });
  });

  describe('Spec: formExists()', () => {
    it('should return true when a form exists', async () => {
      mockFindFirst.mockResolvedValue(sampleForm);
      expect(await formExists()).toBe(true);
    });

    it('should return false when no form exists', async () => {
      mockFindFirst.mockResolvedValue(null);
      expect(await formExists()).toBe(false);
    });
  });

  describe('Spec: createForm()', () => {
    it('should create a form when none exists', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue(sampleForm);

      const form = await createForm('Lead Registration', 'lead-registration');
      expect(form.slug).toBe('lead-registration');
    });

    it('should throw an error if a form already exists (only one allowed)', async () => {
      mockFindFirst.mockResolvedValue(sampleForm);

      await expect(createForm('Another Form', 'another-form')).rejects.toThrow(
        'A form already exists'
      );
    });

    it('should throw an error if the slug is already taken', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindUnique.mockResolvedValue(sampleForm);

      await expect(createForm('New Form', 'lead-registration')).rejects.toThrow(
        'already taken'
      );
    });

    it('public URL should be accessible at /{slug}', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue(sampleForm);

      const form = await createForm('Lead Registration', 'lead-registration');
      expect(`/${form.slug}`).toBe('/lead-registration');
    });
  });
});
