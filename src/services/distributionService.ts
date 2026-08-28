import prisma from '../config/database';
import { formExists } from './formService';

export interface DistributionBrokerInput {
  brokerId: number;
  percentage: number;
  isActive?: boolean;
}

export async function getDistribution() {
  return prisma.distribution.findFirst({
    orderBy: { createdAt: 'asc' },
    include: {
      form: true,
      distributionBrokers: {
        include: { broker: true },
      },
    },
  });
}

export async function getDistributionById(id: number) {
  return prisma.distribution.findUnique({
    where: { id },
    include: {
      form: true,
      distributionBrokers: {
        include: { broker: true },
      },
      leads: {
        orderBy: { createdAt: 'desc' },
        include: { broker: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function createDistribution(name: string, brokers: DistributionBrokerInput[]) {
  const hasForm = await formExists();
  if (!hasForm) {
    throw new Error('Oops, please create a form first.');
  }

  const existingDist = await prisma.distribution.findFirst();
  if (existingDist) {
    throw new Error('A distribution already exists. Only one distribution is allowed.');
  }

  const form = await prisma.form.findFirst();
  if (!form) throw new Error('Form not found.');

  return prisma.distribution.create({
    data: {
      name,
      formId: form.id,
      distributionBrokers: {
        create: brokers.map((b) => ({
          brokerId: b.brokerId,
          percentage: b.percentage,
          isActive: b.isActive ?? true,
        })),
      },
    },
    include: {
      form: true,
      distributionBrokers: { include: { broker: true } },
    },
  });
}

export async function updateDistributionBroker(
  distributionId: number,
  brokerId: number,
  data: { percentage?: number; isActive?: boolean }
) {
  return prisma.distributionBroker.updateMany({
    where: { distributionId, brokerId },
    data,
  });
}

export async function addBrokerToDistribution(
  distributionId: number,
  brokerId: number,
  percentage: number
) {
  return prisma.distributionBroker.upsert({
    where: { distributionId_brokerId: { distributionId, brokerId } },
    update: { percentage },
    create: { distributionId, brokerId, percentage, isActive: true },
  });
}

export async function removeBrokerFromDistribution(distributionId: number, brokerId: number) {
  return prisma.distributionBroker.deleteMany({
    where: { distributionId, brokerId },
  });
}

export async function distributionExists(): Promise<boolean> {
  const dist = await prisma.distribution.findFirst();
  return !!dist;
}
