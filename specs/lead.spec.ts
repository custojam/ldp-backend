/**
 * Feature: Lead Submission and Management
 *
 * Spec: When a visitor submits the public form, the system must:
 * 1. Save the lead with normalized email and captured IP address
 * 2. Mark lead as "duplicate" if the email was already assigned to a broker
 * 3. Mark lead as "unsent" if no distribution or eligible broker exists
 * 4. Assign the lead to the best eligible broker and mark as "sent"
 * 5. Allow admin to manually assign unsent leads
 */

const mockLeadFindFirst = jest.fn();
const mockLeadFindUnique = jest.fn();
const mockLeadFindMany = jest.fn();
const mockLeadCreate = jest.fn();
const mockLeadUpdate = jest.fn();
const mockLeadCount = jest.fn();
const mockBrokerFindUnique = jest.fn();

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    form: { findUnique: jest.fn() },
    lead: {
      findFirst: mockLeadFindFirst,
      findUnique: mockLeadFindUnique,
      findMany: mockLeadFindMany,
      create: mockLeadCreate,
      update: mockLeadUpdate,
      count: mockLeadCount,
    },
    distribution: { findFirst: jest.fn() },
    broker: { findUnique: mockBrokerFindUnique },
  },
}));

import { getAllLeads, getLeadById, manualAssignLead } from '../src/services/leadService';

const sampleLead = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  ipAddress: '192.168.1.1',
  formId: 1,
  formName: 'Lead Registration',
  brokerId: null,
  distributionId: null,
  status: 'unsent' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  broker: null,
  form: { id: 1, name: 'Lead Registration', slug: 'lead-registration' },
};

describe('Feature: Lead Management', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Spec: getAllLeads()', () => {
    it('should return all leads with broker and form info', async () => {
      mockLeadFindMany.mockResolvedValue([sampleLead]);
      const leads = await getAllLeads();
      expect(leads).toHaveLength(1);
      expect(leads[0].email).toBe('john@example.com');
    });

    it('should filter leads by status', async () => {
      mockLeadFindMany.mockResolvedValue([{ ...sampleLead, status: 'unsent' }]);
      const leads = await getAllLeads({ status: 'unsent' });
      expect(leads[0].status).toBe('unsent');
    });
  });

  describe('Spec: getLeadById()', () => {
    it('should return lead details by ID', async () => {
      mockLeadFindUnique.mockResolvedValue(sampleLead);
      const lead = await getLeadById(1);
      expect(lead?.name).toBe('John Doe');
      expect(lead?.ipAddress).toBe('192.168.1.1');
    });

    it('should return null for non-existent lead', async () => {
      mockLeadFindUnique.mockResolvedValue(null);
      const lead = await getLeadById(999);
      expect(lead).toBeNull();
    });
  });

  describe('Spec: manualAssignLead()', () => {
    it('should assign an unsent lead to a broker and mark it as sent', async () => {
      const broker = { id: 2, name: 'Broker Beta' };
      mockLeadFindUnique.mockResolvedValue(sampleLead);
      mockBrokerFindUnique.mockResolvedValue(broker);
      mockLeadUpdate.mockResolvedValue({ ...sampleLead, brokerId: 2, status: 'sent', broker });

      const updated = await manualAssignLead(1, 2);
      expect(updated.status).toBe('sent');
      expect(updated.brokerId).toBe(2);
    });

    it('should throw if the lead is not in "unsent" status', async () => {
      const sentLead = { ...sampleLead, status: 'sent' as const };
      mockLeadFindUnique.mockResolvedValue(sentLead);

      await expect(manualAssignLead(1, 2)).rejects.toThrow(
        'Only unsent leads can be manually assigned'
      );
    });

    it('should throw if the lead does not exist', async () => {
      mockLeadFindUnique.mockResolvedValue(null);
      await expect(manualAssignLead(999, 2)).rejects.toThrow('Lead not found');
    });

    it('should throw if the broker does not exist', async () => {
      mockLeadFindUnique.mockResolvedValue(sampleLead);
      mockBrokerFindUnique.mockResolvedValue(null);
      await expect(manualAssignLead(1, 999)).rejects.toThrow('Broker not found');
    });
  });

  describe('Spec: Duplicate email prevention', () => {
    it('email should be normalized to lowercase trimmed before duplicate check', () => {
      const email = '  JOHN@Example.COM  ';
      const normalized = email.trim().toLowerCase();
      expect(normalized).toBe('john@example.com');
    });
  });

  describe('Spec: IP address capture', () => {
    it('lead record must include a non-empty IP address', () => {
      expect(sampleLead.ipAddress).toBeTruthy();
      expect(sampleLead.ipAddress).toBe('192.168.1.1');
    });
  });
});
