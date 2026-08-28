import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({ where: { email: 'admin@leadplatform.com' } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    await prisma.user.create({
      data: {
        email: 'admin@leadplatform.com',
        password: hashedPassword,
        name: 'Admin',
      },
    });
    console.log('Admin user seeded: admin@leadplatform.com / Admin@123');
  } else {
    console.log('Admin user already exists, skipping seed.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
