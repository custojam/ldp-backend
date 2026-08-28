import prisma from '../config/database';
import { getDistribution } from './distributionService';
import {
  getBrokerDayRange,
  filterEligibleBrokers,
  selectBroker,
} from './distributionLogicService';
import { BrokerWithDistributionSettings } from '../types';

export interface SubmitLeadData {
  name: string;
  email: string;
  phone: string;
  ipAddress: string;
  formSlug: string;
}

export async function submitLead(data: SubmitLeadData) {
  const normalizedEmail = data.email.trim().toLowerCase();

  // Get form by slug
  const form = await prisma.form.findUnique({ where: { slug: data.formSlug } });
  if (!form) throw new Error('Form not found');

  // Check duplicate: has this email been previously assigned to a broker?
  const duplicateCheck = await prisma.lead.findFirst({
    where: { email: normalizedEmail, status: 'sent' },
  });

  if (duplicateCheck) {
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        phone: data.phone,
        ipAddress: data.ipAddress,
        formId: form.id,
        formName: form.name,
        status: 'duplicate',
      },
    });
    return lead;
  }

  // Check distribution
  const distribution = await getDistribution();
  if (!distribution) {
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        phone: data.phone,
        ipAddress: data.ipAddress,
        formId: form.id,
        formName: form.name,
        status: 'unsent',
      },
    });
    return lead;
  }

  // Build eligible broker list with today's sent count per broker timezone
  const brokersWithStats: BrokerWithDistributionSettings[] = await Promise.all(
    distribution.distributionBrokers.map(async (db) => {
      const broker = db.broker;
      const { start, end } = getBrokerDayRange(broker.timezone);

      const sentToday = await prisma.lead.count({
        where: {
          brokerId: broker.id,
          status: 'sent',
          createdAt: { gte: start, lte: end },
        },
      });

      const workingDays = Array.isArray(broker.workingDays)
        ? (broker.workingDays as string[])
        : (JSON.parse(broker.workingDays as unknown as string) as string[]);

      return {
        id: broker.id,
        name: broker.name,
        isActive: broker.isActive,
        dailyCap: broker.dailyCap,
        timezone: broker.timezone,
        openingTime: broker.openingTime,
        closingTime: broker.closingTime,
        workingDays: workingDays as BrokerWithDistributionSettings['workingDays'],
        percentage: db.percentage,
        isActiveInDistribution: db.isActive,
        sentToday,
      };
    })
  );

  const totalSentToday = brokersWithStats.reduce((sum, b) => sum + b.sentToday, 0);
  const eligibleBrokers = filterEligibleBrokers(brokersWithStats);
  const selectedBroker = selectBroker(eligibleBrokers, totalSentToday);

  if (!selectedBroker) {
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        phone: data.phone,
        ipAddress: data.ipAddress,
        formId: form.id,
        formName: form.name,
        distributionId: distribution.id,
        status: 'unsent',
      },
    });
    return lead;
  }

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      email: normalizedEmail,
      phone: data.phone,
      ipAddress: data.ipAddress,
      formId: form.id,
      formName: form.name,
      brokerId: selectedBroker.id,
      distributionId: distribution.id,
      status: 'sent',
    },
    include: { broker: { select: { id: true, name: true } } },
  });

  return lead;
}

export async function getAllLeads(filters?: { status?: string }) {
  return prisma.lead.findMany({
    where: filters?.status ? { status: filters.status as any } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      broker: { select: { id: true, name: true } },
      form: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function getLeadById(id: number) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      broker: { select: { id: true, name: true } },
      form: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function manualAssignLead(leadId: number, brokerId: number) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error('Lead not found');
  if (lead.status !== 'unsent') throw new Error('Only unsent leads can be manually assigned');

  const broker = await prisma.broker.findUnique({ where: { id: brokerId } });
  if (!broker) throw new Error('Broker not found');

  return prisma.lead.update({
    where: { id: leadId },
    data: { brokerId, status: 'sent' },
    include: { broker: { select: { id: true, name: true } } },
  });
}

export async function getLeadStats() {
  const [total, sent, unsent, duplicate, failed] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'sent' } }),
    prisma.lead.count({ where: { status: 'unsent' } }),
    prisma.lead.count({ where: { status: 'duplicate' } }),
    prisma.lead.count({ where: { status: 'failed' } }),
  ]);
  return { total, sent, unsent, duplicate, failed };
}
