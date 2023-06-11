import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ROLES: string[] = ['admin', 'regular'];

async function seed() {
  const roles = await Promise.resolve(
    ROLES.map(async (roleVal) => {
      const role = prisma.role.upsert({
        where: { role: roleVal },
        update: {},
        create: {
          role: roleVal,
        },
      });
      return role;
    }),
  );

  const salt = bcrypt.genSaltSync();
  await prisma.user.upsert({
    where: { email: 'user@mail.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: `user`,
      password: bcrypt.hashSync('password@123', salt),
      role: {
        connect: {
          id: (await roles[0]).id,
        },
      },
    },
  });
}

seed()
  .catch((err) => {
    console.log(`Error while adding seed data: ${JSON.stringify(err)}`);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
