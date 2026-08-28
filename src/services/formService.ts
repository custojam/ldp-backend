import prisma from '../config/database';

export async function getForm() {
  return prisma.form.findFirst({ orderBy: { createdAt: 'asc' } });
}

export async function getFormBySlug(slug: string) {
  return prisma.form.findUnique({ where: { slug } });
}

export async function createForm(name: string, slug: string) {
  const existing = await getForm();
  if (existing) {
    throw new Error('A form already exists. Only one form is allowed.');
  }

  const slugExists = await prisma.form.findUnique({ where: { slug } });
  if (slugExists) throw new Error('This slug is already taken.');

  return prisma.form.create({ data: { name, slug } });
}

export async function formExists(): Promise<boolean> {
  const form = await prisma.form.findFirst();
  return !!form;
}
