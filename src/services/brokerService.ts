import prisma from '../config/database';

export interface CreateBrokerData {
  name: string;
  isActive?: boolean;
  dailyCap?: number;
  timezone?: string;
  openingTime?: string;
  closingTime?: string;
  workingDays?: string[];
}

export async function getAllBrokers() {
  return prisma.broker.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { leads: true } },
    },
  });
}

export async function getBrokerById(id: number) {
  return prisma.broker.findUnique({
    where: { id },
    include: {
      leads: {
        orderBy: { createdAt: 'desc' },
        include: { form: { select: { name: true } } },
      },
      distributionBrokers: true,
    },
  });
}

export async function createBroker(data: CreateBrokerData) {
  return prisma.broker.create({ data });
}

export async function updateBroker(id: number, data: Partial<CreateBrokerData>) {
  return prisma.broker.update({ where: { id }, data });
}

export async function deleteBroker(id: number) {
  return prisma.broker.delete({ where: { id } });
}
